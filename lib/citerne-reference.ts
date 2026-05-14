/** Références citernes (SAP / huiles vrac pilotées au même format que l’OT / l’inventaire). */

export const CITERNE_REFERENCE_KG = 24000;

export interface CiterneOilReference {
  codeSap: string;
  codeOracle: string;
  description: string;
  stockMinKg: number;
  stockMaxKg: number;
  aliases: readonly string[];
}

export const CITERNE_REFERENCE_ROWS: readonly CiterneOilReference[] = [
  {
    codeSap: "90009702",
    codeOracle: "10001.00140",
    description: "HUILE MOTEUR EN VRAC.",
    stockMinKg: 12376,
    stockMaxKg: 18565,
    aliases: ["HUILE MOTEUR EN VRAC", "Huile moteur 140"],
  },
  {
    codeSap: "90009647",
    codeOracle: "10001.00423",
    description: "HUILE REDUCTEUR SAE 30",
    stockMinKg: 5543,
    stockMaxKg: 8315,
    aliases: ["HUILE REDUCTEUR SAE 30", "Huile reducteur 385", "Huile 385"],
  },
  {
    codeSap: "90014467",
    codeOracle: "1000100466",
    description: "HUILE HYDRAULIQUE C2 SAE10W",
    stockMinKg: 10673,
    stockMaxKg: 16010,
    aliases: ["HUILE HYDRAULIQUE C2 SAE10W", "Huile hydraulique 466"],
  },
  {
    codeSap: "90014434",
    codeOracle: "1000100385",
    description: "HUILE P/TRANSMISSION MEC. SAE 80W90",
    stockMinKg: 1722,
    stockMaxKg: 2583,
    aliases: ["HUILE P/TRANSMISSION MEC. SAE 80W90", "HUILE P/ TRANSMISSION MEC. SAE 80W90", "Huile BV 423"],
  },
] as const;

export function normalizeOilKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}
