import { z } from "zod";

export const upsertLubricantSchema = z.object({
  nom: z.string().min(2),
  stockActuel: z.number().nonnegative(),
  stockMin: z.number().positive(),
  stockSecurite: z.number().nonnegative(),
  stockMax: z.number().positive(),
  delaiApprovisionnement: z.number().int().positive(),
  prixUnitaire: z.number().nonnegative(),
  unite: z.string().min(1),
});
