import * as XLSX from 'xlsx-js-style';
import { Lubrifiant, Intervention } from './types';
import { getOtHistory } from './ot-history';

type CellStyle = NonNullable<XLSX.CellObject['s']>;

const STYLES = {
  header: {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: '1447E6' } },
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      left: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'E2E8F0' } },
    },
  } satisfies CellStyle,
  subHeader: {
    font: { bold: true, color: { rgb: '0F172A' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'F1F5F9' } },
    alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
  } satisfies CellStyle,
  normal: {
    font: { color: { rgb: '0F172A' } },
    alignment: { vertical: 'center', horizontal: 'left', wrapText: true },
  } satisfies CellStyle,
  number: {
    font: { color: { rgb: '0F172A' } },
    alignment: { vertical: 'center', horizontal: 'right' },
    numFmt: '#,##0.00',
  } satisfies CellStyle,
  total: {
    font: { bold: true, color: { rgb: '0F172A' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'E2E8F0' } },
    alignment: { vertical: 'center', horizontal: 'right' },
    border: {
      top: { style: 'thin', color: { rgb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { rgb: 'CBD5E1' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } },
    },
  } satisfies CellStyle,
  massive: {
    font: { bold: true, color: { rgb: '7F1D1D' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'FEE2E2' } },
    alignment: { vertical: 'center', horizontal: 'right' },
    numFmt: '#,##0.00',
  } satisfies CellStyle,
  warning: {
    font: { bold: true, color: { rgb: '7C2D12' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'FFEDD5' } },
    alignment: { vertical: 'center', horizontal: 'right' },
    numFmt: '#,##0.00',
  } satisfies CellStyle,
} as const;

function setCellStyle(ws: XLSX.WorkSheet, addr: string, s: CellStyle) {
  const cell = ws[addr] as XLSX.CellObject | undefined;
  if (!cell) return;
  cell.s = { ...(cell.s ?? {}), ...s };
}

function col(n: number) {
  return XLSX.utils.encode_col(n);
}

function applyHeaderRow(ws: XLSX.WorkSheet, rowIndex: number, colCount: number) {
  for (let c = 0; c < colCount; c += 1) {
    setCellStyle(ws, `${col(c)}${rowIndex}`, STYLES.header);
  }
}

function autoWidth(ws: XLSX.WorkSheet, rows: (string | number | null | undefined)[][]) {
  const widths: number[] = [];
  rows.forEach((r) => {
    r.forEach((v, i) => {
      const s = v == null ? '' : String(v);
      widths[i] = Math.max(widths[i] ?? 8, Math.min(48, s.length + 2));
    });
  });
  ws['!cols'] = widths.map((w) => ({ wch: w }));
}

function safeDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inRange(d: Date, start: Date, end: Date): boolean {
  return d.getTime() >= start.getTime() && d.getTime() <= end.getTime();
}

function computeThresholds(items: Intervention[]) {
  const q = items.map((i) => i.quantite).filter((n) => Number.isFinite(n) && n >= 0).sort((a, b) => a - b);
  if (q.length === 0) return { warn: 0, massive: 0 };
  const p = (pct: number) => q[Math.max(0, Math.min(q.length - 1, Math.floor((pct / 100) * (q.length - 1))))];
  return {
    warn: Math.max(0, p(75)),
    massive: Math.max(0, p(90)),
  };
}

