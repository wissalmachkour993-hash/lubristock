import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { createIntervention } from "../services/intervention.service";

export async function listInterventions(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const categorieId = String(req.query.categorie_id ?? "");
  const equipementId = String(req.query.equipement_id ?? "");
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  const data = await prisma.intervention.findMany({
    where: {
      ...(categorieId ? { categorieId } : {}),
      ...(equipementId ? { equipementId } : {}),
      ...(from || to ? { date: { gte: from, lte: to } } : {}),
    },
    include: { categorie: true, equipement: true, lubrifiant: true },
    orderBy: { date: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return res.json(data);
}

export async function createInterventionController(req: Request, res: Response) {
  const intervention = await createIntervention({
    ...req.body,
    date: new Date(req.body.date),
  });
  return res.status(201).json(intervention);
}

export async function updateInterventionController(req: Request, res: Response) {
  const intervention = await prisma.intervention.update({
    where: { id: String(req.params.id) },
    data: {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : undefined,
    },
  });
  return res.json(intervention);
}

export async function deleteInterventionController(req: Request, res: Response) {
  await prisma.intervention.delete({ where: { id: String(req.params.id) } });
  return res.status(204).send();
}
