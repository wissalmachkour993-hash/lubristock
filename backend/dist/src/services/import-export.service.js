"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importInterventionsFromBuffer = importInterventionsFromBuffer;
exports.exportWorkbook = exportWorkbook;
exports.exportCsv = exportCsv;
const exceljs_1 = __importDefault(require("exceljs"));
const XLSX = __importStar(require("xlsx"));
const csv_writer_1 = require("csv-writer");
const client_1 = require("@prisma/client");
const prisma_1 = require("../database/prisma");
const intervention_service_1 = require("./intervention.service");
const inventory_service_1 = require("./inventory.service");
const dashboard_service_1 = require("./dashboard.service");
async function importInterventionsFromBuffer(buffer, fileName) {
    const rows = readRows(buffer, fileName);
    let imported = 0;
    const errors = [];
    for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        try {
            const categorie = await prisma_1.prisma.categorie.findFirst({ where: { nom: row.categorie } });
            const equipement = await prisma_1.prisma.equipement.findFirst({ where: { nom: row.equipement } });
            const lubrifiant = await prisma_1.prisma.lubrifiant.findFirst({ where: { nom: row.lubrifiant } });
            if (!categorie || !equipement || !lubrifiant)
                throw new Error("Categorie/equipement/lubrifiant introuvable");
            const payload = {
                date: new Date(row.date),
                categorieId: categorie.id,
                equipementId: equipement.id,
                lubrifiantId: lubrifiant.id,
                type: row.type.toLowerCase().includes("appoint") ? client_1.InterventionType.appoint : client_1.InterventionType.vidange,
                quantite: Number(row.quantite),
                compteurHoraire: Number(row.compteur_horaire),
                responsable: row.responsable || "Import Excel",
                observation: row.observation || "",
            };
            await (0, intervention_service_1.createIntervention)(payload);
            imported += 1;
        }
        catch (error) {
            errors.push({ row: index + 1, message: error.message });
        }
    }
    await (0, inventory_service_1.recalculateAllLubricantStats)();
    const kpis = await (0, dashboard_service_1.getKpis)();
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
function readRows(buffer, fileName) {
    if (fileName.toLowerCase().endsWith(".csv")) {
        const csv = buffer.toString("utf8").split(/\r?\n/).filter(Boolean);
        const [headerLine, ...dataLines] = csv;
        const headers = headerLine.split(",").map((h) => h.trim());
        return dataLines.map((line) => {
            const values = line.split(",");
            const obj = {};
            headers.forEach((h, i) => (obj[h] = (values[i] ?? "").trim()));
            return normalizeRow(obj);
        });
    }
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    return jsonRows.map(normalizeRow);
}
function normalizeRow(row) {
    return {
        date: String(row.date ?? row.Date ?? ""),
        categorie: String(row.categorie ?? row.Catégorie ?? row.Categorie ?? ""),
        equipement: String(row.equipement ?? row.Engin ?? row.Equipement ?? ""),
        lubrifiant: String(row.lubrifiant ?? row.Lubrifiant ?? ""),
        type: String(row.type ?? row.Type ?? ""),
        quantite: Number(row.quantite ?? row["Quantité"] ?? row["Quantité (L)"] ?? 0),
        compteur_horaire: Number(row.compteur_horaire ?? row["Compteur Horaire"] ?? 0),
        responsable: String(row.responsable ?? row.Responsable ?? ""),
        observation: String(row.observation ?? row.Observation ?? ""),
    };
}
async function exportWorkbook(data, sheetName) {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    if (data.length > 0) {
        const first = data[0];
        worksheet.columns = Object.keys(first).map((key) => ({ header: key, key }));
        data.forEach((row) => worksheet.addRow(row));
    }
    return workbook.xlsx.writeBuffer();
}
function exportCsv(data) {
    if (!data.length)
        return "";
    const records = data;
    const header = Object.keys(records[0]).map((id) => ({ id, title: id }));
    const csvStringifier = (0, csv_writer_1.createObjectCsvStringifier)({ header });
    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
}
//# sourceMappingURL=import-export.service.js.map