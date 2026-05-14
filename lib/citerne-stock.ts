import { CITERNE_REFERENCE_KG, CITERNE_REFERENCE_ROWS, normalizeOilKey } from "@/lib/citerne-reference";
import type { Intervention } from "@/lib/types";

export interface GaugeOperation {
  id: string;
  date: string;
  lubrifiantId: string;
  quantitePhysique: number;
  stockSystemeAvant: number;
  commentaire: string;
}

type TimelineEvt =
  | { kind: "gauge"; sap: string; sortKey: string; tie: number; qty: number }
  | { kind: "int"; sap: string; sortKey: string; tie: number; delta: number };

function tieFromId(id: string): number {
  const n = Number(id.replace(/\D/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Impact sur le niveau de citerne : entrée (ravitaillement) positive, vidange / appoint négatif. */
export function interventionStockDelta(interventionType: Intervention["type"], quantite: number): number {
  if (interventionType === "Ravitaillement") return quantite;
  return -Math.abs(quantite);
}

/** Associe un libellé d’huile métier au code SAP citerne, si connu. */
export function lubricantLabelToSapCode(lubrifiant: string): string | null {
  const key = normalizeOilKey(lubrifiant);
  for (const ref of CITERNE_REFERENCE_ROWS) {
    if (ref.aliases.some((a) => normalizeOilKey(a) === key)) return ref.codeSap;
  }
  return null;
}

function buildTimeline(gauges: GaugeOperation[], interventions: Intervention[]): TimelineEvt[] {
  const ev: TimelineEvt[] = [];

  for (const g of gauges) {
    ev.push({
      kind: "gauge",
      sap: g.lubrifiantId,
      sortKey: g.date,
      tie: tieFromId(g.id),
      qty: g.quantitePhysique,
    });
  }

  for (const i of interventions) {
    const sap = lubricantLabelToSapCode(i.lubrifiant);
    if (!sap) continue;
    ev.push({
      kind: "int",
      sap,
      sortKey: i.date,
      tie: tieFromId(i.id),
      delta: interventionStockDelta(i.type, i.quantite),
    });
  }

  ev.sort((a, b) => {
    if (a.sortKey !== b.sortKey) return a.sortKey.localeCompare(b.sortKey);
    if (a.kind !== b.kind) return a.kind === "gauge" ? -1 : 1;
    return a.tie - b.tie;
  });

  return ev;
}

/**
 * Rejoue la chronologie jauges + interventions et retourne le stock courant (kg) par code SAP citerne.
 * Une jauge fixe le stock réel à l’instant T ; les mouvements suivants l’ajustent jusqu’à la prochaine jauge.
 */
export function computeCiterneStockBySap(gauges: GaugeOperation[], interventions: Intervention[]): Map<string, number> {
  const timeline = buildTimeline(gauges, interventions);
  const stock = new Map<string, number>();

  for (const e of timeline) {
    if (e.kind === "gauge") {
      stock.set(e.sap, Math.max(0, e.qty));
      continue;
    }
    const prev = stock.get(e.sap) ?? CITERNE_REFERENCE_KG;
    stock.set(e.sap, Math.max(0, prev + e.delta));
  }

  return stock;
}

export function getCiterneStockKg(sap: string, gauges: GaugeOperation[], interventions: Intervention[]): number {
  return computeCiterneStockBySap(gauges, interventions).get(sap) ?? CITERNE_REFERENCE_KG;
}

/** Points pour courbe d’évolution du stock d’une citerne (après chaque événement). */
export function buildCiterneStockSeries(
  sap: string,
  gauges: GaugeOperation[],
  interventions: Intervention[],
  opts?: { maxPoints?: number }
): Array<{ date: string; stockKg: number; label?: string }> {
  const maxPoints = opts?.maxPoints ?? 120;
  const timeline = buildTimeline(gauges, interventions).filter((e) => e.sap === sap);

  let level = CITERNE_REFERENCE_KG;
  const points: Array<{ date: string; stockKg: number; label?: string }> = [];

  if (timeline.length === 0) {
    points.push({ date: "---", stockKg: level });
    return points.slice(-maxPoints);
  }

  for (const e of timeline) {
    if (e.kind === "gauge") {
      level = Math.max(0, e.qty);
      points.push({ date: e.sortKey, stockKg: level, label: "Jauge" });
    } else {
      level = Math.max(0, level + e.delta);
      points.push({ date: e.sortKey, stockKg: level });
    }
  }

  return points.slice(-maxPoints);
}
