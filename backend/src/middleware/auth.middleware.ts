import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthPayload, AuthRequest } from "../types";

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    return next();
  } catch (_e) {
    return res.status(401).json({ message: "Token invalide" });
  }
}

export function requireRole(roles: Array<"admin" | "utilisateur">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Non autorise" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acces refuse" });
    }
    return next();
  };
}
