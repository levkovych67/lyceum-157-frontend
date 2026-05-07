"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter } from "@/shared/ui";
import { LoginSchema, type LoginInput } from "@/features/auth/model/schemas";
import { useLogin } from "@/features/auth/model/use-login";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const m = useLogin();
  const form = useAppForm({
    schema: LoginSchema,
    defaultValues: { email: "", password: "" } as LoginInput,
    onSubmit: async (data) => {
      await m.mutateAsync(data);
      const from = sp.get("from");
      router.push(from && from.length > 0 ? from : "/");
    },
  });
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-md">
      <FormField name="email" label="Email" required error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField
        name="password"
        label="Пароль"
        required
        hint="8+ символів"
        error={form.formState.errors.password?.message}
      >
        <Input type="password" autoComplete="current-password" {...form.register("password")} />
      </FormField>
      <FormFooter>
        <Link href="/register" className="font-hand text-hand-s text-burgundy">
          Немає картки? Зареєструйся
        </Link>
        <PillButton type="submit" loading={m.isPending}>
          Увійти
        </PillButton>
      </FormFooter>
    </Form>
  );
}
