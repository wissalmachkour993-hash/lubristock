"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kpisController = kpisController;
exports.topEquipementsController = topEquipementsController;
exports.consommationMensuelleController = consommationMensuelleController;
exports.distributionLubrifiantsController = distributionLubrifiantsController;
exports.etatStocksController = etatStocksController;
const dashboard_service_1 = require("../services/dashboard.service");
async function kpisController(_req, res) {
    return res.json(await (0, dashboard_service_1.getKpis)());
}
async function topEquipementsController(_req, res) {
    return res.json(await (0, dashboard_service_1.getTopEquipements)());
}
async function consommationMensuelleController(_req, res) {
    return res.json(await (0, dashboard_service_1.getConsommationMensuelle)());
}
async function distributionLubrifiantsController(_req, res) {
    return res.json(await (0, dashboard_service_1.getDistributionLubrifiants)());
}
async function etatStocksController(_req, res) {
    return res.json(await (0, dashboard_service_1.getEtatStocks)());
}
