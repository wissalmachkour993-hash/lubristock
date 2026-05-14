import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export async function getCategories(_req: Request, res: Response) {
  const categories = await prisma.categorie.findMany({ orderBy: { nom: "asc" } });
  return res.json(categories);
}

export async function getEquipements(req: Request, res: Response) {
  const categorieId = String(req.query.categorie_id ?? "");
  const data = await prisma.equipement.findMany({
    where: categorieId ? { categorieId } : undefined,
    orderBy: { nom: "asc" },
  });
  return res.json(data);
}
