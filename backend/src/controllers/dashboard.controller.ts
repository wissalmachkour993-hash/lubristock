import { Request, Response } from "express";
import {
  getConsommationMensuelle,
  getDistributionLubrifiants,
  getEtatStocks,
  getKpis,
  getTopEquipements,
} from "../services/dashboard.service";

export async function kpisController(_req: Request, res: Response) {
  return res.json(await getKpis());
}

export async function topEquipementsController(_req: Request, res: Response) {
  return res.json(await getTopEquipements());
}

export async function consommationMensuelleController(_req: Request, res: Response) {
  return res.json(await getConsommationMensuelle());
}

export async function distributionLubrifiantsController(_req: Request, res: Response) {
  return res.json(await getDistributionLubrifiants());
}

export async function etatStocksController(_req: Request, res: Response) {
  return res.json(await getEtatStocks());
}
