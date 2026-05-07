import { z } from "zod";
export const PayoutBatchSchema = z.object({
  payoutIds: z.array(z.string().uuid()).min(1).max(200),
});
export type PayoutBatchInput = z.input<typeof PayoutBatchSchema>;
