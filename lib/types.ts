// Types pour l'application de gestion des lubrifiants OCP

export interface Lubrifiant {
  id: string;
  nom: string;
  stockActuel: number;
  stockMinimum: number;
  stockSecurite?: number;
  stockMaximum?: number;
  consommationMoyenne?: number;
  delaiApprovisionnement?: number;
  unite: string;
  prixUnitaire: number;
  dateMAJ: string;
}

export interface Intervention {
  id: string;
  date: string;
  engin: string;
  categorie: string;
  lubrifiant: string;
  compteurHoraire: number;
  type: 'Vidange' | 'Appoint' | 'Ravitaillement';
  quantite: number;
  responsable: string;
  observation: string;
}

export type HealthScore = 'Bon' | 'Moyen' | 'Critique';

export interface Engin {
  id: string;
  nom: string;
  categorie: string;
  lubrifiantRecommande: string;
  heuresService: number;
  statut: 'Actif' | 'En maintenance' | 'Inactif';
  derniereLubrification: string;
  healthScore?: HealthScore;
  efficiencyIndex?: number;
  consommationMoyenne?: number;
  prochaineLubrification?: string;
}

export interface Alerte {
  id: string;
  type: 'stock_faible' | 'stock_critique' | 'maintenance' | 'anomalie';
  message: string;
  date: string;
  lu: boolean;
  lubrifiantId?: string;
  enginId?: string;
}

export interface KPI {
  label: string;
  value: number | string;
  variation?: number;
  icon: string;
  color: string;
}

export type StockStatut = 'normal' | 'faible' | 'critique';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ScheduledLubrication {
  id: string;
  enginId: string;
  enginNom: string;
  date: string;
  lubrifiant: string;
  type: 'Vidange' | 'Appoint' | 'Ravitaillement';
  quantiteEstimee: number;
  status: 'planifie' | 'complete' | 'retard';
}

export interface HeatmapData {
  engin: string;
  semaine1: number;
  semaine2: number;
  semaine3: number;
  semaine4: number;
}

export interface PredictionStock {
  lubrifiant: string;
  joursRestants: number;
  dateRupture: string;
  consommationJournaliere: number;
}

export const CATEGORY_ENGINES_MAP: Record<string, string[]> = {
  'Sendeuse': ['DKS', 'SKF1', 'SKF2'],
  'Camion 190T': ['KOM1', 'KOM2', 'KOM3'],
  'Camion 136T': ['HP21', 'HP23', 'UR131', 'UR132', 'UR134', 'TERX1', 'TERX2', 'TERX3', 'TERX4'],
  'Bulle D9R': ['D9R2', 'D9R4', 'D9R5', 'D9R6', 'D9R7', 'D9R8', 'D9R9', 'D9R10', 'D9R11'],
  'D9T': ['D11T1', 'D11T2', 'D11T3', 'D11T4', 'D11T5', 'D11T6', 'D11T7'],
  'Chargeuse': ['CH992K', 'CHF1', 'CHF2'],
  'Pay dozer': ['PAY KO 564238', 'PAY 600 W2', 'PAY 600 W3'],
  'Niveleuse': ['NIV 5 KOM', 'NIV 6 KOM', 'NIV-7 CAT'],
  'Moyens de servitude': [
    'Camion CAT (rav)',
    'Arroseur CAT',
    'Camion VOLVO',
    'PILETEUSE W1 (JOHN DEERE)',
    'PILETEUSE W2 (JOHN DEERE)',
    'MINI CH CASE W1',
    'MINI CH CASE W2',
    'LH-22',
    'HYSTER-1',
    'HYSTER-2',
    'TCM120',
    'HELI',
    'CH CASE 921 E',
    'Volvo',
  ],
};

export const CATEGORIES = Object.keys(CATEGORY_ENGINES_MAP) as readonly string[];

export const LUBRIFIANTS_TYPES = [
  'Graisse cat',
  'Huile BV 423',
  'Huile hydraulique 466',
  'Huile moteur 140',
  'Huile reducteur 385',
  'Liquide de refroidissement',
] as const;

export const ENGINS = Object.values(CATEGORY_ENGINES_MAP).flat() as readonly string[];

export const EQUIPMENT_MAPPINGS: Record<string, { categorie: string; lubrifiant: string }> = {
  'DKS': { categorie: 'Sendeuse', lubrifiant: 'Huile moteur 140' },
  'SKF1': { categorie: 'Sendeuse', lubrifiant: 'Huile hydraulique 466' },
  'SKF2': { categorie: 'Sendeuse', lubrifiant: 'Huile BV 423' },
  'KOM1': { categorie: 'Camion 190T', lubrifiant: 'Huile reducteur 385' },
  'KOM2': { categorie: 'Camion 190T', lubrifiant: 'Liquide de refroidissement' },
  'KOM3': { categorie: 'Camion 190T', lubrifiant: 'Graisse cat' },
  'HP21': { categorie: 'Camion 136T', lubrifiant: 'Huile moteur 140' },
  'D9R2': { categorie: 'Bulle D9R', lubrifiant: 'Huile moteur 140' },
  'D11T1': { categorie: 'D9T', lubrifiant: 'Huile moteur 140' },
  'CH992K': { categorie: 'Chargeuse', lubrifiant: 'Huile hydraulique 466' },
  'PAY KO 564238': { categorie: 'Pay dozer', lubrifiant: 'Huile hydraulique 466' },
  'NIV 5 KOM': { categorie: 'Niveleuse', lubrifiant: 'Huile hydraulique 466' },
  'Niv 5 KOM': { categorie: 'Niveleuse', lubrifiant: 'Huile hydraulique 466' },
  'Camion CAT (rav)': { categorie: 'Moyens de servitude', lubrifiant: 'Huile moteur 140' },
  'Camion.CAT (rav)': { categorie: 'Moyens de servitude', lubrifiant: 'Huile moteur 140' },
};
