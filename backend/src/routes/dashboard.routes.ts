import { Router } from "express";
import {
  consommationMensuelleController,
  distributionLubrifiantsController,
  etatStocksController,
  kpisController,
  topEquipementsController,
} from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/kpis", requireAuth, kpisController);
router.get("/top-equipements", requireAuth, topEquipementsController);
router.get("/consommation-mensuelle", requireAuth, consommationMensuelleController);
router.get("/distribution-lubrifiants", requireAuth, distributionLubrifiantsController);
router.get("/etat-stocks", requireAuth, etatStocksController);

export default router;
