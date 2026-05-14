"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntervention = createIntervention;
const prisma_1 = require("../database/prisma");
const inventory_service_1 = require("./inventory.service");
async function createIntervention(data) {
    return prisma_1.prisma.$transaction(async (tx) => {
        const intervention = await tx.intervention.create({ data });
        await tx.lubrifiant.update({
            where: { id: data.lubrifiantId },
            data: {
                stockActuel: { decrement: data.quantite },
                derniereMiseAJour: new Date(),
            },
        });
        return intervention;
    }).then(async (intervention) => {
        await (0, inventory_service_1.recalculateLubricantStats)(intervention.lubrifiantId);
        return intervention;
    });
}
