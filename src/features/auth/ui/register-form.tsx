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
    <Form onSubmit={form.handleSubmit} className="max-w-2xl">
      <FormErrorSummary errors={form.formState.errors as never} fieldLabels={fieldLabels} />
      <FormRow cols={2}>
        <FormField
          name="firstName"
          label="Імʼя"
          required
          error={form.formState.errors.firstName?.message}
        >
          <Input {...form.register("firstName")} />
        </FormField>
        <FormField
          name="lastName"
          label="Прізвище"
          required
          error={form.formState.errors.lastName?.message}
        >
          <Input {...form.register("lastName")} />
        </FormField>
      </FormRow>
      <FormRow cols={2}>
        <FormField
          name="email"
          label="Email учня"
          required
          error={form.formState.errors.email?.message}
        >
          <Input type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField
          name="grade"
          label="Клас"
          required
          hint="формат 9-А або 11-B"
          error={form.formState.errors.grade?.message}
        >
          <Input placeholder="9-А" {...form.register("grade")} />
        </FormField>
      </FormRow>
      <FormField
        name="password"
        label="Пароль"
        required
        hint="8+ символів"
        error={form.formState.errors.password?.message}
      >
        <Input type="password" autoComplete="new-password" {...form.register("password")} />
      </FormField>
      <FormField
        name="parentEmail"
        label="Email батьків"
        required
        hint="Надішлемо їм запит на згоду"
        error={form.formState.errors.parentEmail?.message}
      >
        <Input type="email" {...form.register("parentEmail")} />
      </FormField>
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>
          Зареєструватись
        </PillButton>
      </FormFooter>
    </Form>
  );
}
