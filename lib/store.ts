"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as XLSX from 'xlsx';
import { Lubrifiant, Intervention, Engin, Alerte } from './types';
import { apiRequest, apiUpload } from './api-client';
import type { GaugeOperation } from '@/lib/citerne-stock';

const LEGACY_GAUGE_STORAGE_KEY = 'ocp-jauge-operations-v1';

async function fetchAllInterventions() {
  const pageSize = 500;
  let page = 1;
  const all: any[] = [];

  // Récupère toutes les pages pour refléter tout l'import Excel.
  // L'API retourne un tableau simple, on s'arrête quand la page est incomplète.
  while (true) {
    const chunk = await apiRequest<any[]>(`/interventions?page=${page}&pageSize=${pageSize}`);
    all.push(...chunk);
    if (chunk.length < pageSize) break;
    page += 1;
  }

  return all;
}

function normalizeColumnKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function getCell(row: Record<string, unknown>, keys: string[]): unknown {
  const normalized = new Map<string, unknown>();
  Object.entries(row).forEach(([k, v]) => normalized.set(normalizeColumnKey(k), v));
  for (const key of keys) {
    const found = normalized.get(normalizeColumnKey(key));
    if (found !== undefined && found !== null && String(found).trim() !== '') return found;
  }
  return undefined;
}

function excelValueToIsoDate(value: unknown): string | null {
  if (value == null || value === '') return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return date.toISOString().slice(0, 10);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // Format dd/mm/yyyy ou dd-mm-yyyy
  const m = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  return null;
}

function parseInterventionsFromExcelRows(rows: Record<string, unknown>[]) {
  const parsed: Intervention[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2;
    const dateValue = getCell(row, ['Date']);
    const enginValue = getCell(row, ['Engin', 'Équipement', 'Equipement', 'Machine']);
    const categorieValue = getCell(row, ['Catégorie', 'Categorie']);
    const lubrifiantValue = getCell(row, ['Lubrifiant', 'Huile']);
    const typeValue = getCell(row, ['Type']);
    const quantiteValue = getCell(row, ['Quantité', 'Quantite', 'Quantité (L)', 'Quantite (L)']);
    const compteurValue = getCell(row, ['Compteur Horaire', 'Compteur', 'Heures']);
    const responsableValue = getCell(row, ['Responsable']);
    const observationValue = getCell(row, ['Observation', 'Observations', 'Commentaire']);

    const isoDate = excelValueToIsoDate(dateValue);
    const typeRaw = String(typeValue ?? '').trim().toLowerCase();
    let type: Intervention['type'] = 'Appoint';
    if (typeRaw.startsWith('vid')) type = 'Vidange';
    else if (typeRaw.startsWith('rav')) type = 'Ravitaillement';
    else if (typeRaw.startsWith('app')) type = 'Appoint';
    const quantite = Number(quantiteValue ?? 0);
    const compteurHoraire = Number(compteurValue ?? 0);

    if (!isoDate) {
      errors.push({ row: rowNumber, message: 'Date invalide ou manquante.' });
      return;
    }
    if (!enginValue || !lubrifiantValue) {
      errors.push({ row: rowNumber, message: 'Colonnes Engin/Lubrifiant manquantes.' });
      return;
    }
    if (!Number.isFinite(quantite) || quantite <= 0) {
      errors.push({ row: rowNumber, message: 'Quantité invalide (doit être > 0).' });
      return;
    }

    parsed.push({
      id: `local-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 8)}`,
      date: isoDate,
      engin: String(enginValue).trim(),
      categorie: String(categorieValue ?? 'N/A').trim() || 'N/A',
      lubrifiant: String(lubrifiantValue).trim(),
      compteurHoraire: Number.isFinite(compteurHoraire) ? compteurHoraire : 0,
      type,
      quantite,
      responsable: String(responsableValue ?? 'Non renseigné').trim() || 'Non renseigné',
      observation: String(observationValue ?? '').trim(),
    });
  });

  return { parsed, errors };
}

interface AppState {
  lubrifiants: Lubrifiant[];
  interventions: Intervention[];
  gaugeOperations: GaugeOperation[];
  engins: Engin[];
  alertes: Alerte[];
  darkMode: boolean;
  initialized: boolean;
  initializeData: () => void;
  
  // Actions Lubrifiants
  addLubrifiant: (lubrifiant: Lubrifiant) => void;
  updateLubrifiant: (id: string, updates: Partial<Lubrifiant>) => void;
  deleteLubrifiant: (id: string) => void;
  
  // Jauges citernes (persistées — base du stock physique réel par huile vrac SAP)
  addGaugeOperation: (op: GaugeOperation) => void;

