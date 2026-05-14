import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Intervention, Lubrifiant } from "./types";
import { getOtHistory } from "./ot-history";

const OT_UNIT_PRICE_FALLBACK = 22;
const REPORT_VERSION = "v1.0 – CONFIDENTIEL";
const POSTE_TRAVAIL_PRINCIPAL = "G-MB-SS SECTION STATION SERVICE";
const DIVISION_POSTE = "BM01 - MINE BENGUERIR";

/** Thème visuel du rapport PDF (teal industriel + accents ambre). */
const THEME = {
  /** Titres principaux */
  primary: [15, 77, 92] as [number, number, number],
  /** Sous-titres & légendes */
  secondary: [71, 105, 119] as [number, number, number],
  /** En-têtes de tableaux */
  header: [4, 116, 110] as [number, number, number],
  /** Colonne libellés (métadonnées) */
  labelBg: [236, 253, 245] as [number, number, number],
  /** Fond lignes alternées */
  rowAlt: [248, 250, 252] as [number, number, number],
  /** Bordures */
  border: [203, 213, 225] as [number, number, number],
  /** Accent graphiques / courbes */
  accent: [217, 119, 6] as [number, number, number],
  /** Barres histogramme */
  bar: [45, 138, 126] as [number, number, number],
  /** Ligne moyenne */
  meanLine: [194, 65, 12] as [number, number, number],
  /** Bandeau haut de page */
  pageHeaderBg: [240, 253, 250] as [number, number, number],
  /** Zone graphique */
  chartPanel: [252, 252, 253] as [number, number, number],
} as const;

const ENGIN_LINE_COLORS: [number, number, number][] = [
  [13, 148, 136],
  [217, 119, 6],
  [79, 70, 229],
  [219, 39, 119],
  [5, 150, 105],
];

const NB_JOURS = 7;

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseInterventionDate(iso: string): Date | null {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fenêtre glissante : 7 jours calendaires inclus (du jour J-6 00:00 au jour J 23:59). */
function getSevenDayWindow(): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (NB_JOURS - 1), 0, 0, 0, 0);
  return { start, end };
}

function inSevenDayWindow(d: Date, start: Date, end: Date): boolean {
  return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}

function formatShort(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

async function addOcpLogo(doc: jsPDF, x = 8, y = 2, w = 28, h = 24) {
  if (typeof window === "undefined") return;
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 256;
      canvas.height = img.naturalHeight || 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve();
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngData = canvas.toDataURL("image/png");
      doc.addImage(pngData, "PNG", x, y, w, h, undefined, "FAST");
      resolve();
    };
    img.onerror = () => resolve();
    img.src = "/api/landing-images/ocp";
  });
}

function isConsumptionIntervention(i: Intervention): boolean {
  return i.type === "Vidange" || i.type === "Appoint";
}

export interface SevenDayReportData {
  start: Date;
  end: Date;
  /** Index 0 = premier jour de la fenêtre */
  dailyTotals: number[];
  dayLabels: string[];
  /** [jour][engin] pour top 5 */
  dailyByEngin: number[][];
  topEngins: string[];
  totalWeekKg: number;
  avgDailyKg: number;
  topConsumerEngin: string;
  topConsumerKg: number;
  otCount: number;
  otQtyKg: number;
  otBudgetMad: number;
  avgOtPricePerKg: number;
}

