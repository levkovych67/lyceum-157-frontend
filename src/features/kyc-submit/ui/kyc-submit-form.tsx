"use client";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, FormErrorSummary } from "@/shared/ui";
import { KycSubmitSchema, type KycSubmitInput } from "@/features/kyc-submit/model/schemas";
import { useSubmitKyc } from "@/features/kyc-submit/model/use-submit-kyc";

const labels: Record<string, string> = {
  parentName: "Імʼя батька/матері",
  parentRnokpp: "РНОКПП",
  payoutCard: "Картка для виплат",
};

export function KycSubmitForm({ token }: { token: string }) {
  const m = useSubmitKyc(token);
  const form = useAppForm({
    schema: KycSubmitSchema,
    defaultValues: { parentName: "", parentRnokpp: "", payoutCard: "" } as KycSubmitInput,
    onSubmit: async (data) => {
      const r = await m.mutateAsync(data);
      if (r.signDocumentUrl) window.location.href = r.signDocumentUrl;
    },
  });
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-xl">
      <FormErrorSummary errors={form.formState.errors as never} fieldLabels={labels} />
      <FormField
        name="parentName"
        label="Імʼя батька/матері"
        required
        error={form.formState.errors.parentName?.message}
      >
        <Input {...form.register("parentName")} />
      </FormField>
      <FormField
        name="parentRnokpp"
        label="РНОКПП"
        required
        hint="10 цифр"
        error={form.formState.errors.parentRnokpp?.message}
      >
        <Input inputMode="numeric" maxLength={10} {...form.register("parentRnokpp")} />
      </FormField>
      <FormField
        name="payoutCard"
        label="Номер картки"
        required
        hint="13–19 цифр"
        error={form.formState.errors.payoutCard?.message}
      >
        <Input inputMode="numeric" {...form.register("payoutCard")} />
      </FormField>
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>
          Надіслати на e-підпис
        </PillButton>
      </FormFooter>
    </Form>
  );
}
