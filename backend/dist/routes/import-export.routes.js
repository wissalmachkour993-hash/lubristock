"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const import_export_controller_1 = require("../controllers/import-export.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.get("/import/interventions/template", auth_middleware_1.requireAuth, import_export_controller_1.downloadInterventionsTemplateController);
router.post("/import/interventions", auth_middleware_1.requireAuth, upload.single("file"), import_export_controller_1.importInterventionsController);
router.get("/export/lubrifiants", auth_middleware_1.requireAuth, import_export_controller_1.exportLubricantsController);
router.get("/export/interventions", auth_middleware_1.requireAuth, import_export_controller_1.exportInterventionsController);
router.get("/export/rapport-mensuel", auth_middleware_1.requireAuth, import_export_controller_1.exportMonthlyController);
router.get("/export/dashboard", auth_middleware_1.requireAuth, import_export_controller_1.exportDashboardController);
exports.default = router;
