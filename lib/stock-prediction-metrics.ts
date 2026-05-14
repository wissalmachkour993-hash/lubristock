import { CITERNE_REFERENCE_KG, CITERNE_REFERENCE_ROWS, normalizeOilKey } from "@/lib/citerne-reference";
import { computeCiterneStockBySap } from "@/lib/citerne-stock";
import type { GaugeOperation } from "@/lib/citerne-stock";
import type { Intervention, Lubrifiant } from "@/lib/types";
import { LUBRIFIANTS_TYPES } from "@/lib/types";

/** Délai d’approvisionnement fixé pour tous les lubrifiants (règle métier). */
export const STOCK_LEAD_TIME_JOURS = 21;

/** Fenêtre glissante pour lisser la consommation journalière à partir des sorties terrain. */
export const ANALYSE_CONSO_FENETRE_JOURS = 90;

/** Exclus du pilotage rupture (cartes non affichées). */
const PILOTAGE_EXCLUS = new Set(["Graisse cat", "Liquide de refroidissement"]);

function matchesLubricantLabel(lubrifiantIntervention: string, labels: Iterable<string>): boolean {
  const k = normalizeOilKey(lubrifiantIntervention);
  for (const label of labels) {
    if (normalizeOilKey(label) === k) return true;
  }
  return false;
}

/** Estimation conso jour à partir des sorties (Vidange + Appoint) sur fenêtre récente. */
export function consommationJournaliereEstimee(
  interventions: Intervention[],
  lubrifiantDisplayNames: readonly string[],
  fenêtreJours: number = ANALYSE_CONSO_FENETRE_JOURS
): number {
  const now = Date.now();
  const cutoffMs = now - fenêtreJours * 86400000;
  let volumeSortie = 0;
  let lastTs = cutoffMs;

  for (const it of interventions) {
    if (it.type === "Ravitaillement") continue;
    const t = Date.parse(`${it.date}T12:00:00`);
    if (!Number.isFinite(t) || t < cutoffMs) continue;
    if (!matchesLubricantLabel(it.lubrifiant, lubrifiantDisplayNames)) continue;
    const q = Number(it.quantite);
    if (!Number.isFinite(q)) continue;
    volumeSortie += q;
    if (t > lastTs) lastTs = t;
  }

  if (volumeSortie <= 0) return 0;

  const joursObservation = Math.min(
    fenêtreJours,
    Math.max(1, Math.ceil((Math.min(now, lastTs) - cutoffMs) / 86400000) || 14)
  );
  return volumeSortie / Math.max(joursObservation, fenêtreJours * 0.25);
}

export type AlertePilotageStock = "critique" | "attention" | "ok";

export interface PilotageStockRow {
  libelle: string;
  codeSap?: string;
  codeOracle?: string;
  unite: string;
  stockActuel: number;
  stockMin: number;
  stockMax: number;
  pctPlageMiniMax: number;
  consoJournaliere: number;
  besoinLeadTime: number;
  joursRestants: number | null;
  dateRuptureIso: string | null;
  alerte: AlertePilotageStock;
}

function addDaysISO(isoAnchor: Date, deltaJours: number): string {
  const d = new Date(isoAnchor.getTime());
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + deltaJours);
  return d.toISOString().slice(0, 10);
}

function resolveCiterneRowForType(lubrifiantType: string) {
  return CITERNE_REFERENCE_ROWS.find((r) => r.aliases.some((a) => normalizeOilKey(a) === normalizeOilKey(lubrifiantType)));
}

