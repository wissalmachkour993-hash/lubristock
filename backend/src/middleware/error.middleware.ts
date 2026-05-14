import { NextFunction, Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: "Route introuvable" });
}

export function errorHandler(
  error: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = error.status ?? 500;
  res.status(status).json({
    message: error.message || "Erreur interne serveur",
  });
}
