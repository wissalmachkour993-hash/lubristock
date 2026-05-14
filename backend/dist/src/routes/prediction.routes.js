"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prediction_controller_1 = require("../controllers/prediction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/rupture", auth_middleware_1.requireAuth, prediction_controller_1.stockPredictionController);
exports.default = router;
//# sourceMappingURL=prediction.routes.js.map