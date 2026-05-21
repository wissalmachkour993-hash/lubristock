import { normalizeOilKey } from "@/lib/citerne-reference";
import {
  appointThresholdForCategory,
  findEnginReference,
  normalizeEnginKey,
  parseFrequenceVidange,
  type OilCategory,
} from "@/lib/engin-consumption-reference";
import type { Intervention } from "@/lib/types";

export type ConsumptionAnomalySeverity = "warning" | "critical";

export interface ConsumptionReferenceAnomaly {
  id: string;
  type: "consommation" | "vidange_frequence";
  severity: ConsumptionAnomalySeverity;
  machine: string;
  lubrifiant: string;
  description: string;
  value: string;
  expected: string;
}

const RATIO_ALERTE = 0.85;

function toTime(isoDate: string): number {
  const t = Date.parse(`${isoDate}T12:00:00`);
  return Number.isFinite(t) ? t : 0;
}

function isRavitaillement(it: Intervention): boolean {
  return it.type === "Appoint" || it.type === "Ravitaillement";
}

/** Catégorie d’huile pour comparaison au tableau de référence. */
export function oilCategoryFromLubrifiant(lubrifiant: string): OilCategory | null {
  const k = normalizeOilKey(lubrifiant);
  if (k.includes("moteur") || k.includes("140")) return "moteur";
  if (k.includes("hydraul") || k.includes("466")) return "hydraulique";
  if (k.includes("bv") || k.includes("423") || k.includes("transmission") || k.includes("reducteur") || k.includes("385")) {
    return "bv";
  }
  return null;
}

function categoryLabel(c: OilCategory): string {
  if (c === "moteur") return "huile moteur";
  if (c === "hydraulique") return "huile hydraulique";
  return "huile BV";
}

function sumAppointSinceLastVidange(
  list: Intervention[],
  engin: string,
  category: OilCategory
): { sum: number; sinceLabel: string } {
  const sorted = [...list]
    .filter((i) => i.engin === engin)
    .sort((a, b) => toTime(a.date) - toTime(b.date) || a.id.localeCompare(b.id));

  let lastVidangeTime = 0;
  for (const it of sorted) {
    if (it.type !== "Vidange") continue;
    const cat = oilCategoryFromLubrifiant(it.lubrifiant);
    if (cat === category) lastVidangeTime = toTime(it.date);
  }

  let sum = 0;
  for (const it of sorted) {
    if (!isRavitaillement(it)) continue;
    if (toTime(it.date) < lastVidangeTime) continue;
    const cat = oilCategoryFromLubrifiant(it.lubrifiant);
    if (cat !== category) continue;
    const q = Number(it.quantite);
    if (Number.isFinite(q)) sum += q;
  }

  const sinceLabel =
    lastVidangeTime > 0
      ? "depuis la dernière vidange"
      : "cumul (aucune vidange enregistrée sur cette huile)";

  return { sum, sinceLabel };
}

function countVidangesInMonths(list: Intervention[], engin: string, months: number, now: number): Intervention[] {
  const cutoff = now - months * 30.44 * 24 * 60 * 60 * 1000;
  return list.filter(
    (i) =>
      i.engin === engin &&
      i.type === "Vidange" &&
      toTime(i.date) >= cutoff
  );
}

/**
 * Anomalies basées sur le tableau de référence OCP (appoints cumulés et fréquence / nb vidanges).
 * Recalculé à chaque affichage à partir de toutes les interventions (donc à chaque nouvel enregistrement).
 */
