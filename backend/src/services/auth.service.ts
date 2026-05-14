import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../database/prisma";
import { env } from "../config/env";
import { Role } from "@prisma/client";

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Identifiants invalides");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Identifiants invalides");

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_SECRET as jwt.Secret,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

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

export async function createUser(data: { email: string; password: string; fullName: string; role?: Role }) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      role: data.role ?? "utilisateur",
      passwordHash,
    },
  });
}
