import { normalizeOilKey } from "@/lib/citerne-reference";
import type { Intervention } from "@/lib/types";

/**
 * Intervalle maximal recommandé entre deux vidanges « normales »,
 * selon le type d’huile et les heures de marche de l’engin (règle maintenance).
 */
export const VIDANGE_INTERVALLE_HEURES: Readonly<Record<string, number>> = {
  "Huile moteur 140": 500,
  "Huile hydraulique 466": 200,
  "Huile BV 423": 1000,
  "Huile reducteur 385": 1500,
} as const;

const RATIO_ALERTE = 0.85;

function intervallePourLubrifiant(lubrifiant: string): number | null {
  const k = normalizeOilKey(lubrifiant);
  for (const [label, h] of Object.entries(VIDANGE_INTERVALLE_HEURES)) {
    if (normalizeOilKey(label) === k) return h;
  }
  return null;
}

function toTime(isoDate: string): number {
  const t = Date.parse(`${isoDate}T12:00:00`);
  return Number.isFinite(t) ? t : 0;
}

function maxCompteurEngin(items: Intervention[]): number {
  let m = 0;
  for (const it of items) {
    const h = Number(it.compteurHoraire);
    if (Number.isFinite(h) && h > m) m = h;
  }
  return m;
}

export type DrainAnomalySeverity = "warning" | "critical";

export interface DrainIntervalAnomaly {
  id: string;
  type: "intervalle";
  severity: DrainAnomalySeverity;
  machine: string;
  lubrifiant: string;
  description: string;
  value: string;
  expected: string;
}

/**
 * Détecte les écarts à la norme de vidange (heures entre vidanges ou depuis la dernière vidange
 * vs dernier compteur horaire connu sur l’engin).
 */
export function computeDrainIntervalAnomalies(interventions: Intervention[]): DrainIntervalAnomaly[] {
  if (!interventions.length) return [];

  const byEngin = new Map<string, Intervention[]>();
  for (const it of interventions) {
    const list = byEngin.get(it.engin) ?? [];
    list.push(it);
    byEngin.set(it.engin, list);
  }

  const out: DrainIntervalAnomaly[] = [];

  for (const [engin, list] of byEngin) {
    const maxH = maxCompteurEngin(list);
    if (maxH <= 0) continue;

    const lubSet = new Set<string>();
    for (const it of list) {
      if (intervallePourLubrifiant(it.lubrifiant) != null) lubSet.add(it.lubrifiant);
    }

    for (const lub of lubSet) {
      const interval = intervallePourLubrifiant(lub);
      if (interval == null) continue;

      const vidanges = list
        .filter((i) => i.type === "Vidange" && normalizeOilKey(i.lubrifiant) === normalizeOilKey(lub))
        .sort((a, b) => {
          const ta = toTime(a.date);
          const tb = toTime(b.date);
          if (ta !== tb) return ta - tb;
          const ha = Number(a.compteurHoraire);
          const hb = Number(b.compteurHoraire);
          if (Number.isFinite(ha) && Number.isFinite(hb) && ha !== hb) return ha - hb;
          return a.id.localeCompare(b.id);
        });

      let maxGap = 0;
      for (let i = 1; i < vidanges.length; i++) {
        const h0 = Number(vidanges[i - 1]!.compteurHoraire);
        const h1 = Number(vidanges[i]!.compteurHoraire);
        if (Number.isFinite(h0) && Number.isFinite(h1) && h1 > h0) {
          maxGap = Math.max(maxGap, h1 - h0);
        }
      }

      const lastVidange = vidanges.length ? vidanges[vidanges.length - 1]! : null;
      const lastDrainH = lastVidange ? Number(lastVidange.compteurHoraire) : NaN;
      const hoursSinceLast =
        lastVidange != null && Number.isFinite(lastDrainH) ? Math.max(0, maxH - lastDrainH) : maxH;

      let severity: DrainAnomalySeverity | null = null;
      let description = "";
      let value = "";
      const expected = `≤ ${interval} h (${lub})`;

      if (vidanges.length === 0) {
        if (maxH > interval) {
          severity = "critical";
          description =
            "Aucune vidange enregistrée pour cette huile alors que le compteur dépasse l’intervalle recommandé.";
          value = `${Math.round(maxH)} h au compteur sans vidange`;
        } else if (maxH >= interval * RATIO_ALERTE) {
          severity = "warning";
          description = "Aucune vidange enregistrée ; le compteur approche l’intervalle recommandé.";
          value = `${Math.round(maxH)} h au compteur sans vidange`;
        }
      } else {
        const depasse = hoursSinceLast > interval || maxGap > interval;
        const alerte =
          hoursSinceLast >= interval * RATIO_ALERTE || maxGap >= interval * RATIO_ALERTE;

        if (depasse) {
          severity = "critical";
          if (hoursSinceLast > interval) {
            description =
              "Heures de marche depuis la dernière vidange supérieures à l’intervalle recommandé pour cette huile.";
            value = `${Math.round(hoursSinceLast)} h depuis dernière vidange`;
          } else {
            description =
              "Intervalle entre deux vidanges enregistrées supérieur à la norme (retard de maintenance).";
            value = `${Math.round(maxGap)} h entre deux vidanges`;
          }
        } else if (alerte) {
          severity = "warning";
          if (hoursSinceLast >= interval * RATIO_ALERTE) {
            description = "Proche du seuil de vidange recommandé (basé sur les heures de marche).";
            value = `${Math.round(hoursSinceLast)} h depuis dernière vidange`;
          } else {
            description = "Écart entre deux vidanges proche ou au-dessus du seuil d’alerte.";
            value = `${Math.round(maxGap)} h entre deux vidanges`;
          }
        }
      }

      if (severity) {
        out.push({
          id: `${engin}-${normalizeOilKey(lub)}`,
          type: "intervalle",
          severity,
          machine: engin,
          lubrifiant: lub,
          description,
          value,
          expected,
        });
      }
    }
  }

  const rank: Record<DrainAnomalySeverity, number> = { critical: 0, warning: 1 };
  return out.sort((a, b) => {
    if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
    return a.machine.localeCompare(b.machine, "fr");
  });
}

export function countDrainIntervalAnomalies(interventions: Intervention[]): number {
  return computeDrainIntervalAnomalies(interventions).length;
}
