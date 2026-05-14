"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = loginController;
exports.logoutController = logoutController;
const auth_service_1 = require("../services/auth.service");
async function loginController(req, res) {
    try {
        const data = await (0, auth_service_1.login)(req.body.email, req.body.password);
        return res.json(data);
    }
    catch (error) {
        return res.status(401).json({ message: error.message });
    }
}
async function logoutController(_req, res) {
    return res.json({ message: "Logout effectue cote client (token JWT)" });
}
