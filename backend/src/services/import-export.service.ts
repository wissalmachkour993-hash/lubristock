import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { createObjectCsvStringifier } from "csv-writer";
import { Prisma, InterventionType } from "@prisma/client";
import { prisma } from "../database/prisma";
import { createIntervention } from "./intervention.service";
import { recalculateAllLubricantStats } from "./inventory.service";
import { getKpis } from "./dashboard.service";

type ImportRow = {
  date: string;
  categorie: string;
  equipement: string;
  lubrifiant: string;
  type: string;
  quantite: number;
  compteur_horaire: number;
  responsable: string;
  observation?: string;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function parseExcelDate(value: string) {
  const numeric = Number(value);
  if (!Number.isNaN(numeric) && numeric > 20000 && numeric < 80000) {
    const d = XLSX.SSF.parse_date_code(numeric);
    if (d) {
      const iso = new Date(Date.UTC(d.y, d.m - 1, d.d)).toISOString();
      return iso;
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Date invalide: ${value}`);
  }
  return date.toISOString();
}

export async function importInterventionsFromBuffer(buffer: Buffer, fileName: string) {
  const rows = readRows(buffer, fileName);
  let imported = 0;
  const errors: Array<{ row: number; message: string }> = [];
  const [categories, equipments, lubricants] = await Promise.all([
    prisma.categorie.findMany(),
    prisma.equipement.findMany(),
    prisma.lubrifiant.findMany(),
  ]);

  const categoryMap = new Map(categories.map((c) => [normalizeText(c.nom), c]));
  const equipmentMap = new Map(equipments.map((e) => [normalizeText(e.nom), e]));
  const lubricantMap = new Map(lubricants.map((l) => [normalizeText(l.nom), l]));

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    try {
      const categorie = categoryMap.get(normalizeText(row.categorie));
      const equipement = equipmentMap.get(normalizeText(row.equipement));
      const lubrifiant = lubricantMap.get(normalizeText(row.lubrifiant));
      if (!categorie || !equipement || !lubrifiant) throw new Error("Categorie/equipement/lubrifiant introuvable");

      const payload: Prisma.InterventionUncheckedCreateInput = {
        date: new Date(parseExcelDate(row.date)),
        categorieId: categorie.id,
        equipementId: equipement.id,
        lubrifiantId: lubrifiant.id,
        type: (() => {
          const t = row.type.toLowerCase();
          if (t.includes("rav")) return InterventionType.ravitaillement;
          if (t.includes("appoint")) return InterventionType.appoint;
          return InterventionType.vidange;
        })(),
        quantite: Number(row.quantite),
        compteurHoraire: Number(row.compteur_horaire),
        responsable: row.responsable || "Import Excel",
        observation: row.observation || "",
      };

      await createIntervention(payload);
      imported += 1;
    } catch (error) {
      errors.push({ row: index + 1, message: (error as Error).message });
    }
  }

  await recalculateAllLubricantStats();
  const kpis = await getKpis();
  return {
    lignes_importees: imported,
    erreurs: errors,
    resume: {
      total_lignes: rows.length,
      succes: imported,
      echecs: errors.length,
      kpis,
    },
  };
}

function readRows(buffer: Buffer, fileName: string): ImportRow[] {
  if (fileName.toLowerCase().endsWith(".csv")) {
    const csv = buffer.toString("utf8").split(/\r?\n/).filter(Boolean);
    const [headerLine, ...dataLines] = csv;
    const headers = headerLine.split(",").map((h) => h.trim());
    return dataLines.map((line) => {
      const values = line.split(",");
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => (obj[h] = (values[i] ?? "").trim()));
      return normalizeRow(obj);
    });
  }

  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return jsonRows.map(normalizeRow);
}

function normalizeRow(row: Record<string, unknown>): ImportRow {
  return {
    date: String(row.date ?? row.Date ?? row["DATE"] ?? ""),
    categorie: String(row.categorie ?? row.Catégorie ?? row.Categorie ?? row["Categorie engin"] ?? ""),
    equipement: String(row.equipement ?? row.Engin ?? row.Equipement ?? row.engin ?? ""),
    lubrifiant: String(row.lubrifiant ?? row.Lubrifiant ?? row["Type de lubrifiant"] ?? ""),
    type: String(row.type ?? row.Type ?? row["Type intervention"] ?? ""),
    quantite: Number(row.quantite ?? row["Quantité"] ?? row["Quantité (L)"] ?? row["Qte"] ?? 0),
    compteur_horaire: Number(row.compteur_horaire ?? row["Compteur Horaire"] ?? row["Compteur"] ?? row["Heures"] ?? 0),
    responsable: String(row.responsable ?? row.Responsable ?? ""),
    observation: String(row.observation ?? row.Observation ?? ""),
  };
}

/** Modèle d’import : en-têtes reconnus par `normalizeRow` + exemples alignés sur le seed. */
export async function exportInterventionsTemplateBuffer() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Interventions");
  worksheet.columns = [
    { header: "Date", key: "date", width: 14 },
    { header: "Catégorie", key: "categorie", width: 18 },
    { header: "Engin", key: "equipement", width: 14 },
    { header: "Lubrifiant", key: "lubrifiant", width: 22 },
    { header: "Type", key: "type", width: 12 },
    { header: "Quantité (L)", key: "quantite", width: 14 },
    { header: "Compteur Horaire", key: "compteur_horaire", width: 18 },
    { header: "Responsable", key: "responsable", width: 18 },
    { header: "Observation", key: "observation", width: 28 },
  ];
  worksheet.addRow({
    date: "2025-01-15",
    categorie: "Bulle D9R",
    equipement: "D9R2",
    lubrifiant: "Huile moteur 140",
    type: "Vidange",
    quantite: 45,
    compteur_horaire: 12450,
    responsable: "Exemple Opérateur",
    observation: "Ligne d’exemple — supprimez ou remplacez",
  });
  worksheet.addRow({
    date: "2025-01-16",
    categorie: "Camion 190T",
    equipement: "KOM1",
    lubrifiant: "Huile hydraulique 466",
    type: "Appoint",
    quantite: 12,
    compteur_horaire: 8320,
    responsable: "",
    observation: "",
  });
  worksheet.addRow({
    date: "2025-01-17",
    categorie: "Chargeuse",
    equipement: "CHF1",
    lubrifiant: "Huile BV 423",
    type: "Vidange",
    quantite: 8,
    compteur_horaire: 3100,
    responsable: "Atelier mobile",
    observation: "",
  });
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  return workbook.xlsx.writeBuffer();
}

export async function exportWorkbook(data: unknown[], sheetName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  if (data.length > 0) {
    const first = data[0] as Record<string, unknown>;
    worksheet.columns = Object.keys(first).map((key) => ({ header: key, key }));
    data.forEach((row) => worksheet.addRow(row as Record<string, unknown>));
  }
  return workbook.xlsx.writeBuffer();
}

export function exportCsv(data: unknown[]) {
  if (!data.length) return "";
  const records = data as Record<string, unknown>[];
  const header = Object.keys(records[0]).map((id) => ({ id, title: id }));
  const csvStringifier = createObjectCsvStringifier({ header });
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
}
