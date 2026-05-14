"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertInterventionSchema = void 0;
const zod_1 = require("zod");
exports.upsertInterventionSchema = zod_1.z.object({
    date: zod_1.z.string(),
    categorieId: zod_1.z.string().min(1),
    equipementId: zod_1.z.string().min(1),
    lubrifiantId: zod_1.z.string().min(1),
    type: zod_1.z.enum(["vidange", "appoint"]),
    quantite: zod_1.z.number().positive(),
    compteurHoraire: zod_1.z.number().nonnegative(),
    responsable: zod_1.z.string().min(2),
    observation: zod_1.z.string().optional(),
});
