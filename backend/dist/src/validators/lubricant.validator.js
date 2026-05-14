"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertLubricantSchema = void 0;
const zod_1 = require("zod");
exports.upsertLubricantSchema = zod_1.z.object({
    nom: zod_1.z.string().min(2),
    stockActuel: zod_1.z.number().nonnegative(),
    stockMin: zod_1.z.number().positive(),
    stockSecurite: zod_1.z.number().nonnegative(),
    stockMax: zod_1.z.number().positive(),
    delaiApprovisionnement: zod_1.z.number().int().positive(),
    prixUnitaire: zod_1.z.number().nonnegative(),
    unite: zod_1.z.string().min(1),
});
//# sourceMappingURL=lubricant.validator.js.map