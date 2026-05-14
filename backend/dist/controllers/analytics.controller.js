"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paretoController = paretoController;
exports.consommationHeuresController = consommationHeuresController;
exports.scoreSanteController = scoreSanteController;
const analytics_service_1 = require("../services/analytics.service");
async function paretoController(_req, res) {
    return res.json(await (0, analytics_service_1.getPareto)());
}
async function consommationHeuresController(_req, res) {
    return res.json(await (0, analytics_service_1.getConsumptionVsHours)());
}
async function scoreSanteController(_req, res) {
    return res.json(await (0, analytics_service_1.getHealthScore)());
}
