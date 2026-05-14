import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export async function listPlanningController(_req: Request, res: Response) {
  const data = await prisma.planification.findMany({
    include: { equipement: true, lubrifiant: true },
    orderBy: { prochaineEcheance: "asc" },
  });
  return res.json(data);
}

export async function createPlanningController(req: Request, res: Response) {
  const item = await prisma.planification.create({
    data: {
      equipementId: req.body.equipementId,
      lubrifiantId: req.body.lubrifiantId,
      frequenceHeures: Number(req.body.frequenceHeures),
      prochaineEcheance: new Date(req.body.prochaineEcheance),
    },
  });
  return res.status(201).json(item);
}
