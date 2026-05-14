import { Request, Response } from "express";
import { getAlerts } from "../services/dashboard.service";

export async function alertsController(_req: Request, res: Response) {
  return res.json(await getAlerts());
}
