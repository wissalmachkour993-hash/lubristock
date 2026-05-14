import { InterventionType, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma";
import { recalculateLubricantStats } from "./inventory.service";

export async function createIntervention(data: Prisma.InterventionUncheckedCreateInput) {
  return prisma.$transaction(async (tx) => {
    const intervention = await tx.intervention.create({ data });
    const q = data.quantite as number;
    const delta = data.type === InterventionType.ravitaillement ? q : -q;
    await tx.lubrifiant.update({
      where: { id: data.lubrifiantId },
      data: {
        stockActuel: { increment: delta },
        derniereMiseAJour: new Date(),
      },
    });
    return intervention;
  }).then(async (intervention) => {
    await recalculateLubricantStats(intervention.lubrifiantId);
    return intervention;
  });
}