const OT_UNIT_PRICE_FALLBACK = 22;

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function exportToExcel(
  lubrifiants: Lubrifiant[],
  interventions: Intervention[]
) {
  const wb = XLSX.utils.book_new();

  // Feuille 1: Lubrifiants
  const lubrifiantsData = lubrifiants.map((l) => ({
    'Nom': l.nom,
    'Stock Actuel': l.stockActuel,
    'Stock Minimum': l.stockMinimum,
    'Unité': l.unite,
    'Prix Unitaire (MAD)': l.prixUnitaire,
    'Dernière MAJ': l.dateMAJ,
  }));
  const wsLubrifiants = XLSX.utils.json_to_sheet(lubrifiantsData);
  XLSX.utils.book_append_sheet(wb, wsLubrifiants, 'Lubrifiants');

  // Feuille 2: Interventions
  const interventionsData = interventions.map((i) => ({
    'Date': i.date,
    'Engin': i.engin,
    'Catégorie': i.categorie,
    'Lubrifiant': i.lubrifiant,
    'Compteur Horaire': i.compteurHoraire,
    'Type': i.type,
    'Quantité (kg)': i.quantite,
    'Responsable': i.responsable,
    'Observation': i.observation,
  }));
  const wsInterventions = XLSX.utils.json_to_sheet(interventionsData);
  XLSX.utils.book_append_sheet(wb, wsInterventions, 'Interventions');

  // Feuille 3: Rapport mensuel
  const monthlyReport = generateMonthlyReport(interventions);
  const wsReport = XLSX.utils.json_to_sheet(monthlyReport);
  XLSX.utils.book_append_sheet(wb, wsReport, 'Rapport Mensuel');

  // Télécharger
  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `OCP_Lubrifiants_${date}.xlsx`);
}

function generateMonthlyReport(interventions: Intervention[]) {
  const monthlyData: Record<
    string,
    {
      mois: string;
      totalVidanges: number;
      totalAppoints: number;
      quantiteVidanges: number;
      quantiteAppoints: number;
      totalQuantite: number;
    }
  > = {};

  interventions.forEach((i) => {
    const date = new Date(i.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        mois: monthName,
        totalVidanges: 0,
        totalAppoints: 0,
        quantiteVidanges: 0,
        quantiteAppoints: 0,
        totalQuantite: 0,
      };
    }

    if (i.type === 'Vidange') {
      monthlyData[monthKey].totalVidanges++;
      monthlyData[monthKey].quantiteVidanges += i.quantite;
    } else if (i.type === 'Appoint') {
      monthlyData[monthKey].totalAppoints++;
      monthlyData[monthKey].quantiteAppoints += i.quantite;
    }
    monthlyData[monthKey].totalQuantite += i.quantite;
  });

  return Object.values(monthlyData)
    .sort((a, b) => b.mois.localeCompare(a.mois))
    .map((d) => ({
      Mois: d.mois,
      "Nombre Vidanges": d.totalVidanges,
      "Nombre Appoints": d.totalAppoints,
      "Quantité Vidanges (kg)": d.quantiteVidanges,
      "Quantité Appoints (kg)": d.quantiteAppoints,
      "Total Quantité (kg)": d.totalQuantite,
    }));
}

export function exportWeeklyReport(interventions: Intervention[], lubrifiants: Lubrifiant[]) {
  return exportPeriodReport(interventions, lubrifiants, 'hebdomadaire');
}

export function exportMonthlyReport(interventions: Intervention[], lubrifiants: Lubrifiant[]) {
  return exportPeriodReport(interventions, lubrifiants, 'mensuel');
}

type PeriodKind = 'hebdomadaire' | 'mensuel';

