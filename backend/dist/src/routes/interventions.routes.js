"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const interventions_controller_1 = require("../controllers/interventions.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const intervention_validator_1 = require("../validators/intervention.validator");
const router = (0, express_1.Router)();
router.get("/", auth_middleware_1.requireAuth, interventions_controller_1.listInterventions);
router.post("/", auth_middleware_1.requireAuth, (0, validate_middleware_1.validate)(intervention_validator_1.upsertInterventionSchema), interventions_controller_1.createInterventionController);
router.put("/:id", auth_middleware_1.requireAuth, interventions_controller_1.updateInterventionController);
router.delete("/:id", auth_middleware_1.requireAuth, interventions_controller_1.deleteInterventionController);
exports.default = router;
//# sourceMappingURL=interventions.routes.js.map