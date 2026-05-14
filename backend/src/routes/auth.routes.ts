import { Router } from "express";
import { loginController, logoutController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { loginSchema } from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", validate(loginSchema), loginController);
router.post("/logout", requireAuth, logoutController);

export default router;
