import { z } from "zod";
export const CreateProductSchema = z
  .object({
    title: z.string().min(1, "Обовʼязкове").max(200),
    description: z.string().min(1, "Обовʼязкове").max(10_000),
    priceUah: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Формат 850.00")
      .refine((v) => {
        const n = parseFloat(v);
        return n >= 50 && n <= 50_000;
      }, "Від 50.00 до 50000.00"),
    type: z.enum(["PHYSICAL", "DIGITAL"]),
    stockQty: z.coerce.number().int().min(0),
  })
  .refine((d) => d.type === "DIGITAL" || d.stockQty > 0, {
    message: "Для PHYSICAL вкажіть кількість > 0",
    path: ["stockQty"],
  });
export type CreateProductInput = z.input<typeof CreateProductSchema>;
