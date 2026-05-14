import { Router } from "express";
import { createPlanningController, listPlanningController } from "../controllers/planning.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/", requireAuth, listPlanningController);
router.post("/", requireAuth, createPlanningController);
export default router;
