"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcStockStatus = calcStockStatus;
exports.calcPointCommande = calcPointCommande;
exports.recalculateLubricantStats = recalculateLubricantStats;
exports.recalculateAllLubricantStats = recalculateAllLubricantStats;
const prisma_1 = require("../database/prisma");
function calcStockStatus(stockActuel, stockMin) {
    if (stockActuel <= stockMin * 0.5)
        return "CRITIQUE";
    if (stockActuel <= stockMin)
        return "FAIBLE";
    return "NORMAL";
}
function calcPointCommande(consommationMoyenne, delaiApprovisionnement, stockSecurite) {
    return consommationMoyenne * delaiApprovisionnement + stockSecurite;
}
async function recalculateLubricantStats(lubrifiantId) {
    const interventions = await prisma_1.prisma.intervention.findMany({
        where: { lubrifiantId },
        orderBy: { date: "desc" },
    });
    const lub = await prisma_1.prisma.lubrifiant.findUniqueOrThrow({
        where: { id: lubrifiantId },
    });
    const totalQ = interventions.reduce((acc, i) => acc + (i.quantite ?? 0), 0);
    const jours = interventions.length > 1
        ? (new Date(interventions[0].date).getTime() -
            new Date(interventions[interventions.length - 1].date).getTime()) /
            (1000 * 60 * 60 * 24)
        : 1;
    const consommationMoyenne = jours > 0 ? totalQ / jours : 0;
    const pointCommande = calcPointCommande(consommationMoyenne, lub.delaiApprovisionnement, lub.stockSecurite);
    const statut = calcStockStatus(lub.stockActuel, lub.stockMin);
    return prisma_1.prisma.lubrifiant.update({
        where: { id: lubrifiantId },
        data: {
            consommationMoyenne: Number(consommationMoyenne.toFixed(2)),
            pointCommande: Number(pointCommande.toFixed(2)),
            statut,
            derniereMiseAJour: new Date(),
        },
    });
}
async function recalculateAllLubricantStats() {
    const lubs = await prisma_1.prisma.lubrifiant.findMany({ select: { id: true } });
    await Promise.all(lubs.map((lub) => recalculateLubricantStats(lub.id)));
}
//# sourceMappingURL=inventory.service.js.map