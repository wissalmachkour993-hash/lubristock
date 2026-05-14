import { Router } from "express";
import multer from "multer";
import {
  downloadInterventionsTemplateController,
  exportDashboardController,
  exportInterventionsController,
  exportLubricantsController,
  exportMonthlyController,
  importInterventionsController,
} from "../controllers/import-export.controller";
import { requireAuth } from "../middleware/auth.middleware";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get("/import/interventions/template", requireAuth, downloadInterventionsTemplateController);
router.post("/import/interventions", requireAuth, upload.single("file"), importInterventionsController);
router.get("/export/lubrifiants", requireAuth, exportLubricantsController);
router.get("/export/interventions", requireAuth, exportInterventionsController);
router.get("/export/rapport-mensuel", requireAuth, exportMonthlyController);
router.get("/export/dashboard", requireAuth, exportDashboardController);

export default router;
