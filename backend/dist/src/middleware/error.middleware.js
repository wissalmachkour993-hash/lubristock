"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
function notFoundHandler(_req, res) {
    res.status(404).json({ message: "Route introuvable" });
}
function errorHandler(error, _req, res, _next) {
    const status = error.status ?? 500;
    res.status(status).json({
        message: error.message || "Erreur interne serveur",
    });
}
//# sourceMappingURL=error.middleware.js.map