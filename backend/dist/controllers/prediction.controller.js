"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockPredictionController = stockPredictionController;
const prediction_service_1 = require("../services/prediction.service");
async function stockPredictionController(_req, res) {
    return res.json(await (0, prediction_service_1.getStockRupturePrediction)());
}