export function computeSevenDayReport(
  interventions: Intervention[],
  lubrifiants: Lubrifiant[]
): SevenDayReportData {
  const { start, end } = getSevenDayWindow();

  const filtered = interventions.filter((it) => {
    if (!isConsumptionIntervention(it)) return false;
    const d = parseInterventionDate(it.date);
    return d && inSevenDayWindow(d, start, end);
  });

  const enginWeekTotals = new Map<string, number>();
  filtered.forEach((it) => {
    const q = Number(it.quantite) || 0;
    enginWeekTotals.set(it.engin, (enginWeekTotals.get(it.engin) ?? 0) + q);
  });
  const topEngins = [...enginWeekTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([n]) => n);
  while (topEngins.length < 5) topEngins.push("—");

  const dailyTotals = new Array(NB_JOURS).fill(0);
  const dailyByEngin: number[][] = Array.from({ length: NB_JOURS }, () => new Array(5).fill(0));
  const dayLabels: string[] = [];

  for (let i = 0; i < NB_JOURS; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    dayLabels.push(formatDayLabel(day));
  }

  filtered.forEach((it) => {
    const d = parseInterventionDate(it.date);
    if (!d) return;
    let idx = -1;
    for (let k = 0; k < NB_JOURS; k += 1) {
      const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + k, 0, 0, 0, 0);
      const dayEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate() + k, 23, 59, 59, 999);
      if (d.getTime() >= dayStart.getTime() && d.getTime() <= dayEnd.getTime()) {
        idx = k;
        break;
      }
    }
    if (idx < 0) return;
    const q = Number(it.quantite) || 0;
    dailyTotals[idx] += q;
    const ei = topEngins.findIndex((e) => e === it.engin);
    if (ei >= 0) dailyByEngin[idx]![ei] += q;
  });

  const totalWeekKg = dailyTotals.reduce((a, b) => a + b, 0);
  const avgDailyKg = totalWeekKg / NB_JOURS;

  let topConsumerEngin = "—";
  let topConsumerKg = 0;
  enginWeekTotals.forEach((kg, name) => {
    if (kg > topConsumerKg) {
      topConsumerKg = kg;
      topConsumerEngin = name;
    }
  });

  const priceByLub = new Map(lubrifiants.map((l) => [normalizeKey(l.nom), Number(l.prixUnitaire) || 0]));
  let otQtyKg = 0;
  let otBudgetMad = 0;
  let otCount = 0;
  getOtHistory().forEach((entry) => {
    const gen = new Date(entry.generatedAt);
    if (Number.isNaN(gen.getTime()) || !inSevenDayWindow(gen, start, end)) return;
    otCount += 1;
    const qty = Number(entry.intervention.quantite) || 0;
    const unit =
      priceByLub.get(normalizeKey(entry.intervention.lubrifiant)) ?? OT_UNIT_PRICE_FALLBACK;
    otQtyKg += qty;
    otBudgetMad += qty * unit;
  });
  const avgOtPricePerKg = otQtyKg > 0 ? otBudgetMad / otQtyKg : OT_UNIT_PRICE_FALLBACK;

  return {
    start,
    end,
    dailyTotals,
    dayLabels,
    dailyByEngin,
    topEngins,
    totalWeekKg,
    avgDailyKg,
    topConsumerEngin,
    topConsumerKg,
    otCount,
    otQtyKg,
    otBudgetMad,
    avgOtPricePerKg,
  };
}

function drawDailyTotalPerformance(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  dailyTotals: number[],
  dayLabels: string[]
) {
  const n = NB_JOURS;
  let maxV = Math.max(1, ...dailyTotals);
  maxV *= 1.15;

  doc.setFillColor(...THEME.chartPanel);
  doc.setDrawColor(...THEME.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");

  const padL = 10;
  const padB = 16;
  const chartW = w - padL - 6;
  const chartH = h - padB - 12;
  const originX = x + padL;
  const originY = y + h - padB;
  const stepX = chartW / Math.max(1, n - 1);

  for (let gy = 0; gy <= 4; gy += 1) {
    const yy = originY - (chartH * gy) / 4;
    doc.setDrawColor(...THEME.border);
    doc.setLineWidth(0.1);
    doc.line(originX, yy, originX + chartW, yy);
    doc.setFontSize(6);
    doc.setTextColor(...THEME.secondary);
    doc.text(`${Math.round((maxV * (4 - gy)) / 4)}`, originX - 5, yy + 1, { align: "right" });
  }

  const xAt = (i: number) => originX + i * stepX;
  const yAt = (v: number) => originY - (v / maxV) * chartH;

  for (let i = 0; i < n; i += 1) {
    const v = dailyTotals[i] ?? 0;
    const bw = stepX * 0.28;
    doc.setFillColor(...THEME.bar);
    doc.rect(xAt(i) - bw / 2, yAt(v), bw, originY - yAt(v), "F");
  }

  doc.setDrawColor(...THEME.accent);
  doc.setLineWidth(0.45);
  let prev: { px: number; py: number } | null = null;
  for (let i = 0; i < n; i += 1) {
    const px = xAt(i);
    const py = yAt(dailyTotals[i] ?? 0);
    if (prev) doc.line(prev.px, prev.py, px, py);
    prev = { px, py };
  }
  for (let i = 0; i < n; i += 1) {
    doc.setFillColor(...THEME.accent);
    doc.circle(xAt(i), yAt(dailyTotals[i] ?? 0), 1.2, "F");
  }

  const mean = dailyTotals.reduce((a, b) => a + b, 0) / n;
  const yMean = yAt(mean);
  doc.setDrawColor(...THEME.meanLine);
  doc.setLineWidth(0.25);
  doc.setLineDashPattern([1.2, 1.2], 0);
  doc.line(originX, yMean, originX + chartW, yMean);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...THEME.primary);
  doc.text("Performance quotidienne - consommation totale flotte (kg)", x + 2, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...THEME.bar);
  doc.text("Barres : total jour", x + 2, y + h - 9);
  doc.setTextColor(...THEME.accent);
  doc.text("Courbe : liaison des jours", x + 42, y + h - 9);
  doc.setTextColor(...THEME.meanLine);
  doc.text(`Moyenne période (${mean.toFixed(1)} kg/j)`, x + 95, y + h - 9);

  for (let i = 0; i < n; i += 1) {
    doc.setFontSize(5.5);
    doc.setTextColor(...THEME.primary);
    doc.text(dayLabels[i] ?? "", xAt(i), originY + 4, { align: "center" });
  }
  doc.setFontSize(6);
  doc.setTextColor(...THEME.secondary);
  doc.text("* Fig. 1 - Évolution sur 7 jours", x + w / 2, y + h + 3, { align: "center" });
}

