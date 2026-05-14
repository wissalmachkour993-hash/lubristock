"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.createUser = createUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../database/prisma");
const env_1 = require("../config/env");
async function login(email, password) {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Identifiants invalides");
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid)
        throw new Error("Identifiants invalides");
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
        },
    };
}
async function createUser(data) {
    const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
    return prisma_1.prisma.user.create({
        data: {
            email: data.email,
            fullName: data.fullName,
            role: data.role ?? "utilisateur",
            passwordHash,
        },
    });
}
//# sourceMappingURL=auth.service.js.map