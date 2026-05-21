import { countDashboardAnomalies } from "./dashboard-anomalies";
import { Intervention, Lubrifiant } from "./types";

const MONTHS_FR = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

function toDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function computeMonthlyConsumption(interventions: Intervention[]) {
  const now = new Date();
  const data = Array.from({ length: 12 }, (_, month) => {
    const yearOffset = month > now.getMonth() ? 1 : 0;
    return {
      year: now.getFullYear() - yearOffset,
      month,
      monthLabel: MONTHS_FR[month],
      vidange: 0,
      appoint: 0,
      ravitaillement: 0,
    };
  });

  interventions.forEach((item) => {
    const date = toDate(item.date);
    if (!date) return;
    const q = Number(item.quantite);
    const quantite = Number.isFinite(q) ? q : 0;
    const bucket = data.find((row) => row.year === date.getFullYear() && row.month === date.getMonth());
    if (!bucket) return;
    if (item.type === "Vidange") bucket.vidange += quantite;
    else if (item.type === "Appoint") bucket.appoint += quantite;
    else if (item.type === "Ravitaillement") bucket.ravitaillement += quantite;
  });

  return data.map((row) => ({
    mois: row.monthLabel,
    vidange: Math.round(row.vidange),
    appoint: Math.round(row.appoint),
    ravitaillement: Math.round(row.ravitaillement),
  }));
}

export function computeVariationByLubricant(lubrifiants: Lubrifiant[], interventions: Intervention[]) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonth = prevDate.getMonth();

  return lubrifiants.map((lub) => {
    let current = 0;
    let previous = 0;
  interventions.forEach((item) => {
    if (item.lubrifiant !== lub.nom) return;
    const date = toDate(item.date);
    if (!date) return;
    const q = Number(item.quantite);
    const quantite = Number.isFinite(q) ? q : 0;
    if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
      current += quantite;
    } else if (date.getFullYear() === prevYear && date.getMonth() === prevMonth) {
      previous += quantite;
    }
  });

    const variation = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
    return {
      name: lub.nom.length > 12 ? `${lub.nom.slice(0, 12)}...` : lub.nom,
      variation: Number(variation.toFixed(1)),
      current,
      previous,
    };
  });
}

export function computeDistributionByLubricant(interventions: Intervention[]) {
  const totals = new Map<string, number>();
  interventions.forEach((item) => {
    const q = Number(item.quantite);
    const quantite = Number.isFinite(q) ? q : 0;
    totals.set(item.lubrifiant, (totals.get(item.lubrifiant) ?? 0) + quantite);
  });
  const total = Array.from(totals.values()).reduce((acc, value) => acc + value, 0);
  const palette = ["#1447E6", "#0088bb", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
      rawValue: value,
      color: palette[index % palette.length],
    }));
}

export function computeTopEquipments(interventions: Intervention[], limit = 5) {
  const grouped = new Map<string, { consommation: number; maxHeures: number }>();

  interventions.forEach((item) => {
    const current = grouped.get(item.engin) ?? { consommation: 0, maxHeures: 0 };
    const q = Number(item.quantite);
    const h = Number(item.compteurHoraire);
    current.consommation += Number.isFinite(q) ? q : 0;
    current.maxHeures = Math.max(current.maxHeures, Number.isFinite(h) ? h : 0);
    grouped.set(item.engin, current);
  });

  return Array.from(grouped.entries())
    .map(([engin, values]) => ({
      engin,
      consommation: Math.round(values.consommation),
      heures: values.maxHeures,
    }))
    .sort((a, b) => b.consommation - a.consommation)
    .slice(0, limit);
}

export function computeCategoryConsumption(interventions: Intervention[]) {
  const grouped = new Map<string, number>();
  interventions.forEach((item) => {
    const q = Number(item.quantite);
    const quantite = Number.isFinite(q) ? q : 0;
    grouped.set(item.categorie, (grouped.get(item.categorie) ?? 0) + quantite);
  });

  return Array.from(grouped.entries())
    .map(([categorie, consommation]) => ({ categorie, consommation: Math.round(consommation) }))
    .sort((a, b) => b.consommation - a.consommation);
}

/** Nombre d’anomalies (référence OCP + écarts intervalle vidange horaire). */
export function computeAnomalyCount(interventions: Intervention[]) {
  return countDashboardAnomalies(interventions);
}

export function computeDashboardKPIs(lubrifiants: Lubrifiant[], interventions: Intervention[], machinesActives: number) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);

  let currentMonthConsumption = 0;
  let previousMonthConsumption = 0;
  let currentMonthInterventions = 0;
  let previousMonthInterventions = 0;

  interventions.forEach((item) => {
    const date = toDate(item.date);
    if (!date) return;
    const q = Number(item.quantite);
    const quantite = Number.isFinite(q) ? q : 0;
    const isCurrent = date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    const isPrevious =
      date.getFullYear() === previousMonthDate.getFullYear() &&
      date.getMonth() === previousMonthDate.getMonth();
    if (isCurrent) {
      currentMonthConsumption += quantite;
      currentMonthInterventions += 1;
    }
    if (isPrevious) {
      previousMonthConsumption += quantite;
      previousMonthInterventions += 1;
    }
  });

  const stockTotal = lubrifiants.reduce((acc, lub) => {
    const s = Number(lub.stockActuel);
    return acc + (Number.isFinite(s) ? s : 0);
  }, 0);

  const hoursSum = interventions.reduce((acc, item) => {
    const h = Number(item.compteurHoraire);
    return acc + (Number.isFinite(h) ? h : 0);
  }, 0);
  const hoursAverage = interventions.length ? Math.round(hoursSum / interventions.length) : 0;

  const consumptionVariationRaw =
    previousMonthConsumption === 0
      ? currentMonthConsumption > 0
        ? 100
        : 0
      : ((currentMonthConsumption - previousMonthConsumption) / previousMonthConsumption) * 100;
  const interventionVariationRaw =
    previousMonthInterventions === 0
      ? currentMonthInterventions > 0
        ? 100
        : 0
      : ((currentMonthInterventions - previousMonthInterventions) / previousMonthInterventions) * 100;

  const consumptionVariation = Number(consumptionVariationRaw.toFixed(1));
  const interventionVariation = Number(interventionVariationRaw.toFixed(1));

  return {
    stockTotal,
    currentMonthConsumption: Math.round(currentMonthConsumption),
    machinesActives,
    anomalies: computeAnomalyCount(interventions),
    /** Interventions enregistrées sur le mois civil en cours (aligné sur le libellé du KPI). */
    totalInterventions: currentMonthInterventions,
    hoursAverage,
    consumptionVariation: Number.isFinite(consumptionVariation) ? consumptionVariation : 0,
    interventionVariation: Number.isFinite(interventionVariation) ? interventionVariation : 0,
  };
}
