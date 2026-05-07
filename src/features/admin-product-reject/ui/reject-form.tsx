"use client";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Textarea, PillButton, FormFooter, toast } from "@/shared/ui";
import {
  RejectProductSchema,
  type RejectInput,
} from "@/features/admin-product-reject/model/schemas";
import { useRejectProduct } from "@/features/admin-product-reject/model/use-reject";

export function RejectForm({
  productId,
  onDone,
  onCancel,
}: {
  productId: string;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const m = useRejectProduct();
  const form = useAppForm({
    schema: RejectProductSchema,
    defaultValues: { reason: "" } as RejectInput,
    onSubmit: async (data) => {
      await m.mutateAsync({ id: productId, reason: data.reason });
      toast.success("Відхилено");
      onDone?.();
    },
  });
  return (
    <Form onSubmit={form.handleSubmit}>
      <FormField
        name="reason"
        label="Причина відхилення (учень побачить)"
        required
        error={form.formState.errors.reason?.message}
      >
        <Textarea rows={4} {...form.register("reason")} />
      </FormField>
      <FormFooter>
        <PillButton type="button" variant="ghost" onClick={onCancel}>
          Скасувати
        </PillButton>
        <PillButton type="submit" loading={m.isPending}>
          Відхилити
        </PillButton>
      </FormFooter>
    </Form>
  );
}
