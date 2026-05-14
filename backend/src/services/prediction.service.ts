import { prisma } from "../database/prisma";

export async function getStockRupturePrediction() {
  const lubs = await prisma.lubrifiant.findMany();
  return lubs.map((l) => {
    const daily = l.consommationMoyenne > 0 ? l.consommationMoyenne : 0.1;
    const joursRestants = l.stockActuel / daily;
    return {
      lubrifiant_id: l.id,
      lubrifiant: l.nom,
      jours_restants: Number(joursRestants.toFixed(1)),
      date_rupture_estimee: new Date(Date.now() + joursRestants * 24 * 3600 * 1000),
      risque_rupture: joursRestants <= 14,
    };
  });
}
