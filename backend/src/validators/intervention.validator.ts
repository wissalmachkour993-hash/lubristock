import { z } from "zod";

export const upsertInterventionSchema = z.object({
  date: z.string(),
  categorieId: z.string().min(1),
  equipementId: z.string().min(1),
  lubrifiantId: z.string().min(1),
  type: z.enum(["vidange", "appoint"]),
  quantite: z.number().positive(),
  compteurHoraire: z.number().nonnegative(),
  responsable: z.string().min(2),
  observation: z.string().optional(),
});
