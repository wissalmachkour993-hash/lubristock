"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.getEquipements = getEquipements;
const prisma_1 = require("../database/prisma");
async function getCategories(_req, res) {
    const categories = await prisma_1.prisma.categorie.findMany({ orderBy: { nom: "asc" } });
    return res.json(categories);
}
async function getEquipements(req, res) {
    const categorieId = String(req.query.categorie_id ?? "");
    const data = await prisma_1.prisma.equipement.findMany({
        where: categorieId ? { categorieId } : undefined,
        orderBy: { nom: "asc" },
    });
    return res.json(data);
}
//# sourceMappingURL=equipments.controller.js.map