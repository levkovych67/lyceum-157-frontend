"use client";
import { useForm, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { applyApiErrorToForm } from "@/shared/api";
import { toast } from "@/shared/ui";
import { useScrollToFirstError } from "@/shared/hooks/use-scroll-to-first-error";

export function useAppForm<S extends z.ZodType>(opts: {
  schema: S;
  defaultValues: z.input<S>;
  onSubmit: (data: z.output<S>) => Promise<void> | void;
  formProps?: Omit<UseFormProps, "resolver" | "defaultValues">;
}) {
  const form = useForm<z.input<S>>({
    resolver: zodResolver(opts.schema),
    defaultValues: opts.defaultValues as never,
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    criteriaMode: "all",
    ...(opts.formProps as object),
  });

  useScrollToFirstError(form.formState.errors as never, form.formState.isSubmitted);

  const handleSubmit = form.handleSubmit(
    async (data) => {
      try {
        await opts.onSubmit(data as z.output<S>);
      } catch (e) {
        if (!applyApiErrorToForm(e, form.setError as never)) throw e;
      }
    },
    () => {
      toast.error("Перевірте форму — є незаповнені поля");
    },
  );

  return { ...form, handleSubmit };
}
