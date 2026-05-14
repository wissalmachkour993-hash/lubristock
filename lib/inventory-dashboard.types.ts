/** Lignes du pilotage stock avancé (SAP / Oracle / logistique). */

export type CouvertureAcc = "Couvert ACC" | "Non couvert ACC";

export type ClassificationStock = "Critique" | "Fast";

export type StatutLabo = "Disponible" | "Stock en Analyse Labo";

export interface InventoryDashboardRow {
  codeSap: string;
  codeOracle: string;
  description: string;
  stockMinKg: number;
  stockMaxKg: number;
  stockActuelKg: number;
  consommationMoyenneKgJour: number;
  leadTimeAchatJours: number;
  leadTimeReceptionJours: number;
  leadTimeLaboJours: number;
  couvertureAcc: CouvertureAcc;
  classification: ClassificationStock;
  /** Date ISO de la dernière réception (pour fenêtre quarantaine 10 j). */
  dateReceptionIso: string | null;
  /** Quantité en analyse labo (non disponible si quarantaine active). */
  kgEnAnalyseLabo: number;
  statutLabo: StatutLabo;
}
