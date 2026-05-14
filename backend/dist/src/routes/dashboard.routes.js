"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/kpis", auth_middleware_1.requireAuth, dashboard_controller_1.kpisController);
router.get("/top-equipements", auth_middleware_1.requireAuth, dashboard_controller_1.topEquipementsController);
router.get("/consommation-mensuelle", auth_middleware_1.requireAuth, dashboard_controller_1.consommationMensuelleController);
router.get("/distribution-lubrifiants", auth_middleware_1.requireAuth, dashboard_controller_1.distributionLubrifiantsController);
router.get("/etat-stocks", auth_middleware_1.requireAuth, dashboard_controller_1.etatStocksController);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map