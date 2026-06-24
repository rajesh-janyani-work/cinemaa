import { z } from "zod";


// A Mongo ObjectId is 24 hex chars — validate at the edge so a bad id
// returns 400 (Zod) instead of reaching the DB.
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Object ID");

const futureDate = z.coerce
  .date()
  .refine((d) => d.getTime() > Date.now(), "Show must start in the future");

export const createShowSchema = z.object({
  movieId: objectId,
  screenName: z.string().min(1, "Screen name is required").trim(),
  startTime: futureDate,
  price: z.number().nonnegative("Price cannot be negative"),
  layout: z.object({
    rows: z.number().int().min(1).max(26, "Max 26 rows (A-Z)"),
    seatsPerRow: z.number().int().min(1).max(50, "Max 50 seats per row"),
  }),
});

export const updateShowSchema = z
  .object({
    screenName: z.string().min(1).trim(),
    startTime: futureDate,
    price: z.number().nonnegative(),
    isActive: z.boolean(),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "At least one field must be provided");

export type CreateShowInput = z.infer<typeof createShowSchema>;
export type UpdateShowInput = z.infer<typeof updateShowSchema>;