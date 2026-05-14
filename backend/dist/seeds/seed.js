"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const inventory_service_1 = require("../services/inventory.service");
const prisma = new client_1.PrismaClient();
const categoriesData = {
    "Sendeuse": ["DKS", "SKF1", "SKF2"],
    "Camion 190T": ["KOM1", "KOM2", "KOM3"],
    "Camion 136T": ["HP21", "HP23", "UR131", "UR132", "UR134", "TERX1", "TERX2", "TERX3", "TERX4"],
    "Bulle D9R": ["D9R2", "D9R4", "D9R5", "D9R6", "D9R7", "D9R8", "D9R9", "D9R10", "D9R11"],
    D9T: ["D11T1", "D11T2", "D11T3", "D11T4", "D11T5", "D11T6", "D11T7"],
    Chargeuse: ["CH992K", "CHF1", "CHF2"],
    "Pay dozer": ["PAY KO 564238", "PAY 600 W2", "PAY 600 W3"],
    Niveleuse: ["NIV 5 KOM", "NIV 6 KOM", "NIV-7 CAT"],
    "Moyens de servitude": [
        "Camion CAT (rav)",
        "Arroseur CAT",
        "Camion VOLVO",
        "PILETEUSE W1 (JOHN DEERE)",
        "PILETEUSE W2 (JOHN DEERE)",
        "MINI CH CASE W1",
        "MINI CH CASE W2",
        "LH-22",
        "HYSTER-1",
        "HYSTER-2",
        "TCM120",
        "HELI",
        "CH CASE 921 E",
        "Volvo",
    ],
};
async function seed() {
    const adminHash = await bcryptjs_1.default.hash("admin123", 10);
    await prisma.user.upsert({
        where: { email: "admin@ocp.ma" },
        update: {},
        create: {
            email: "admin@ocp.ma",
            fullName: "Admin OCP",
            passwordHash: adminHash,
            role: "admin",
        },
    });
    for (const [name, equipements] of Object.entries(categoriesData)) {
        const categorie = await prisma.categorie.upsert({
            where: { nom: name },
            update: {},
            create: { nom: name },
        });
        for (const equipement of equipements) {
            await prisma.equipement.upsert({
                where: { nom: equipement },
                update: { categorieId: categorie.id },
                create: { nom: equipement, categorieId: categorie.id, actif: true },
            });
        }
    }
    const lubs = [
        { nom: "Huile moteur 140", stockActuel: 850, stockMin: 200, stockSecurite: 120, stockMax: 1400, delaiApprovisionnement: 7, prixUnitaire: 45, unite: "L" },
        { nom: "Huile hydraulique 466", stockActuel: 1200, stockMin: 300, stockSecurite: 180, stockMax: 1600, delaiApprovisionnement: 8, prixUnitaire: 52, unite: "L" },
        { nom: "Huile BV 423", stockActuel: 180, stockMin: 150, stockSecurite: 90, stockMax: 600, delaiApprovisionnement: 10, prixUnitaire: 68, unite: "L" },
        { nom: "Huile reducteur 385", stockActuel: 95, stockMin: 100, stockSecurite: 80, stockMax: 550, delaiApprovisionnement: 9, prixUnitaire: 75, unite: "L" },
    ];
    for (const l of lubs) {
        const consommationMoyenne = 0;
        const pointCommande = (0, inventory_service_1.calcPointCommande)(consommationMoyenne, l.delaiApprovisionnement, l.stockSecurite);
        const statut = l.stockActuel <= l.stockMin * 0.5 ? "critique" : l.stockActuel <= l.stockMin ? "faible" : "normal";
        await prisma.lubrifiant.upsert({
            where: { nom: l.nom },
            update: {
                ...l,
                pointCommande,
                consommationMoyenne,
                statut,
            },
            create: {
                ...l,
                pointCommande,
                consommationMoyenne,
                statut,
            },
        });
    }
    await prisma.setting.upsert({
        where: { key: "theme" },
        update: { value: "clear" },
        create: { key: "theme", value: "clear" },
    });
}
seed()
    .then(async () => {
    await prisma.$disconnect();
    console.log("Seed terminé.");
})
    .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
