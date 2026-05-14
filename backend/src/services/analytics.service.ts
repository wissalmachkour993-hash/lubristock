import { prisma } from "../database/prisma";

export async function getPareto() {
  const grouped = await prisma.intervention.groupBy({
    by: ["equipementId"],
    _sum: { quantite: true },
    orderBy: { _sum: { quantite: "desc" } },
  });
  const total = grouped.reduce((acc, i) => acc + (i._sum.quantite ?? 0), 0);
  let cumulative = 0;
  return Promise.all(
    grouped.map(async (item) => {
      const value = item._sum.quantite ?? 0;
      cumulative += value;
      const eq = await prisma.equipement.findUnique({ where: { id: item.equipementId } });
      return {
        equipement: eq?.nom ?? item.equipementId,
        consommation: Number(value.toFixed(2)),
        cumul: total > 0 ? Number(((cumulative / total) * 100).toFixed(2)) : 0,
      };
    })
  );
}

export async function getConsumptionVsHours() {
  const rows = await prisma.intervention.findMany({
    include: { equipement: true },
  });
  const map = new Map<string, { equipement: string; consommation: number; heures: number }>();
  rows.forEach((r) => {
    const key = r.equipementId;
    const item = map.get(key) ?? { equipement: r.equipement.nom, consommation: 0, heures: 0 };
    item.consommation += r.quantite;
    item.heures = Math.max(item.heures, r.compteurHoraire);
    map.set(key, item);
  });
  return Array.from(map.values()).map((i) => ({
    ...i,
    ratio: i.heures > 0 ? Number((i.consommation / i.heures).toFixed(5)) : 0,
  }));
}

export async function getHealthScore() {
  const data = await getConsumptionVsHours();
  return data.map((row) => {
    const score = Math.max(0, Math.min(100, 100 - row.ratio * 4000));
    return {
      equipement: row.equipement,
      score_sante: Number(score.toFixed(2)),
      statut: score >= 80 ? "bon" : score >= 60 ? "moyen" : "critique",
    };
  });
}
