"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../validators/auth.validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/login", (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), auth_controller_1.loginController);
router.post("/logout", auth_middleware_1.requireAuth, auth_controller_1.logoutController);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map