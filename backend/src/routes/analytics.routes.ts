import { Router } from "express";
import { consommationHeuresController, paretoController, scoreSanteController } from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/pareto", requireAuth, paretoController);
router.get("/consommation-heures", requireAuth, consommationHeuresController);
router.get("/score-sante", requireAuth, scoreSanteController);

export default router;
