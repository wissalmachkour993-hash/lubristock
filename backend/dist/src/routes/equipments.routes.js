"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const equipments_controller_1 = require("../controllers/equipments.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/categories", auth_middleware_1.requireAuth, equipments_controller_1.getCategories);
router.get("/equipements", auth_middleware_1.requireAuth, equipments_controller_1.getEquipements);
exports.default = router;
//# sourceMappingURL=equipments.routes.js.map