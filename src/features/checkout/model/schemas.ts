import { z } from "zod";

const NovaPoshtaDetailsSchema = z.object({
  cityRef: z.string().min(1, "Оберіть місто"),
  cityName: z.string().min(1),
  branchRef: z.string().min(1, "Оберіть відділення або поштомат"),
  branchNumber: z.string(),
  branchType: z.enum(["BRANCH", "POSTBOX"]),
  branchAddress: z.string(),
});

const DeliverySchema = z.object({
  method: z.literal("NOVA_POSHTA"),
  details: NovaPoshtaDetailsSchema,
});

export const CheckoutSchema = z.object({
  buyerEmail: z.string().email("Невірний email").max(255),
  buyerName: z.string().min(1, "Обовʼязкове").max(255),
  buyerPhone: z.string().regex(/^\+380\d{9}$/, "Формат +380XXXXXXXXX"),
  delivery: DeliverySchema,
});

export type CheckoutInput = z.input<typeof CheckoutSchema>;
export type NovaPoshtaDetailsInput = z.input<typeof NovaPoshtaDetailsSchema>;
