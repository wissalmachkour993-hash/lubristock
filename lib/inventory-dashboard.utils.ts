import type { InventoryDashboardRow } from "./inventory-dashboard.types";

/** Facteur de sécurité appliqué aux seuils d'alerte. */
export const FACTEUR_SECURITE_ALERTE = 2.05;

/** Durée pendant laquelle le stock labo n'est pas disponible après réception. */
export const JOURS_QUARANTAINE_LABO = 10;

export function totalLeadTimeJours(row: InventoryDashboardRow): number {
  return row.leadTimeAchatJours + row.leadTimeReceptionJours + row.leadTimeLaboJours;
}

export function quarantaineActivee(
  row: InventoryDashboardRow,
  maintenant: Date = new Date()
): boolean {
  if (row.statutLabo !== "Stock en Analyse Labo" || !row.dateReceptionIso) return false;
  const reception = new Date(row.dateReceptionIso);
  if (Number.isNaN(reception.getTime())) return false;
  const diffMs = maintenant.getTime() - reception.getTime();
  const diffJours = diffMs / (1000 * 60 * 60 * 24);
  return diffJours >= 0 && diffJours <= JOURS_QUARANTAINE_LABO;
}

/** Stock utilisable (hors partie en quarantaine labo si fenêtre active). */
export function stockDisponibleKg(row: InventoryDashboardRow, maintenant?: Date): number {
  if (quarantaineActivee(row, maintenant)) {
    return Math.max(0, row.stockActuelKg - row.kgEnAnalyseLabo);
  }
  return row.stockActuelKg;
}

/** Seuil d'alerte renforcé (stock minimum × facteur de sécurité). */
export function seuilAlerteSecuriteKg(stockMinKg: number): number {
  return stockMinKg * FACTEUR_SECURITE_ALERTE;
}

/** Jours avant rupture estimés (basé sur stock disponible). */
export function autonomieJours(
  row: InventoryDashboardRow,
  maintenant?: Date
): number | null {
  const dispo = stockDisponibleKg(row, maintenant);
  if (row.consommationMoyenneKgJour <= 0) return null;
  return dispo / row.consommationMoyenneKgJour;
}

export function alerteStockCritique(
  row: InventoryDashboardRow,
  maintenant?: Date
): boolean {
  return stockDisponibleKg(row, maintenant) < row.stockMinKg;
}

export function alerteStockSecurite(
  row: InventoryDashboardRow,
  maintenant?: Date
): boolean {
  return stockDisponibleKg(row, maintenant) < seuilAlerteSecuriteKg(row.stockMinKg);
}

export function peutGenererDemandeAchat(row: InventoryDashboardRow): boolean {
  return row.couvertureAcc === "Couvert ACC";
}