function exportPeriodReport(interventions: Intervention[], lubrifiants: Lubrifiant[], kind: PeriodKind) {
  const wb = XLSX.utils.book_new();
  const today = new Date();

  const start =
    kind === 'hebdomadaire'
      ? new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(today.getFullYear(), today.getMonth(), 1);
  const end =
    kind === 'hebdomadaire'
      ? today
      : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const filtered = interventions
    .map((i) => ({ i, d: safeDate(i.date) }))
    .filter((x) => x.d && inRange(x.d, start, end))
    .map((x) => x.i)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const priceByLub = new Map(lubrifiants.map((l) => [normalizeKey(l.nom), Number(l.prixUnitaire) || 0]));
  const otBudgetRows = getOtHistory()
    .map((entry) => {
      const gen = safeDate(entry.generatedAt);
      if (!gen || !inRange(gen, start, end)) return null;
      const qty = Number(entry.intervention.quantite) || 0;
      const unitPrice = priceByLub.get(normalizeKey(entry.intervention.lubrifiant)) ?? OT_UNIT_PRICE_FALLBACK;
      return {
        lubrifiant: entry.intervention.lubrifiant,
        quantite: qty,
        unitPrice,
        total: qty * unitPrice,
      };
    })
    .filter((x): x is { lubrifiant: string; quantite: number; unitPrice: number; total: number } => Boolean(x));

  const otBudgetByLub = new Map<string, { otCount: number; totalQty: number; avgPrice: number; totalBudget: number }>();
  otBudgetRows.forEach((row) => {
    const cur = otBudgetByLub.get(row.lubrifiant) ?? { otCount: 0, totalQty: 0, avgPrice: 0, totalBudget: 0 };
    cur.otCount += 1;
    cur.totalQty += row.quantite;
    cur.totalBudget += row.total;
    cur.avgPrice = cur.totalQty > 0 ? cur.totalBudget / cur.totalQty : 0;
    otBudgetByLub.set(row.lubrifiant, cur);
  });

  const otQtyTotal = otBudgetRows.reduce((acc, row) => acc + row.quantite, 0);
  const otBudgetTotal = otBudgetRows.reduce((acc, row) => acc + row.total, 0);

  const { warn, massive } = computeThresholds(filtered);

  const totalQuantite = filtered.reduce((acc, it) => acc + (Number(it.quantite) || 0), 0);
  const totalVidange = filtered.filter((i) => i.type === 'Vidange').reduce((a, i) => a + (Number(i.quantite) || 0), 0);
  const totalAppoint = filtered.filter((i) => i.type === 'Appoint').reduce((a, i) => a + (Number(i.quantite) || 0), 0);

  // ===== Sheet 1: Synthèse =====
  const title =
    kind === 'hebdomadaire'
      ? `Rapport hebdomadaire (${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)})`
      : `Rapport mensuel (${today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })})`;

  const synthRows: (string | number | null)[][] = [
    [title, null, null, null],
    ['Généré le', today.toLocaleString('fr-FR'), null, null],
    [null, null, null, null],
    ['Total consommation', totalQuantite, 'kg', null],
    ['Total Vidange', totalVidange, 'kg', null],
    ['Total Appoint', totalAppoint, 'kg', null],
    [null, null, null, null],
    ['OT générés (période)', otBudgetRows.length, null, null],
    ['Quantité OT', otQtyTotal, 'kg', null],
    ['Montant OT', otBudgetTotal, 'MAD', null],
    [null, null, null, null],
    ['Seuil “Normal”', `< ${warn.toFixed(1)} kg`, null, null],
    ['Seuil “Massif”', `≥ ${massive.toFixed(1)} kg`, null, null],
  ];

  const wsSynth = XLSX.utils.aoa_to_sheet(synthRows);
  autoWidth(wsSynth, synthRows);
  // Style: title row
  setCellStyle(wsSynth, 'A1', {
    font: { bold: true, sz: 14, color: { rgb: '0F172A' } },
    alignment: { vertical: 'center', horizontal: 'left' },
  });
  wsSynth['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];
  XLSX.utils.book_append_sheet(wb, wsSynth, 'Synthèse');

  // ===== Sheet 2: Détails =====
  const detailsHeader = ['Date', 'Engin', 'Catégorie', 'Lubrifiant', 'Type', 'Quantité (kg)', 'Responsable', 'Observation'];
  const detailsRows: (string | number | null)[][] = [
    detailsHeader,
    ...filtered.map((i) => [
      i.date,
      i.engin,
      i.categorie,
      i.lubrifiant,
      i.type,
      i.quantite,
      i.responsable,
      i.observation,
    ]),
    [null, null, null, null, 'TOTAL', totalQuantite, null, null],
  ];
  const wsDetails = XLSX.utils.aoa_to_sheet(detailsRows);
  applyHeaderRow(wsDetails, 1, detailsHeader.length);
  autoWidth(wsDetails, detailsRows);

  // Style quantity column with thresholds
  const qtyColIndex = detailsHeader.indexOf('Quantité (kg)');
  for (let r = 2; r <= filtered.length + 1; r += 1) {
    const addr = `${col(qtyColIndex)}${r}`;
    const cell = wsDetails[addr] as XLSX.CellObject | undefined;
    const value = typeof cell?.v === 'number' ? cell.v : Number(cell?.v);
    if (!Number.isFinite(value)) continue;
    if (value >= massive) setCellStyle(wsDetails, addr, STYLES.massive);
    else if (value >= warn) setCellStyle(wsDetails, addr, STYLES.warning);
    else setCellStyle(wsDetails, addr, STYLES.number);
  }
  // Total row style
  const totalRowIndex = filtered.length + 2;
  setCellStyle(wsDetails, `${col(detailsHeader.indexOf('TOTAL') >= 0 ? detailsHeader.indexOf('TOTAL') : 4)}${totalRowIndex}`, STYLES.total);
  setCellStyle(wsDetails, `${col(qtyColIndex)}${totalRowIndex}`, STYLES.total);

  XLSX.utils.book_append_sheet(wb, wsDetails, 'Détails');

  // ===== Sheet 3: Par lubrifiant =====
  const byLub = new Map<
    string,
    { total: number; vidange: number; appoint: number; count: number }
  >();
  filtered.forEach((i) => {
    const entry = byLub.get(i.lubrifiant) ?? { total: 0, vidange: 0, appoint: 0, count: 0 };
    const q = Number(i.quantite) || 0;
    entry.total += q;
    entry.count += 1;
    if (i.type === 'Vidange') entry.vidange += q;
    else if (i.type === 'Appoint') entry.appoint += q;
    byLub.set(i.lubrifiant, entry);
  });
  const lubHeader = ['Lubrifiant', 'Total (kg)', 'Vidange (kg)', 'Appoint (kg)', 'Nb opérations'];
  const lubRows: (string | number | null)[][] = [
    lubHeader,
    ...[...byLub.entries()]
      .map(([name, v]) => [name, v.total, v.vidange, v.appoint, v.count])
      .sort((a, b) => Number(b[1]) - Number(a[1])),
    ['TOTAL', totalQuantite, totalVidange, totalAppoint, filtered.length],
  ];
  const wsLub = XLSX.utils.aoa_to_sheet(lubRows);
  applyHeaderRow(wsLub, 1, lubHeader.length);
  autoWidth(wsLub, lubRows);
  XLSX.utils.book_append_sheet(wb, wsLub, 'Par lubrifiant');

  // ===== Sheet 4: Budget OT (lié aux OT générés) =====
  const budgetHeader = ['Lubrifiant', 'OT générés', 'Quantité totale (kg)', 'Prix moyen (MAD/kg)', 'Montant total (MAD)'];
  const budgetRows: (string | number | null)[][] = [
    budgetHeader,
    ...[...otBudgetByLub.entries()]
      .map(([lub, v]) => [lub, v.otCount, v.totalQty, v.avgPrice, v.totalBudget])
      .sort((a, b) => Number(b[4]) - Number(a[4])),
    ['TOTAL', otBudgetRows.length, otQtyTotal, otQtyTotal > 0 ? otBudgetTotal / otQtyTotal : 0, otBudgetTotal],
  ];
  const wsBudget = XLSX.utils.aoa_to_sheet(budgetRows);
  applyHeaderRow(wsBudget, 1, budgetHeader.length);
  autoWidth(wsBudget, budgetRows);
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Budget OT');

  // Télécharger
  const stamp = new Date().toISOString().slice(0, 10);
  const fileName = kind === 'hebdomadaire' ? `OCP_Rapport_Hebdo_${stamp}.xlsx` : `OCP_Rapport_Mensuel_${stamp}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