  // Actions Interventions
  addIntervention: (intervention: Intervention) => void;
  importInterventions: (interventions: Intervention[]) => { imported: number; skipped: number };
  importInterventionsFile: (file: File) => Promise<{ lignes_importees: number; erreurs: Array<{ row: number; message: string }> }>;
  updateIntervention: (id: string, updates: Partial<Intervention>) => void;
  deleteIntervention: (id: string) => void;
  
  // Actions Engins
  updateEngin: (id: string, updates: Partial<Engin>) => void;
  
  // Actions Alertes
  markAlerteAsRead: (id: string) => void;
  addAlerte: (alerte: Alerte) => void;
  
  // Actions Globales
  toggleDarkMode: () => void;
  resetData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      lubrifiants: [],
      interventions: [],
      gaugeOperations: [],
      engins: [],
      alertes: [],
      darkMode: false,
      initialized: false,

      initializeData: () => {
        set({ initialized: false });
        void (async () => {
          const current = get();


        

          const [lubsR, interventionsR, categoriesR, equipementsR, alertsR, settingsR] =
            await Promise.allSettled([
              apiRequest<any[]>('/lubrifiants'),
              fetchAllInterventions(),
              apiRequest<any[]>('/categories'),
              apiRequest<any[]>('/equipements'),
              apiRequest<Array<{ type: string; message: string }>>('/alerts'),
              apiRequest<Record<string, string>>('/settings'),
            ]);

          const lubs = lubsR.status === 'fulfilled' ? lubsR.value : null;
          const interventions = interventionsR.status === 'fulfilled' ? interventionsR.value : null;
          const categories = categoriesR.status === 'fulfilled' ? categoriesR.value : [];
          const equipements = equipementsR.status === 'fulfilled' ? equipementsR.value : null;
          const alerts = alertsR.status === 'fulfilled' ? alertsR.value : null;
          const settings =
            settingsR.status === 'fulfilled' ? settingsR.value : null;

          const rejected = [
            lubsR.status === 'rejected' && 'lubrifiants',
            interventionsR.status === 'rejected' && 'interventions',
            categoriesR.status === 'rejected' && 'categories',
            equipementsR.status === 'rejected' && 'equipements',
            alertsR.status === 'rejected' && 'alerts',
            settingsR.status === 'rejected' && 'settings',
          ].filter(Boolean) as string[];

          if (rejected.length > 0) {
            console.warn(
              `[store] API indisponible — conservation des données locales (${rejected.join(', ')}).`
            );
          }

          const categoryById = new Map(
            (categories.length ? categories : []).map((c: { id: string; nom: string }) => [c.id, c.nom])
          );

          const mapLubs = (rows: typeof lubs) =>
            rows!.map((l) => ({
              id: l.id,
              nom: l.nom,
              stockActuel: Number(l.stockActuel) || 0,
              stockMinimum: Number(l.stockMin) || 0,
              stockSecurite: l.stockSecurite,
              stockMaximum: l.stockMax,
              consommationMoyenne: l.consommationMoyenne,
              delaiApprovisionnement: l.delaiApprovisionnement,
              unite: l.unite,
              prixUnitaire: Number(l.prixUnitaire) || 0,
              dateMAJ: new Date(l.derniereMiseAJour).toISOString().slice(0, 10),
            }));

          const mapInterventions = (rows: typeof interventions) =>
            rows!.map((i) => ({
              id: i.id,
              date: new Date(i.date).toISOString().slice(0, 10),
              engin: i.engin ?? i.equipement?.nom ?? i.equipementId,
categorie:
  typeof i.categorie === "string"
    ? i.categorie
    : i.categorie?.nom ?? categoryById.get(i.categorieId) ?? i.categorieId,
lubrifiant: i.lubrifiant ?? i.lubrifiant?.nom ?? i.lubrifiantId,
              compteurHoraire: Number(i.compteurHoraire) || 0,
              type: (
                i.type === 'vidange' || i.type === 'Vidange'
                  ? 'Vidange'
                  : i.type === 'ravitaillement' || i.type === 'Ravitaillement'
                    ? 'Ravitaillement'
                    : 'Appoint'
              ) as Intervention['type'],

              quantite: Number(i.quantite) || 0,
              responsable: i.responsable,
              observation: i.observation ?? '',
            }));

          const mapEngins = (rows: typeof equipements) =>
            rows!.map((e) => ({
              id: e.id,
              nom: e.nom,
              categorie: categoryById.get(e.categorieId) ?? 'N/A',
              lubrifiantRecommande: 'Huile moteur 140',
              heuresService: 0,
              statut: e.actif ? ('Actif' as const) : ('Inactif' as const),
              derniereLubrification: new Date().toISOString().slice(0, 10),
            }));

          set({
            lubrifiants: lubs ? mapLubs(lubs) : current.lubrifiants,
            interventions: interventions ? mapInterventions(interventions) : current.interventions,
            engins: equipements ? mapEngins(equipements) : current.engins,
            alertes: alerts
              ? alerts.map((a, idx) => ({
                  id: `alert-${idx}`,
                  type:
                    a.type === 'stock_critique'
                      ? 'stock_critique'
                      : a.type === 'stock_faible'
                        ? 'stock_faible'
                        : 'anomalie',
                  message: a.message,
                  date: new Date().toISOString().slice(0, 10),
                  lu: false,
                }))
              : current.alertes,
            darkMode: settings ? (settings.theme ?? 'clear') === 'sombre' : current.darkMode,
            initialized: true,
          });
        })();
      },
      
