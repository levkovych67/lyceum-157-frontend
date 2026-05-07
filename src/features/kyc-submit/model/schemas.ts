import { z } from "zod";
export const KycSubmitSchema = z.object({
  parentName: z.string().min(1, "Обовʼязкове").max(255),
  parentRnokpp: z.string().regex(/^\d{10}$/, "10 цифр"),
  payoutCard: z
    .string()
    .regex(/^[\d\s]{13,23}$/, "13–19 цифр")
    .transform((v) => v.replace(/\s/g, "")),
});
export type KycSubmitInput = z.input<typeof KycSubmitSchema>;
