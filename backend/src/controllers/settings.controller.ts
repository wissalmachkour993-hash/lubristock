import { Request, Response } from "express";
import { prisma } from "../database/prisma";

export async function getSettingsController(_req: Request, res: Response) {
  const settings = await prisma.setting.findMany();
  const map = settings.reduce<Record<string, string>>((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  return res.json(map);
}

export async function updateThemeController(req: Request, res: Response) {
  const theme = String(req.body.theme ?? "clear");
  const setting = await prisma.setting.upsert({
    where: { key: "theme" },
    update: { value: theme },
    create: { key: "theme", value: theme },
  });
  return res.json(setting);
}

export async function resetDataController(_req: Request, res: Response) {
  await prisma.intervention.deleteMany();
  await prisma.planification.deleteMany();
  return res.json({ message: "Données intervention et planification réinitialisées" });
}
