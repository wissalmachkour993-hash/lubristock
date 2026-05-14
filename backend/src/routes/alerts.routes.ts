import { Router } from "express";
import { alertsController } from "../controllers/alerts.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/", requireAuth, alertsController);
export default router;
