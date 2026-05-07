import { z } from "zod";
export const RejectProductSchema = z.object({
  reason: z.string().min(10, "Мін. 10 символів").max(500),
});
export type RejectInput = z.input<typeof RejectProductSchema>;
