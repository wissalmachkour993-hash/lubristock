"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSettingsController = getSettingsController;
exports.updateThemeController = updateThemeController;
exports.resetDataController = resetDataController;
const prisma_1 = require("../database/prisma");
async function getSettingsController(_req, res) {
    const settings = await prisma_1.prisma.setting.findMany();
    const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return res.json(map);
}
async function updateThemeController(req, res) {
    const theme = String(req.body.theme ?? "clear");
    const setting = await prisma_1.prisma.setting.upsert({
        where: { key: "theme" },
        update: { value: theme },
        create: { key: "theme", value: theme },
    });
    return res.json(setting);
}
async function resetDataController(_req, res) {
    await prisma_1.prisma.intervention.deleteMany();
    await prisma_1.prisma.planification.deleteMany();
    return res.json({ message: "Données intervention et planification réinitialisées" });
}
//# sourceMappingURL=settings.controller.js.map