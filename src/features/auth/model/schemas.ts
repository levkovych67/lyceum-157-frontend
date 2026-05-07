import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Невірний email").max(255),
  password: z.string().min(8, "Мінімум 8 символів").max(128),
});
export type LoginInput = z.input<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1, "Обовʼязкове").max(100),
    lastName: z.string().min(1, "Обовʼязкове").max(100),
    grade: z.string().regex(/^\d{1,2}-[А-ЯA-Z]$/, "формат 9-А або 11-B"),
    parentEmail: z.string().email().max(255),
  })
  .refine((d) => d.email !== d.parentEmail, {
    message: "Email учня й батьків мають відрізнятись",
    path: ["parentEmail"],
  });
export type RegisterInput = z.input<typeof RegisterSchema>;
