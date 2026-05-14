"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKpis = getKpis;
exports.getTopEquipements = getTopEquipements;
exports.getConsommationMensuelle = getConsommationMensuelle;
exports.getDistributionLubrifiants = getDistributionLubrifiants;
exports.getEtatStocks = getEtatStocks;
exports.getAlerts = getAlerts;
const prisma_1 = require("../database/prisma");
function monthWindow(date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return { start, end };
}
async function getKpis() {
    const { start, end } = monthWindow();
    const [lubs, interventionsMonth, interventionsAll, equipements, alerts] = await Promise.all([
        prisma_1.prisma.lubrifiant.findMany(),
        prisma_1.prisma.intervention.findMany({ where: { date: { gte: start, lt: end } } }),
        prisma_1.prisma.intervention.findMany(),
        prisma_1.prisma.equipement.findMany({ where: { actif: true } }),
        getAlerts(),
    ]);
    const stockTotal = lubs.reduce((acc, l) => acc + l.stockActuel, 0);
    const consommationMois = interventionsMonth.reduce((acc, i) => acc + i.quantite, 0);
    const totalInterventions = interventionsAll.length;
    const heuresMachineMoyennes = interventionsAll.length > 0
        ? interventionsAll.reduce((acc, i) => acc + i.compteurHoraire, 0) / interventionsAll.length
        : 0;
    return {
        stock_total: Number(stockTotal.toFixed(2)),
        consommation_mois: Number(consommationMois.toFixed(2)),
        machines_actives: equipements.length,
        anomalies_detectees: alerts.length,
        total_interventions: totalInterventions,
        heures_machine_moyennes: Number(heuresMachineMoyennes.toFixed(2)),
    };
}
async function getTopEquipements() {
    const rows = await prisma_1.prisma.intervention.groupBy({
        by: ["equipementId"],
        _sum: { quantite: true },
        orderBy: { _sum: { quantite: "desc" } },
        take: 5,
    });
    return Promise.all(rows.map(async (row) => {
        const equipement = await prisma_1.prisma.equipement.findUnique({ where: { id: row.equipementId } });
        return {
            equipement_id: row.equipementId,
            equipement: equipement?.nom ?? "N/A",
            consommation: Number((row._sum.quantite ?? 0).toFixed(2)),
        };
    }));
}
async function getConsommationMensuelle() {
    const rows = await prisma_1.prisma.intervention.findMany();
    const map = new Map();
    rows.forEach((i) => {
        const date = i.date;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const item = map.get(key) ?? { vidange: 0, appoint: 0 };
        if (i.type === "vidange")
            item.vidange += i.quantite;
        else
            item.appoint += i.quantite;
        map.set(key, item);
    });
    return Array.from(map.entries())
        .map(([mois, values]) => ({ mois, ...values }))
        .sort((a, b) => a.mois.localeCompare(b.mois));
}
async function getDistributionLubrifiants() {
    const rows = await prisma_1.prisma.intervention.groupBy({
        by: ["lubrifiantId"],
        _sum: { quantite: true },
    });
    const total = rows.reduce((acc, r) => acc + (r._sum.quantite ?? 0), 0);
    return Promise.all(rows.map(async (row) => {
        const lub = await prisma_1.prisma.lubrifiant.findUnique({ where: { id: row.lubrifiantId } });
        const raw = row._sum.quantite ?? 0;
        return {
            lubrifiant_id: row.lubrifiantId,
            lubrifiant: lub?.nom ?? "N/A",
            quantite: Number(raw.toFixed(2)),
            pourcentage: total > 0 ? Number(((raw / total) * 100).toFixed(2)) : 0,
        };
    }));
}
async function getEtatStocks() {
    const lubs = await prisma_1.prisma.lubrifiant.findMany();
    return lubs.map((l) => ({
        id: l.id,
        nom: l.nom,
        stock_actuel: l.stockActuel,
        stock_min: l.stockMin,
        statut: l.statut,
    }));
}
async function getAlerts() {
    const [lubs, interventions] = await Promise.all([prisma_1.prisma.lubrifiant.findMany(), prisma_1.prisma.intervention.findMany()]);
    const alerts = [];
    lubs.forEach((l) => {
        if (l.statut === "critique")
            alerts.push({ type: "stock_critique", message: `Stock critique: ${l.nom}` });
    });
    const byEquip = new Map();
    interventions.forEach((i) => {
        const list = byEquip.get(i.equipementId) ?? [];
        list.push(i.quantite);
        byEquip.set(i.equipementId, list);
    });
    byEquip.forEach((values, equipementId) => {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        if (values.some((q) => q > avg * 1.3))
            alerts.push({ type: "anomalie", message: `Variation anormale sur ${equipementId}` });
    });
    return alerts;
}
