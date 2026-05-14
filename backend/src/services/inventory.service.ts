import { StockStatus } from "@prisma/client";
import { prisma } from "../database/prisma";

export function calcStockStatus(stockActuel: number, stockMin: number): StockStatus {
  if (stockActuel <= stockMin * 0.5) return "critique";
  if (stockActuel <= stockMin) return "faible";
  return "normal";
}

export function calcPointCommande(consommationMoyenne: number, delaiApprovisionnement: number, stockSecurite: number) {
  return consommationMoyenne * delaiApprovisionnement + stockSecurite;
}

export async function recalculateLubricantStats(lubrifiantId: string) {
  const interventions = await prisma.intervention.findMany({
    where: { lubrifiantId },
    orderBy: { date: "desc" },
  });
  const lub = await prisma.lubrifiant.findUniqueOrThrow({ where: { id: lubrifiantId } });

  const totalQ = interventions.reduce((acc, i) => acc + i.quantite, 0);
  const avg = interventions.length ? totalQ / interventions.length : 0;
  const pointCommande = calcPointCommande(avg, lub.delaiApprovisionnement, lub.stockSecurite);
  const statut = calcStockStatus(lub.stockActuel, lub.stockMin);

  return prisma.lubrifiant.update({
    where: { id: lubrifiantId },
    data: {
      consommationMoyenne: Number(avg.toFixed(2)),
      pointCommande: Number(pointCommande.toFixed(2)),
      statut,
      derniereMiseAJour: new Date(),
    },
  });
}

export async function recalculateAllLubricantStats() {
  const lubs = await prisma.lubrifiant.findMany({ select: { id: true } });
  for (const lub of lubs) {
    await recalculateLubricantStats(lub.id);
  }
}
