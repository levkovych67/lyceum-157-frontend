import { z } from "zod";
export const CardUpdateSchema = z.object({
  payoutCard: z
    .string()
    .regex(/^[\d\s]{13,23}$/, "13–19 цифр")
    .transform((v) => v.replace(/\s/g, "")),
});
export type CardUpdateInput = z.input<typeof CardUpdateSchema>;
