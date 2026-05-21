import { computeConsumptionReferenceAnomalies, type ConsumptionReferenceAnomaly } from "@/lib/consumption-reference-anomalies";
import {
  computeDrainIntervalAnomalies,
  type DrainIntervalAnomaly,
} from "@/lib/drain-interval-anomalies";
import type { Intervention } from "@/lib/types";

export type DashboardAnomaly = DrainIntervalAnomaly | ConsumptionReferenceAnomaly;

/**
 * Ensemble des anomalies affichées sur le tableau de bord
 * (référence OCP consommation / vidanges + écarts intervalle horaire).
 */
export function computeDashboardAnomalies(interventions: Intervention[]): DashboardAnomaly[] {
  const consumption = computeConsumptionReferenceAnomalies(interventions);
  const drain = computeDrainIntervalAnomalies(interventions);
  const rank = { critical: 0, warning: 1 } as const;

  return [...consumption, ...drain].sort((a, b) => {
    if (rank[a.severity] !== rank[b.severity]) return rank[a.severity] - rank[b.severity];
    return a.machine.localeCompare(b.machine, "fr");
  });
}

export function countDashboardAnomalies(interventions: Intervention[]): number {
  return computeDashboardAnomalies(interventions).length;
}
