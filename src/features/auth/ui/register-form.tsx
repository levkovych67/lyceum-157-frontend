"use client";
import { useState } from "react";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import {
  Form,
  FormRow,
  FormField,
  Input,
  PillButton,
  FormFooter,
  FormErrorSummary,
  Sticker,
} from "@/shared/ui";
import { RegisterSchema, type RegisterInput } from "@/features/auth/model/schemas";
import { useRegister } from "@/features/auth/model/use-register";

const fieldLabels: Record<string, string> = {
  email: "Email учня",
  password: "Пароль",
  firstName: "Імʼя",
  lastName: "Прізвище",
  grade: "Клас",
  parentEmail: "Email батьків",
};

export function RegisterForm() {
  const [done, setDone] = useState<string | null>(null);
  const m = useRegister();
  const form = useAppForm({
    schema: RegisterSchema,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      grade: "",
      parentEmail: "",
    } as RegisterInput,
    onSubmit: async (data) => {
      await m.mutateAsync(data);
      setDone(data.parentEmail);
    },
  });

  if (done)
    return (
      <Sticker color="yellow" rotation={-2} signature="— очікуй на лист">
        Лист зі згодою надіслано на {done}
      </Sticker>
    );

  return (
    <div className="relative mx-auto mt-8 max-w-2xl rotate-[-1deg] border-[1.5px] border-burgundy bg-bg-warm p-8 shadow-[0_12px_24px_rgba(0,0,0,0.18)] md:mx-0">
      <div className="absolute -left-4 -top-4 z-10 hidden rotate-[-6deg] border border-ink-soft bg-bg-warm px-2 py-1 md:block">
        <span className="font-mono text-small tracking-widest text-ink-soft">ФОРМА 2</span>
      </div>
      <Form onSubmit={form.handleSubmit} className="space-y-6">
        <FormErrorSummary errors={form.formState.errors as never} fieldLabels={fieldLabels} />
        <FormRow cols={2}>
          <FormField
            name="firstName"
            label="Імʼя"
            required
            error={form.formState.errors.firstName?.message}
          >
            <Input variant="underline" {...form.register("firstName")} />
          </FormField>
          <FormField
            name="lastName"
            label="Прізвище"
            required
            error={form.formState.errors.lastName?.message}
          >
            <Input variant="underline" {...form.register("lastName")} />
          </FormField>
        </FormRow>
        <FormRow cols={2}>
          <FormField
            name="email"
            label="Email учня"
            required
            error={form.formState.errors.email?.message}
          >
            <Input
              type="email"
              autoComplete="email"
              variant="underline"
              {...form.register("email")}
            />
          </FormField>
          <FormField
            name="grade"
            label="Клас"
            required
            hint="формат 9-А або 11-B"
            error={form.formState.errors.grade?.message}
          >
            <Input variant="underline" placeholder="9-А" {...form.register("grade")} />
          </FormField>
        </FormRow>
        <FormField
          name="password"
          label="Пароль"
          required
          hint="8+ символів"
          error={form.formState.errors.password?.message}
        >
          <Input
            type="password"
            autoComplete="new-password"
            variant="underline"
            {...form.register("password")}
          />
        </FormField>
        <FormField
          name="parentEmail"
          label="Email батьків"
          required
          hint="Надішлемо їм запит на згоду"
          error={form.formState.errors.parentEmail?.message}
        >
          <Input type="email" variant="underline" {...form.register("parentEmail")} />
        </FormField>
        <FormFooter className="border-ink/30 mt-8 border-t-[1.5px] border-dashed pt-8">
          <span />
          <PillButton type="submit" loading={m.isPending}>
            Зареєструватись
          </PillButton>
        </FormFooter>
      </Form>
    </div>
  );
}
