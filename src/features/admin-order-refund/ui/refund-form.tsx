"use client";
import { useState } from "react";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Textarea, PillButton, FormFooter, toast } from "@/shared/ui";
import { RefundSchema, type RefundInput } from "@/features/admin-order-refund/model/schemas";
import { useRefund } from "@/features/admin-order-refund/model/use-refund";

export function RefundForm({
  orderId,
  onDone,
  onCancel,
}: {
  orderId: string;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const [agreed, setAgreed] = useState(false);
  const m = useRefund();
  const form = useAppForm({
    schema: RefundSchema,
    defaultValues: { reason: "" } as RefundInput,
    onSubmit: async (data) => {
      await m.mutateAsync({ orderId, reason: data.reason });
      toast.success("Refund ініційовано");
      onDone?.();
    },
  });
  return (
    <Form onSubmit={form.handleSubmit}>
      <FormField
        name="reason"
        label="Причина повернення"
        required
        error={form.formState.errors.reason?.message}
      >
        <Textarea rows={3} {...form.register("reason")} />
      </FormField>
      <label className="flex items-center gap-2 text-small text-ink">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />Я
        розумію, що це повний refund, чарджбек банку незворотній
      </label>
      <FormFooter>
        <PillButton type="button" variant="ghost" onClick={onCancel}>
          Скасувати
        </PillButton>
        <PillButton type="submit" loading={m.isPending} disabled={!agreed}>
          Повернути кошти
        </PillButton>
      </FormFooter>
    </Form>
  );
}