      // Actions Lubrifiants
      addLubrifiant: (lubrifiant) => {
        void (async () => {
          try {
            await apiRequest('/lubrifiants', {
              method: 'POST',
              body: JSON.stringify({
                nom: lubrifiant.nom,
                stockActuel: lubrifiant.stockActuel,
                stockMin: lubrifiant.stockMinimum,
                stockSecurite: lubrifiant.stockSecurite ?? 0,
                stockMax: lubrifiant.stockMaximum ?? lubrifiant.stockActuel,
                delaiApprovisionnement: lubrifiant.delaiApprovisionnement ?? 1,
                prixUnitaire: lubrifiant.prixUnitaire,
                unite: lubrifiant.unite,
              }),
            });
            get().initializeData();
          } catch {
            set((state) => ({ lubrifiants: [lubrifiant, ...state.lubrifiants] }));
          }
        })();
      },
      
      updateLubrifiant: (id, updates) => {
        void (async () => {
          try {
            await apiRequest(`/lubrifiants/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                nom: updates.nom,
                stockActuel: updates.stockActuel,
                stockMin: updates.stockMinimum,
                stockSecurite: updates.stockSecurite,
                stockMax: updates.stockMaximum,
                delaiApprovisionnement: updates.delaiApprovisionnement,
                prixUnitaire: updates.prixUnitaire,
                unite: updates.unite,
              }),
            });
            get().initializeData();
          } catch {
            set((state) => ({
              lubrifiants: state.lubrifiants.map((l) => (l.id === id ? { ...l, ...updates } : l)),
            }));
          }
        })();
      },
      
      deleteLubrifiant: (id) => {
        void (async () => {
          try {
            await apiRequest(`/lubrifiants/${id}`, { method: 'DELETE' });
            get().initializeData();
          } catch {
            set((state) => ({
              lubrifiants: state.lubrifiants.filter((l) => l.id !== id),
            }));
          }
        })();
      },
      
      addGaugeOperation: (op) =>
        set((state) => ({
          gaugeOperations: [op, ...state.gaugeOperations],
        })),

      // Actions Interventions
      addIntervention: (intervention) => {
        void (async () => {
          try {
            await apiRequest('/interventions', {
              method: 'POST',
              body: JSON.stringify({
                id: intervention.id,
                date: intervention.date,
                engin: intervention.engin,
                categorie: intervention.categorie,
                lubrifiant: intervention.lubrifiant,
                compteurHoraire: intervention.compteurHoraire,
                type: intervention.type,
                quantite: intervention.quantite,
                responsable: intervention.responsable,
                observation: intervention.observation ?? '',
              }),
            });
      
            get().initializeData();
          } catch {
            
            set((state) => ({
              interventions: [
                {
                  ...intervention,
                  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                },
                ...state.interventions,
              ],
            }));
          }
        })();
      },

      importInterventions: (newInterventions) => {
        const existing = new Set(
          get().interventions.map(
            (i) => `${i.date}|${i.engin}|${i.lubrifiant}|${i.type}|${Number(i.quantite).toFixed(3)}`
          )
        );
        let imported = 0;
        let skipped = 0;
        const uniqueToAdd: Intervention[] = [];

        newInterventions.forEach((i) => {
          const key = `${i.date}|${i.engin}|${i.lubrifiant}|${i.type}|${Number(i.quantite).toFixed(3)}`;
          if (existing.has(key)) {
            skipped += 1;
            return;
          }
          existing.add(key);
          uniqueToAdd.push(i);
          imported += 1;
        });

        if (uniqueToAdd.length > 0) {
          set((state) => ({
            interventions: [...uniqueToAdd, ...state.interventions],
          }));
        }

        return { imported, skipped };
      },
      importInterventionsFile: async (file) => {
        try {
          const result = await apiUpload<{
            lignes_importees: number;
            erreurs: Array<{ row: number; message: string }>;
          }>('/import/interventions', file);
          get().initializeData();
          return result;
        } catch {
          // Fallback local : import direct Excel si backend indisponible.
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
          const sheetName = wb.SheetNames[0];
          if (!sheetName) {
            return {
              lignes_importees: 0,
              erreurs: [{ row: 1, message: 'Aucune feuille trouvée dans le fichier Excel.' }],
            };
          }
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
          const { parsed, errors } = parseInterventionsFromExcelRows(rows);
          const { imported, skipped } = get().importInterventions(parsed);

          if (skipped > 0) {
            errors.push({ row: 0, message: `${skipped} ligne(s) ignorée(s) car déjà importée(s).` });
          }

          return {
            lignes_importees: imported,
            erreurs: errors,
          };
        }
      },
      
      updateIntervention: (id, updates) => {
        void (async () => {
          try {
            await apiRequest(`/interventions/${id}`, {
              method: 'PUT',
              body: JSON.stringify({
                date: updates.date,
                quantite: updates.quantite,
                compteurHoraire: updates.compteurHoraire,
                responsable: updates.responsable,
                observation: updates.observation,
              }),
            });
            get().initializeData();
          } catch {
            set((state) => ({
              interventions: state.interventions.map((i) => (i.id === id ? { ...i, ...updates } : i)),
            }));
          }
        })();
      },
      
      deleteIntervention: (id) => {
        void (async () => {
          try {
            await apiRequest(`/interventions/${id}`, { method: 'DELETE' });
            get().initializeData();
          } catch {
            set((state) => ({
              interventions: state.interventions.filter((i) => i.id !== id),
            }));
          }
        })();
      },
      
      // Actions Engins
      updateEngin: (id, updates) => set((state) => ({
        engins: state.engins.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      })),
      
      // Actions Alertes
      markAlerteAsRead: (id) => set((state) => ({
        alertes: state.alertes.map((a) =>
          a.id === id ? { ...a, lu: true } : a
        ),
      })),
      
      addAlerte: (alerte) => set((state) => ({
        alertes: [alerte, ...state.alertes],
      })),
      
      // Actions Globales
      toggleDarkMode: () => {
        const next = !get().darkMode;
        set({ darkMode: next });
        void (async () => {
          try {
            await apiRequest('/settings/theme', {
              method: 'PUT',
              body: JSON.stringify({ theme: next ? 'sombre' : 'clear' }),
            });
          } catch {
            // En mode local sans backend, on conserve le thème uniquement côté client.
          }
        })();
      },
      
      resetData: () => {
        void (async () => {
          try {
            await apiRequest('/settings/reset', { method: 'POST' });
          } catch {
            // Mode sans backend : on ignore l'erreur distante et on force le reset local.
          } finally {
            set({
              lubrifiants: [],
              interventions: [],
              gaugeOperations: [],
              engins: [],
              alertes: [],
              initialized: true,
            });
          }
        })();
      },
    }),
    {
      name: 'ocp-lubrifiant-storage',
      partialize: (state) => ({
        lubrifiants: state.lubrifiants,
        interventions: state.interventions,
        gaugeOperations: state.gaugeOperations,
        engins: state.engins,
        alertes: state.alertes,
        darkMode: state.darkMode,
        initialized: state.initialized,
      }),
      onRehydrateStorage: () => (state) => {
        migrateLegacyGaugeOperationsOnce();
        if (state && (state.interventions.length > 0 || state.lubrifiants.length > 0)) {
          useStore.setState({ initialized: true });
        }
      },
    }
  )
);

function migrateLegacyGaugeOperationsOnce() {
  if (typeof window === 'undefined') return;
  try {
    const st = useStore.getState();
    if (st.gaugeOperations.length > 0) return;
    const raw = window.localStorage.getItem(LEGACY_GAUGE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return;
    const migrated: GaugeOperation[] = parsed.map((op: Record<string, unknown>, idx: number) => ({
      id: String(op.id ?? `jauge-mig-${idx}`),
      date: String(op.date ?? new Date().toISOString().slice(0, 10)),
      lubrifiantId: String(op.lubrifiantId ?? ''),
      quantitePhysique: Number(op.quantitePhysique) || 0,
      stockSystemeAvant: Number(op.stockSystemeAvant) || 0,
      commentaire: String(op.commentaire ?? ''),
    }));
    useStore.setState({ gaugeOperations: migrated });
    window.localStorage.removeItem(LEGACY_GAUGE_STORAGE_KEY);
  } catch {
    // noop
  }
}
