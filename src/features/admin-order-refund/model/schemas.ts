import { z } from "zod";
export const RefundSchema = z.object({ reason: z.string().min(5, "Мін. 5 символів").max(500) });
export type RefundInput = z.input<typeof RefundSchema>;
