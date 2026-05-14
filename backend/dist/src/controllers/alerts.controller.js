"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsController = alertsController;
const dashboard_service_1 = require("../services/dashboard.service");
async function alertsController(_req, res) {
    return res.json(await (0, dashboard_service_1.getAlerts)());
}
//# sourceMappingURL=alerts.controller.js.map