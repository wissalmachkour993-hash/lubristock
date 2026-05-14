import { Router } from "express";
import { getSettingsController, resetDataController, updateThemeController } from "../controllers/settings.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get("/", requireAuth, getSettingsController);
router.put("/theme", requireAuth, updateThemeController);
router.post("/reset", requireAuth, requireRole(["admin"]), resetDataController);

export default router;
