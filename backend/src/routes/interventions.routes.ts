import { Router } from "express";
import {
  createInterventionController,
  deleteInterventionController,
  listInterventions,
  updateInterventionController,
} from "../controllers/interventions.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { upsertInterventionSchema } from "../validators/intervention.validator";

const router = Router();

router.get("/", requireAuth, listInterventions);
router.post("/", requireAuth, validate(upsertInterventionSchema), createInterventionController);
router.put("/:id", requireAuth, updateInterventionController);
router.delete("/:id", requireAuth, deleteInterventionController);

export default router;
