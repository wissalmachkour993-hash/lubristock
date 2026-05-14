import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import {
  exportCsv,
  exportInterventionsTemplateBuffer,
  exportWorkbook,
  importInterventionsFromBuffer,
} from "../services/import-export.service";
import { getKpis } from "../services/dashboard.service";

export async function importInterventionsController(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ message: "Fichier requis" });
  const result = await importInterventionsFromBuffer(req.file.buffer, req.file.originalname);
  return res.json(result);
}

export async function downloadInterventionsTemplateController(_req: Request, res: Response) {
  const buffer = await exportInterventionsTemplateBuffer();
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="modele-import-interventions-ocp.xlsx"');
  return res.send(Buffer.from(buffer));
}

async function sendExport(res: Response, fileName: string, data: unknown[]) {
  const format = String(res.req.query.format ?? "xlsx").toLowerCase();
  if (format === "csv") {
    const csv = exportCsv(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}.csv"`);
    return res.send(csv);
  }
  const xlsx = await exportWorkbook(data, fileName);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}.xlsx"`);
  return res.send(Buffer.from(xlsx));
}

export async function exportLubricantsController(req: Request, res: Response) {
  const data = await prisma.lubrifiant.findMany();
  return sendExport(res, "lubrifiants", data);
}

export async function exportInterventionsController(req: Request, res: Response) {
  const data = await prisma.intervention.findMany({ include: { categorie: true, equipement: true, lubrifiant: true } });
  return sendExport(res, "interventions", data);
}

export async function exportMonthlyController(req: Request, res: Response) {
  const data = await prisma.intervention.findMany();
  return sendExport(res, "rapport-mensuel", data);
}

export async function exportDashboardController(req: Request, res: Response) {
  const data = [await getKpis()];
  return sendExport(res, "dashboard", data);
}
