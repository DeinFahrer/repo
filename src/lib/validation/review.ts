import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(10, "Bitte schreibe mindestens 10 Zeichen.").max(500),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
