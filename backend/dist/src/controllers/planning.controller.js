"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPlanningController = listPlanningController;
exports.createPlanningController = createPlanningController;
const prisma_1 = require("../database/prisma");
async function listPlanningController(_req, res) {
    const data = await prisma_1.prisma.planification.findMany({
        include: { equipement: true, lubrifiant: true },
        orderBy: { prochaineEcheance: "asc" },
    });
    return res.json(data);
}
async function createPlanningController(req, res) {
    const item = await prisma_1.prisma.planification.create({
        data: {
            equipementId: req.body.equipementId,
            lubrifiantId: req.body.lubrifiantId,
            frequenceHeures: Number(req.body.frequenceHeures),
            prochaineEcheance: new Date(req.body.prochaineEcheance),
        },
    });
    return res.status(201).json(item);
}
//# sourceMappingURL=planning.controller.js.map