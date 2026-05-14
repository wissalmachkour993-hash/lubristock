"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const planning_controller_1 = require("../controllers/planning.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.requireAuth, planning_controller_1.listPlanningController);
router.post("/", auth_middleware_1.requireAuth, planning_controller_1.createPlanningController);
exports.default = router;
//# sourceMappingURL=planning.routes.js.map