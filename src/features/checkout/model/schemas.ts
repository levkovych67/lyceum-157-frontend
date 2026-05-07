import { z } from "zod";
export const CheckoutSchema = z.object({
  buyerEmail: z.string().email("Невірний email").max(255),
  buyerName: z.string().min(1, "Обовʼязкове").max(255),
  buyerPhone: z.string().regex(/^\+380\d{9}$/, "Формат +380XXXXXXXXX"),
});
export type CheckoutInput = z.input<typeof CheckoutSchema>;
