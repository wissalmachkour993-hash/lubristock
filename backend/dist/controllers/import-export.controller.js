"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importInterventionsController = importInterventionsController;
exports.downloadInterventionsTemplateController = downloadInterventionsTemplateController;
exports.exportLubricantsController = exportLubricantsController;
exports.exportInterventionsController = exportInterventionsController;
exports.exportMonthlyController = exportMonthlyController;
exports.exportDashboardController = exportDashboardController;
const prisma_1 = require("../database/prisma");
const import_export_service_1 = require("../services/import-export.service");
const dashboard_service_1 = require("../services/dashboard.service");
async function importInterventionsController(req, res) {
    if (!req.file)
        return res.status(400).json({ message: "Fichier requis" });
    const result = await (0, import_export_service_1.importInterventionsFromBuffer)(req.file.buffer, req.file.originalname);
    return res.json(result);
}
async function downloadInterventionsTemplateController(_req, res) {
    const buffer = await (0, import_export_service_1.exportInterventionsTemplateBuffer)();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="modele-import-interventions-ocp.xlsx"');
    return res.send(Buffer.from(buffer));
}
async function sendExport(res, fileName, data) {
    const format = String(res.req.query.format ?? "xlsx").toLowerCase();
    if (format === "csv") {
        const csv = (0, import_export_service_1.exportCsv)(data);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}.csv"`);
        return res.send(csv);
    }
    const xlsx = await (0, import_export_service_1.exportWorkbook)(data, fileName);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}.xlsx"`);
    return res.send(Buffer.from(xlsx));
}
async function exportLubricantsController(req, res) {
    const data = await prisma_1.prisma.lubrifiant.findMany();
    return sendExport(res, "lubrifiants", data);
}
async function exportInterventionsController(req, res) {
    const data = await prisma_1.prisma.intervention.findMany({ include: { categorie: true, equipement: true, lubrifiant: true } });
    return sendExport(res, "interventions", data);
}
async function exportMonthlyController(req, res) {
    const data = await prisma_1.prisma.intervention.findMany();
    return sendExport(res, "rapport-mensuel", data);
}
async function exportDashboardController(req, res) {
    const data = [await (0, dashboard_service_1.getKpis)()];
    return sendExport(res, "dashboard", data);
}
