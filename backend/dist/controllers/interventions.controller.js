"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listInterventions = listInterventions;
exports.createInterventionController = createInterventionController;
exports.updateInterventionController = updateInterventionController;
exports.deleteInterventionController = deleteInterventionController;
const prisma_1 = require("../database/prisma");
const intervention_service_1 = require("../services/intervention.service");
async function listInterventions(req, res) {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const categorieId = String(req.query.categorie_id ?? "");
    const equipementId = String(req.query.equipement_id ?? "");
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const data = await prisma_1.prisma.intervention.findMany({
        where: {
            ...(categorieId ? { categorieId } : {}),
            ...(equipementId ? { equipementId } : {}),
            ...(from || to ? { date: { gte: from, lte: to } } : {}),
        },
        include: { categorie: true, equipement: true, lubrifiant: true },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
    });
    return res.json(data);
}
async function createInterventionController(req, res) {
    const intervention = await (0, intervention_service_1.createIntervention)({
        ...req.body,
        date: new Date(req.body.date),
    });
    return res.status(201).json(intervention);
}
async function updateInterventionController(req, res) {
    const intervention = await prisma_1.prisma.intervention.update({
        where: { id: String(req.params.id) },
        data: {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : undefined,
        },
    });
    return res.json(intervention);
}
async function deleteInterventionController(req, res) {
    await prisma_1.prisma.intervention.delete({ where: { id: String(req.params.id) } });
    return res.status(204).send();
}
