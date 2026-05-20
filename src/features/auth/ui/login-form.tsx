"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, Stamp } from "@/shared/ui";
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
    <div className="relative mx-auto mt-8 w-full max-w-[420px] rotate-[0.5deg] border-[1.5px] border-burgundy bg-bg-warm p-8 text-left shadow-paper">
      {/* Official "СХВАЛЕНО КУРАТОРОМ" Library Stamp */}
      <Stamp
        text="СХВАЛЕНО КУРАТОРОМ"
        shape="rect"
        rotation={8}
        size={84}
        color="burgundy"
        animateOn="load"
        className="pointer-events-none absolute -right-8 -top-12 z-10 select-none opacity-85"
      />

      <Form onSubmit={form.handleSubmit} className="space-y-6">
        <FormField
          name="email"
          label="EMAIL / ЧИТАЦЬКИЙ"
          required
          error={form.formState.errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            variant="underline"
            {...form.register("email")}
            placeholder="your.name@example.com"
          />
        </FormField>
        <FormField
          name="password"
          label="ПАРОЛЬ ВХОДУ"
          required
          hint="8+ символів"
          error={form.formState.errors.password?.message}
        >
          <Input
            type="password"
            autoComplete="current-password"
            variant="underline"
            {...form.register("password")}
            placeholder="••••••••"
          />
        </FormField>
        <FormFooter className="border-line-strong/40 mt-8 flex items-center justify-between border-t-[1.5px] border-dashed pt-6">
          <Link
            href="/register"
            className="font-hand text-hand-m text-burgundy transition-colors hover:text-burgundy-soft hover:underline"
          >
            Немає картки?
          </Link>
          <PillButton type="submit" loading={m.isPending}>
            Увійти
          </PillButton>
        </FormFooter>
      </Form>
    </div>
  );
}
