import { Router } from "express";
import {
  createLubricant,
  deleteLubricant,
  listLubricants,
  updateLubricant,
} from "../controllers/lubricants.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { upsertLubricantSchema } from "../validators/lubricant.validator";

const router = Router();

router.get("/", requireAuth, listLubricants);
router.post("/", requireAuth, requireRole(["admin"]), validate(upsertLubricantSchema), createLubricant);
router.put("/:id", requireAuth, requireRole(["admin"]), updateLubricant);
router.delete("/:id", requireAuth, requireRole(["admin"]), deleteLubricant);

export default router;
