"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLubricants = listLubricants;
exports.createLubricant = createLubricant;
exports.updateLubricant = updateLubricant;
exports.deleteLubricant = deleteLubricant;
const prisma_1 = require("../database/prisma");
const inventory_service_1 = require("../services/inventory.service");
async function listLubricants(req, res) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await prisma_1.prisma.lubrifiant.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
    });
    return res.json(data);
}
async function createLubricant(req, res) {
    const pointCommande = (0, inventory_service_1.calcPointCommande)(req.body.consommationMoyenne ?? 0, req.body.delaiApprovisionnement, req.body.stockSecurite);
    const statut = (0, inventory_service_1.calcStockStatus)(req.body.stockActuel, req.body.stockMin);
    const data = await prisma_1.prisma.lubrifiant.create({
        data: { ...req.body, pointCommande, statut },
    });
    return res.status(201).json(data);
}
async function updateLubricant(req, res) {
    const id = String(req.params.id);
    const payload = { ...req.body };
    if (payload.stockActuel !== undefined && payload.stockMin !== undefined) {
        payload.statut = (0, inventory_service_1.calcStockStatus)(payload.stockActuel, payload.stockMin);
    }
    const data = await prisma_1.prisma.lubrifiant.update({ where: { id }, data: payload });
    await (0, inventory_service_1.recalculateLubricantStats)(id);
    return res.json(data);
}
async function deleteLubricant(req, res) {
    await prisma_1.prisma.lubrifiant.delete({ where: { id: String(req.params.id) } });
    return res.status(204).send();
}
//# sourceMappingURL=lubricants.controller.js.map