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
    <div className="relative mx-auto mt-8 max-w-md rotate-[1deg] border-[1.5px] border-burgundy bg-bg-warm p-8 shadow-[0_12px_24px_rgba(0,0,0,0.18)] md:mx-0">
      <Form onSubmit={form.handleSubmit} className="space-y-6">
        <FormField name="email" label="Email" required error={form.formState.errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            {...form.register("email")}
            className="rounded-none border-b border-ink bg-transparent px-0 shadow-none focus:ring-0"
          />
        </FormField>
        <FormField
          name="password"
          label="Пароль"
          required
          hint="8+ символів"
          error={form.formState.errors.password?.message}
        >
          <Input
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
            className="rounded-none border-b border-ink bg-transparent px-0 shadow-none focus:ring-0"
          />
        </FormField>
        <FormFooter className="border-ink/30 mt-6 border-t-[1.5px] border-dashed pt-6">
          <Link href="/register" className="font-hand text-hand-m text-burgundy hover:underline">
            Немає картки?
          </Link>
          <PillButton
            type="submit"
            loading={m.isPending}
            className="hover:bg-burgundy/90 bg-burgundy text-bg-warm"
          >
            Увійти
          </PillButton>
        </FormFooter>
      </Form>
    </div>
  );
}