export function computeConsumptionReferenceAnomalies(
  interventions: Intervention[]
): ConsumptionReferenceAnomaly[] {
  if (!interventions.length) return [];

  const byEngin = new Map<string, Intervention[]>();
  for (const it of interventions) {
    const arr = byEngin.get(it.engin) ?? [];
    arr.push(it);
    byEngin.set(it.engin, arr);
  }

  const now = Date.now();
  const out: ConsumptionReferenceAnomaly[] = [];

  for (const [engin, list] of byEngin) {
    const ref = findEnginReference(engin);
    if (!ref) continue;

    const categories = new Set<OilCategory>();
    for (const it of list) {
      if (!isRavitaillement(it) && it.type !== "Vidange") continue;
      const cat = oilCategoryFromLubrifiant(it.lubrifiant);
      if (cat) categories.add(cat);
    }

    for (const category of categories) {
      const threshold = appointThresholdForCategory(ref, category);
      if (threshold == null || threshold <= 0) continue;

      const { sum, sinceLabel } = sumAppointSinceLastVidange(list, engin, category);
      const label = categoryLabel(category);

      if (sum >= threshold) {
        out.push({
          id: `cons-ref-${normalizeEnginKey(engin)}-${category}-crit`,
          type: "consommation",
          severity: "critical",
          machine: engin,
          lubrifiant: label,
          description: `Consommation cumulée des appoints (${label}) ${sinceLabel} : seuil de référence OCP atteint ou dépassé.`,
          value: `${sum.toFixed(1)} L`,
          expected: `≤ ${threshold} L (réf. appoint)`,
        });
      } else if (sum >= threshold * RATIO_ALERTE) {
        out.push({
          id: `cons-ref-${normalizeEnginKey(engin)}-${category}-warn`,
          type: "consommation",
          severity: "warning",
          machine: engin,
          lubrifiant: label,
          description: `Consommation cumulée des appoints (${label}) proche du seuil de référence OCP (${sinceLabel}).`,
          value: `${sum.toFixed(1)} L`,
          expected: `≤ ${threshold} L (réf. appoint)`,
        });
      }
    }

    if (ref.nbVidanges != null && ref.nbVidanges > 0) {
      const freq = parseFrequenceVidange(ref.frequenceVidange);
      const periodMonths = freq?.periodMonths ?? 3;
      const vidangesInPeriod = countVidangesInMonths(list, engin, periodMonths, now);

      if (vidangesInPeriod.length > ref.nbVidanges) {
        out.push({
          id: `vid-ref-${normalizeEnginKey(engin)}-nb`,
          type: "vidange_frequence",
          severity: "critical",
          machine: engin,
          lubrifiant: "Vidanges (toutes huiles)",
          description: `Nombre de vidanges sur ${periodMonths.toFixed(1).replace(/\.0$/, "")} mois : dépasse la référence OCP (nb vidanges).`,
          value: `${vidangesInPeriod.length} vidange(s)`,
          expected: `≤ ${ref.nbVidanges} (réf. période)`,
        });
      } else if (vidangesInPeriod.length === ref.nbVidanges) {
        out.push({
          id: `vid-ref-${normalizeEnginKey(engin)}-nb-warn`,
          type: "vidange_frequence",
          severity: "warning",
          machine: engin,
          lubrifiant: "Vidanges (toutes huiles)",
          description: `Nombre de vidanges sur la période : seuil de référence OCP atteint.`,
          value: `${vidangesInPeriod.length} vidange(s)`,
          expected: `≤ ${ref.nbVidanges} (réf. période)`,
        });
      }

      if (freq && vidangesInPeriod.length > freq.maxCount) {
        out.push({
          id: `vid-ref-${normalizeEnginKey(engin)}-freq`,
          type: "vidange_frequence",
          severity: "critical",
          machine: engin,
          lubrifiant: vidangesInPeriod[vidangesInPeriod.length - 1]?.lubrifiant ?? "Vidange",
          description: `Fréquence de vidange dépassée par rapport à la norme (${ref.frequenceVidange}).`,
          value: `${vidangesInPeriod.length} en ${periodMonths} mois`,
          expected: `≤ ${freq.maxCount}x / ${periodMonths} mois`,
        });
      }
    }
  }

  const rank: Record<ConsumptionAnomalySeverity, number> = { critical: 0, warning: 1 };
  return out.sort((a, b) => {
    if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
    return a.machine.localeCompare(b.machine, "fr");
  });
}

export function countConsumptionReferenceAnomalies(interventions: Intervention[]): number {
  return computeConsumptionReferenceAnomalies(interventions).length;
}