function drawDailyEnginCurves(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  dailyByEngin: number[][],
  enginNames: string[],
  dayLabels: string[]
) {
  const n = NB_JOURS;
  let maxV = 1;
  dailyByEngin.forEach((row) => row.forEach((v) => (maxV = Math.max(maxV, v))));
  maxV *= 1.12;

  doc.setFillColor(...THEME.chartPanel);
  doc.setDrawColor(...THEME.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");

  const padL = 10;
  const padB = 16;
  const chartW = w - padL - 6;
  const chartH = h - padB - 14;
  const originX = x + padL;
  const originY = y + h - padB;
  const stepX = chartW / Math.max(1, n - 1);

  for (let gy = 0; gy <= 4; gy += 1) {
    const yy = originY - (chartH * gy) / 4;
    doc.setDrawColor(...THEME.border);
    doc.setLineWidth(0.1);
    doc.line(originX, yy, originX + chartW, yy);
    doc.setFontSize(6);
    doc.setTextColor(...THEME.secondary);
    doc.text(`${Math.round((maxV * (4 - gy)) / 4)}`, originX - 5, yy + 1, { align: "right" });
  }

  const xAt = (i: number) => originX + i * stepX;
  const yAt = (v: number) => originY - (v / maxV) * chartH;

  for (let ei = 0; ei < 5; ei += 1) {
    if (enginNames[ei] === "—") continue;
    doc.setDrawColor(...ENGIN_LINE_COLORS[ei]!);
    doc.setLineWidth(0.35);
    let prev: { px: number; py: number } | null = null;
    for (let i = 0; i < n; i += 1) {
      const v = dailyByEngin[i]![ei] ?? 0;
      const px = xAt(i);
      const py = yAt(v);
      if (prev) doc.line(prev.px, prev.py, px, py);
      prev = { px, py };
    }
    for (let i = 0; i < n; i += 1) {
      const v = dailyByEngin[i]![ei] ?? 0;
      doc.setFillColor(...ENGIN_LINE_COLORS[ei]!);
      doc.circle(xAt(i), yAt(v), 1, "F");
    }
  }

  for (let i = 0; i < n; i += 1) {
    doc.setFontSize(5.5);
    doc.setTextColor(...THEME.primary);
    doc.text(dayLabels[i] ?? "", xAt(i), originY + 4, { align: "center" });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...THEME.primary);
  doc.text("Courbes par engin (top 5, kg / jour)", x + 2, y + 5);

  let lx = x + 4;
  const ly = y + h - 6;
  for (let ei = 0; ei < 5; ei += 1) {
    const name = enginNames[ei];
    if (name === "—") continue;
    doc.setFillColor(...ENGIN_LINE_COLORS[ei]!);
    doc.rect(lx, ly - 2, 2.5, 2.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...THEME.secondary);
    doc.text(name.length > 16 ? `${name.slice(0, 14)}…` : name, lx + 4, ly);
    lx += 52;
  }

  doc.setFontSize(6);
  doc.setTextColor(...THEME.secondary);
  doc.text("* Fig. 2 - Performance par engin sur 7 jours", x + w / 2, y + h + 3, { align: "center" });
}

export async function generateWeeklyLubricantConsumptionPdf(
  interventions: Intervention[],
  lubrifiants: Lubrifiant[]
): Promise<void> {
  const data = computeSevenDayReport(interventions, lubrifiants);
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 10;

  const periodStr = `${formatShort(data.start)} - ${formatShort(data.end)} (7 jours)`;
  const genStr = new Date().toLocaleString("fr-FR");

  // ----- Page 1 -----
  await addOcpLogo(doc);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...THEME.primary);
  doc.text("RAPPORT DE CONSOMMATION LUBRIFIANT .  Suivi hebdomadaire", pageW / 2, 17, { align: "center" });

  doc.setFillColor(...THEME.pageHeaderBg);
  doc.rect(margin, 20, pageW - 2 * margin, 0.6, "F");
  doc.setFillColor(...THEME.accent);
  doc.rect(margin, 20.6, pageW - 2 * margin, 0.35, "F");

  autoTable(doc, {
    startY: 24,
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2, lineColor: THEME.border, lineWidth: 0.1 },
    alternateRowStyles: { fillColor: THEME.rowAlt },
    columnStyles: {
      0: { fillColor: THEME.labelBg, fontStyle: "bold", cellWidth: 62 },
      1: { cellWidth: pageW - 2 * margin - 62 },
    },
    body: [
      ["Période couverte", periodStr],
      ["Poste de travail principal", POSTE_TRAVAIL_PRINCIPAL],
      ["Division du poste de travail", DIVISION_POSTE],
      ["Date de génération", genStr],
      ["Version", REPORT_VERSION],
    ],
  });

  const yAfterMeta = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 58;

  autoTable(doc, {
    startY: yAfterMeta + 8,
    margin: { left: margin, right: margin },
    head: [["Indicateur (7 jours)", "Valeur"]],
    body: [
      ["Consommation totale (semaine)", `${data.totalWeekKg.toFixed(1)} kg`],
      ["Moyenne journalière (total ÷ 7 jours)", `${data.avgDailyKg.toFixed(2)} kg/j`],
      [
        "+ grand consommateur (quantité)",
        `${data.topConsumerEngin} — ${data.topConsumerKg.toFixed(1)} kg`,
      ],
      [
        `Coût estimé OT (${OT_UNIT_PRICE_FALLBACK.toFixed(1)} MAD/kg)`,
        `${data.otBudgetMad.toFixed(2)} MAD`,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: THEME.header, textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 9, valign: "middle", lineColor: THEME.border, lineWidth: 0.1 },
    alternateRowStyles: { fillColor: THEME.rowAlt },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: pageW - 2 * margin - 95, fontStyle: "bold", textColor: THEME.primary },
    },
  });

  const yAfterKpi = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? yAfterMeta + 50;

  autoTable(doc, {
    startY: yAfterKpi + 8,
    margin: { left: margin, right: margin },
    head: [["Synthèse budget OT (7 jours)", "Valeur"]],
    body: [
      ["Nombre d'OT générés (période)", String(data.otCount)],
      ["Quantité totale OT (kg)", data.otQtyKg.toFixed(1)],
      ["Montant total OT (MAD)", data.otBudgetMad.toFixed(2)],
      ["Prix moyen pondéré (MAD/kg)", data.avgOtPricePerKg.toFixed(2)],
    ],
    theme: "striped",
    headStyles: { fillColor: THEME.header, textColor: 255 },
    styles: { fontSize: 9, lineColor: THEME.border, lineWidth: 0.1 },
    alternateRowStyles: { fillColor: THEME.rowAlt },
    columnStyles: {
      0: { cellWidth: 95 },
      1: { cellWidth: pageW - 2 * margin - 95, fontStyle: "bold", textColor: THEME.primary },
    },
  });

  // ----- Page 2 : courbes -----
  doc.addPage();
  await addOcpLogo(doc, 8, 2, 22, 18);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...THEME.primary);
  doc.text("Courbes de performance - consommation sur 7 jours", pageW / 2, 20, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...THEME.secondary);
  doc.text(periodStr, pageW / 2, 27, { align: "center" });

  doc.setFillColor(...THEME.pageHeaderBg);
  doc.rect(margin, 28, pageW - 2 * margin, 0.6, "F");
  doc.setFillColor(...THEME.accent);
  doc.rect(margin, 28.6, pageW - 2 * margin, 0.35, "F");

  const y0 = 34;
  const chartW = pageW - 2 * margin;
  drawDailyTotalPerformance(doc, margin, y0, chartW, 72, data.dailyTotals, data.dayLabels);
  drawDailyEnginCurves(doc, margin, y0 + 78, chartW, 72, data.dailyByEngin, data.topEngins, data.dayLabels);

  const fname = `OCP_Rapport_Hebdo_Lubrifiant_7j_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fname);
}
