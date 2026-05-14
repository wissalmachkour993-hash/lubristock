import { Router } from "express";
import { getCategories, getEquipements } from "../controllers/equipments.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/categories", requireAuth, getCategories);
router.get("/equipements", requireAuth, getEquipements);

export default router;
