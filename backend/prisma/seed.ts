import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL manquant dans l'environnement");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@ocp.ma" },
    update: {
      passwordHash: hash,
      role: "admin",
      fullName: "Administrateur",
    },
    create: {
      email: "admin@ocp.ma",
      passwordHash: hash,
      role: "admin",
      fullName: "Administrateur",
    },
  });

  console.log("✅ Utilisateur admin créé");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