export function buildPilotageStockRows(
  interventions: Intervention[],
  lubrifiants: Lubrifiant[],
  gaugeOperations: GaugeOperation[],
  opts?: {
    fenêtreConso?: number;
    leadTimeJours?: number;
  }
): PilotageStockRow[] {
  const fenêtre = opts?.fenêtreConso ?? ANALYSE_CONSO_FENETRE_JOURS;
  const LT = opts?.leadTimeJours ?? STOCK_LEAD_TIME_JOURS;

  const stockBySap = computeCiterneStockBySap(gaugeOperations, interventions);
  const rows: PilotageStockRow[] = [];
  const today = new Date();

  for (const typeName of LUBRIFIANTS_TYPES) {
    if (PILOTAGE_EXCLUS.has(typeName)) continue;
    const ref = resolveCiterneRowForType(typeName);
    const lubStore = lubrifiants.find((l) => normalizeOilKey(l.nom) === normalizeOilKey(typeName));

    const labels = ref ? [...ref.aliases] : [typeName];
    const conso = consommationJournaliereEstimee(interventions, labels, fenêtre);

    let stockActuel: number;
    let stockMin: number;
    let stockMax: number;
    let unite: string;
    let codeSap: string | undefined;
    let codeOracle: string | undefined;

    if (ref) {
      stockActuel = stockBySap.get(ref.codeSap) ?? CITERNE_REFERENCE_KG;
      stockMin = ref.stockMinKg;
      stockMax = ref.stockMaxKg;
      unite = "kg";
      codeSap = ref.codeSap;
      codeOracle = ref.codeOracle;
    } else {
      stockActuel =
        lubStore != null ? Number(lubStore.stockActuel) || 0 : consommationDepuisFluxSeul(interventions, labels);
      stockMin = lubStore != null ? Number(lubStore.stockMinimum) || 10 : deriveSeuilApprox(typeName).min;
      stockMax =
        lubStore != null ? Number(lubStore.stockMaximum) || Math.max(stockMin * 2, 500) : deriveSeuilApprox(typeName).max;
      unite = lubStore?.unite ?? "L";
    }

    const besoinLeadTime = conso * LT;
    const joursRestants = conso > 1e-9 ? Math.max(0, Math.floor(stockActuel / conso)) : null;
    const dateRuptureIso = joursRestants !== null ? addDaysISO(today, joursRestants) : null;

    const pctPlageMiniMax =
      stockMax <= stockMin
        ? stockActuel >= stockMin
          ? 100
          : 0
        : Math.min(115, Math.max(-5, ((stockActuel - stockMin) / (stockMax - stockMin)) * 100));

    const { alerte } = resolveAlertes({
      stockActuel,
      stockMin,
      stockMax,
      besoinLeadTime,
    });

    rows.push({
      libelle: typeName,
      codeSap,
      codeOracle,
      unite,
      stockActuel,
      stockMin,
      stockMax,
      pctPlageMiniMax,
      consoJournaliere: conso,
      besoinLeadTime,
      joursRestants,
      dateRuptureIso,
      alerte,
    });
  }

  return rows.sort((a, b) => {
    const rank = { critique: 0, attention: 1, ok: 2 } as const;
    if (rank[a.alerte] !== rank[b.alerte]) return rank[a.alerte] - rank[b.alerte];
    const ja = a.joursRestants ?? 99999;
    const jb = b.joursRestants ?? 99999;
    return ja - jb;
  });
}

function deriveSeuilApprox(typeName: string): { min: number; max: number } {
  const n = normalizeOilKey(typeName);
  if (n.includes("graisse")) return { min: 80, max: 700 };
  if (n.includes("refroidissement") || n.includes("liquide")) return { min: 80, max: 500 };
  return { min: 100, max: 800 };
}

function consommationDepuisFluxSeul(interventions: Intervention[], labels: readonly string[]): number {
  const sorties = interventions.filter(
    (i) => i.type !== "Ravitaillement" && matchesLubricantLabel(i.lubrifiant, labels)
  );
  const entrants = interventions.filter((i) => i.type === "Ravitaillement" && matchesLubricantLabel(i.lubrifiant, labels));
  const sOut = sorties.reduce((acc, x) => acc + Number(x.quantite || 0), 0);
  const sIn = entrants.reduce((acc, x) => acc + Number(x.quantite || 0), 0);
  return Math.max(0, Math.round(sIn - sOut));
}

function resolveAlertes(args: {
  stockActuel: number;
  stockMin: number;
  stockMax: number;
  besoinLeadTime: number;
}): { alerte: AlertePilotageStock } {
  const { stockActuel, stockMin, stockMax, besoinLeadTime } = args;

  const risqueDurantLt = besoinLeadTime > 1e-6 && stockActuel <= besoinLeadTime;
  if (stockActuel <= stockMin || risqueDurantLt) {
    return { alerte: "critique" };
  }

  const seuilAttention = stockMin + Math.max(stockMax - stockMin, 1e-6) * 0.2;
  if (stockActuel <= seuilAttention || (besoinLeadTime > 1e-6 && stockActuel <= besoinLeadTime * 1.35)) {
    return { alerte: "attention" };
  }

  return { alerte: "ok" };
}
