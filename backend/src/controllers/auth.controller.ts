import { Request, Response } from "express";
import { login } from "../services/auth.service";

export async function loginController(req: Request, res: Response) {
  try {
    const data = await login(req.body.email, req.body.password);
    return res.json(data);
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
}

export async function logoutController(_req: Request, res: Response) {
  return res.json({ message: "Logout effectue cote client (token JWT)" });
}
