import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Вкажіть email")
    .email("Перевірте email — здається, є помилка")
    .max(255, "Email задовгий"),
  password: z.string().min(1, "Вкажіть пароль").max(128, "Пароль задовгий"),
});
export type LoginInput = z.input<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    email: z
      .string()
      .min(1, "Вкажіть email учня")
      .email("Перевірте email — здається, є помилка")
      .max(255, "Email задовгий"),
    password: z.string().min(8, "Пароль — щонайменше 8 символів").max(128, "Пароль задовгий"),
    firstName: z.string().trim().min(1, "Вкажіть імʼя").max(100, "Імʼя задовге"),
    lastName: z.string().trim().min(1, "Вкажіть прізвище").max(100, "Прізвище задовге"),
    grade: z.string().trim().min(1, "Вкажіть клас").max(20, "Назва класу задовга"),
    parentEmail: z
      .string()
      .min(1, "Вкажіть email батьків")
      .email("Перевірте email батьків — здається, є помилка")
      .max(255, "Email задовгий"),
  })
  .refine((d) => d.email !== d.parentEmail, {
    message: "Email учня й батьків мають відрізнятись",
    path: ["parentEmail"],
  });
export type RegisterInput = z.input<typeof RegisterSchema>;
