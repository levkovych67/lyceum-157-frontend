"use client";
import { useMutation } from "@tanstack/react-query";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, toast } from "@/shared/ui";
import { updateCard } from "@/shared/api/generated/kyc-parent/kyc-parent";
import { CardUpdateSchema, type CardUpdateInput } from "@/features/kyc-card-update/model/schemas";

export function KycCardUpdateForm({ token }: { token: string }) {
  const m = useMutation({
    mutationFn: (card: string) =>
      updateCard(
        { payoutCard: card },
        { token },
        { headers: { "Idempotency-Key": crypto.randomUUID() } },
      ),
  });
  const form = useAppForm({
    schema: CardUpdateSchema,
    defaultValues: { payoutCard: "" } as CardUpdateInput,
    onSubmit: async (data) => {
      await m.mutateAsync(data.payoutCard);
      toast.success("Картку оновлено");
    },
  });
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-md">
      <FormField
        name="payoutCard"
        label="Нова картка"
        required
        error={form.formState.errors.payoutCard?.message}
      >
        <Input inputMode="numeric" {...form.register("payoutCard")} />
      </FormField>
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>
          Оновити картку
        </PillButton>
      </FormFooter>
    </Form>
  );
}
