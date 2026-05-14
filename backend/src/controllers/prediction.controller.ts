import { Request, Response } from "express";
import { getStockRupturePrediction } from "../services/prediction.service";

export async function stockPredictionController(_req: Request, res: Response) {
  return res.json(await getStockRupturePrediction());
}
