import { Router } from "express";
import { stockPredictionController } from "../controllers/prediction.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/rupture", requireAuth, stockPredictionController);
export default router;
