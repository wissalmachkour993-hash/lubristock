"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token manquant" });
    }
    const token = header.slice("Bearer ".length);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = decoded;
        return next();
    }
    catch (_e) {
        return res.status(401).json({ message: "Token invalide" });
    }
}
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json({ message: "Non autorise" });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Acces refuse" });
        }
        return next();
    };
}
//# sourceMappingURL=auth.middleware.js.map