"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcStockStatus = calcStockStatus;
exports.calcPointCommande = calcPointCommande;
exports.recalculateLubricantStats = recalculateLubricantStats;
exports.recalculateAllLubricantStats = recalculateAllLubricantStats;
const prisma_1 = require("../database/prisma");
function calcStockStatus(stockActuel, stockMin) {
    if (stockActuel <= stockMin * 0.5)
        return "critique";
    if (stockActuel <= stockMin)
        return "faible";
    return "normal";
}
function calcPointCommande(consommationMoyenne, delaiApprovisionnement, stockSecurite) {
    return consommationMoyenne * delaiApprovisionnement + stockSecurite;
}
async function recalculateLubricantStats(lubrifiantId) {
    const interventions = await prisma_1.prisma.intervention.findMany({
        where: { lubrifiantId },
        orderBy: { date: "desc" },
    });
    const lub = await prisma_1.prisma.lubrifiant.findUniqueOrThrow({ where: { id: lubrifiantId } });
    const totalQ = interventions.reduce((acc, i) => acc + i.quantite, 0);
    const avg = interventions.length ? totalQ / interventions.length : 0;
    const pointCommande = calcPointCommande(avg, lub.delaiApprovisionnement, lub.stockSecurite);
    const statut = calcStockStatus(lub.stockActuel, lub.stockMin);
    return prisma_1.prisma.lubrifiant.update({
        where: { id: lubrifiantId },
        data: {
            consommationMoyenne: Number(avg.toFixed(2)),
            pointCommande: Number(pointCommande.toFixed(2)),
            statut,
            derniereMiseAJour: new Date(),
        },
    });
}
async function recalculateAllLubricantStats() {
    const lubs = await prisma_1.prisma.lubrifiant.findMany({ select: { id: true } });
    for (const lub of lubs) {
        await recalculateLubricantStats(lub.id);
    }
}
