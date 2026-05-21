/**
 * Références consommation / vidange OCP Benguerir (tableau de pilotage engins).
 * Seuils « normaux » : une anomalie est déclarée lorsque la consommation cumulée
 * ou le nombre de vidanges atteint ou dépasse ces valeurs.
 */

export type OilCategory = "moteur" | "hydraulique" | "bv";

export interface EnginConsumptionReference {
  engin: string;
  appointMoteurL: number | null;
  appointHydrauliqueL: number | null;
  appointBvL: number | null;
  nbVidanges: number | null;
  volVidangeMoteurL: number | null;
  /** Ex. "1x / 3 mois", "4x / 3 mois" */
  frequenceVidange: string | null;
}

/** Données issues du tableau de référence maintenance OCP. */
export const ENGIN_CONSUMPTION_REFERENCES: readonly EnginConsumptionReference[] = [
  { engin: "CH992K", appointMoteurL: 0, appointHydrauliqueL: 1008, appointBvL: 545, nbVidanges: 1, volVidangeMoteurL: 120, frequenceVidange: "1x / 3 mois" },
  { engin: "CHF1", appointMoteurL: 80, appointHydrauliqueL: 305, appointBvL: 140, nbVidanges: 1, volVidangeMoteurL: 300, frequenceVidange: "1x / 3 mois" },
  { engin: "CHF2", appointMoteurL: 0, appointHydrauliqueL: 3230, appointBvL: 540, nbVidanges: 2, volVidangeMoteurL: 600, frequenceVidange: "1x / 1.5 mois" },
  { engin: "Camion CAT (sav)", appointMoteurL: 0, appointHydrauliqueL: 0, appointBvL: 0, nbVidanges: 2, volVidangeMoteurL: 34, frequenceVidange: "1x / 1.5 mois" },
  { engin: "D11T1", appointMoteurL: 0, appointHydrauliqueL: 0, appointBvL: 70, nbVidanges: 1, volVidangeMoteurL: 106, frequenceVidange: "1x / 3 mois" },
  { engin: "D11T3", appointMoteurL: 159, appointHydrauliqueL: 358, appointBvL: 160, nbVidanges: 1, volVidangeMoteurL: 106, frequenceVidange: "1x / 3 mois" },
  { engin: "D11T5", appointMoteurL: 42, appointHydrauliqueL: 190, appointBvL: 150, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "D11T7", appointMoteurL: 39, appointHydrauliqueL: 283, appointBvL: 275, nbVidanges: 4, volVidangeMoteurL: 572, frequenceVidange: "4x / 3 mois" },
  { engin: "D9R10", appointMoteurL: 5, appointHydrauliqueL: 0, appointBvL: 215, nbVidanges: 1, volVidangeMoteurL: 45, frequenceVidange: "1x / 3 mois" },
  { engin: "D9R11", appointMoteurL: 37, appointHydrauliqueL: 105, appointBvL: 60, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "D9R2", appointMoteurL: 0, appointHydrauliqueL: 40, appointBvL: 0, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "D9R5", appointMoteurL: 12, appointHydrauliqueL: 20, appointBvL: 20, nbVidanges: 1, volVidangeMoteurL: 45, frequenceVidange: "1x / 3 mois" },
  { engin: "D9R6", appointMoteurL: 41, appointHydrauliqueL: 180, appointBvL: 441, nbVidanges: 1, volVidangeMoteurL: 45, frequenceVidange: "1x / 3 mois" },
  { engin: "D9R9", appointMoteurL: 26, appointHydrauliqueL: 245, appointBvL: 153, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "DKS", appointMoteurL: 0, appointHydrauliqueL: 0, appointBvL: 0, nbVidanges: 2, volVidangeMoteurL: 136, frequenceVidange: "1x / 1.5 mois" },
  { engin: "HELI", appointMoteurL: 0, appointHydrauliqueL: 40, appointBvL: 35, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "HYSTER-1", appointMoteurL: 0, appointHydrauliqueL: 70, appointBvL: 0, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "HYSTER-2", appointMoteurL: 0, appointHydrauliqueL: 40, appointBvL: 18, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "KOM1", appointMoteurL: 0, appointHydrauliqueL: 1725, appointBvL: 0, nbVidanges: 2, volVidangeMoteurL: 450, frequenceVidange: "1x / 1.5 mois" },
  { engin: "KOM2", appointMoteurL: 18, appointHydrauliqueL: 200, appointBvL: 0, nbVidanges: 2, volVidangeMoteurL: 440, frequenceVidange: "1x / 1.5 mois" },
  { engin: "KOM3", appointMoteurL: 0, appointHydrauliqueL: 1686, appointBvL: 0, nbVidanges: 1, volVidangeMoteurL: 220, frequenceVidange: "1x / 3 mois" },
  { engin: "PAY KO", appointMoteurL: 0, appointHydrauliqueL: 35, appointBvL: 42, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "TERX1", appointMoteurL: 16, appointHydrauliqueL: 1010, appointBvL: 0, nbVidanges: null, volVidangeMoteurL: null, frequenceVidange: null },
  { engin: "TERX2", appointMoteurL: 0, appointHydrauliqueL: 720, appointBvL: 0, nbVidanges: 1, volVidangeMoteurL: 220, frequenceVidange: "1x / 3 mois" },
  { engin: "TERX4", appointMoteurL: 20, appointHydrauliqueL: 390, appointBvL: 0, nbVidanges: 1, volVidangeMoteurL: 230, frequenceVidange: "1x / 3 mois" },
] as const;

export function normalizeEnginKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[()]/g, "");
}

const REF_BY_KEY = new Map(
  ENGIN_CONSUMPTION_REFERENCES.map((r) => [normalizeEnginKey(r.engin), r])
);

export function findEnginReference(engin: string): EnginConsumptionReference | null {
  return REF_BY_KEY.get(normalizeEnginKey(engin)) ?? null;
}

export function appointThresholdForCategory(
  ref: EnginConsumptionReference,
  category: OilCategory
): number | null {
  switch (category) {
    case "moteur":
      return ref.appointMoteurL;
    case "hydraulique":
      return ref.appointHydrauliqueL;
    case "bv":
      return ref.appointBvL;
    default:
      return null;
  }
}

export function parseFrequenceVidange(freq: string | null): { maxCount: number; periodMonths: number } | null {
  if (!freq) return null;
  const m = freq.match(/(\d+(?:[.,]\d+)?)\s*x\s*\/\s*(\d+(?:[.,]\d+)?)\s*mois/i);
  if (!m) return null;
  return {
    maxCount: parseFloat(m[1]!.replace(",", ".")),
    periodMonths: parseFloat(m[2]!.replace(",", ".")),
  };
}
