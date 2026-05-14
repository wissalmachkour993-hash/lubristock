import { Request, Response } from "express";
import { getConsumptionVsHours, getHealthScore, getPareto } from "../services/analytics.service";

export async function paretoController(_req: Request, res: Response) {
  return res.json(await getPareto());
}

export async function consommationHeuresController(_req: Request, res: Response) {
  return res.json(await getConsumptionVsHours());
}

export async function scoreSanteController(_req: Request, res: Response) {
  return res.json(await getHealthScore());
}
