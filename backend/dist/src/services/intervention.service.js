"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntervention = createIntervention;
const prisma_1 = require("../database/prisma");
const inventory_service_1 = require("./inventory.service");
async function createIntervention(data) {
    if (!data.lubrifiantId)
        throw new Error("Lubrifiant ID requis");
    if (typeof data.quantite !== "number")
        throw new Error("Quantité invalide");
    const quantite = data.quantite;
    const intervention = await prisma_1.prisma.$transaction(async (tx) => {
        // 1. Vérifier + décrémenter stock (safe)
        const updated = await tx.lubrifiant.updateMany({
            where: {
                id: data.lubrifiantId,
                stockActuel: { gte: quantite },
            },
            data: {
                stockActuel: { decrement: quantite },
                derniereMiseAJour: new Date(),
            },
        });
        if (updated.count === 0) {
            throw new Error("Stock insuffisant");
        }
        // 2. Créer intervention
        return await tx.intervention.create({ data });
    });
    await (0, inventory_service_1.recalculateLubricantStats)(intervention.lubrifiantId);
    return intervention;
}
//# sourceMappingURL=intervention.service.js.map