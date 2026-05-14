import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { calcPointCommande, calcStockStatus, recalculateLubricantStats } from "../services/inventory.service";

export async function listLubricants(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const data = await prisma.lubrifiant.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
  return res.json(data);
}

export async function createLubricant(req: Request, res: Response) {
  const pointCommande = calcPointCommande(
    req.body.consommationMoyenne ?? 0,
    req.body.delaiApprovisionnement,
    req.body.stockSecurite
  );
  const statut = calcStockStatus(req.body.stockActuel, req.body.stockMin);
  const data = await prisma.lubrifiant.create({
    data: { ...req.body, pointCommande, statut },
  });
  return res.status(201).json(data);
}

export async function updateLubricant(req: Request, res: Response) {
  const id = String(req.params.id);
  const payload = { ...req.body };
  if (payload.stockActuel !== undefined && payload.stockMin !== undefined) {
    payload.statut = calcStockStatus(payload.stockActuel, payload.stockMin);
  }
  const data = await prisma.lubrifiant.update({ where: { id }, data: payload });
  await recalculateLubricantStats(id);
  return res.json(data);
}

export async function deleteLubricant(req: Request, res: Response) {
  await prisma.lubrifiant.delete({ where: { id: String(req.params.id) } });
  return res.status(204).send();
}
