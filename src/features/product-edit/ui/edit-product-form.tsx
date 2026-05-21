"use client";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import {
  Form,
  FormField,
  Input,
  Textarea,
  PillButton,
  FormFooter,
  FormErrorSummary,
  toast,
} from "@/shared/ui";
import type { StudentProductDetailDto } from "@/shared/api/generated/models/studentProductDetailDto";
import { EditProductSchema, type EditProductInput } from "@/features/product-edit/model/schemas";
import { useEditProduct } from "@/features/product-edit/model/use-edit-product";

const labels = { title: "Назва", description: "Опис", priceUah: "Ціна" };

export function EditProductForm({ product }: { product: StudentProductDetailDto }) {
  const m = useEditProduct(product.id ?? "");
  const form = useAppForm({
    schema: EditProductSchema,
    defaultValues: {
      title: product.title ?? "",
      description: product.description ?? "",
      priceUah: product.priceUah ?? "",
    } as EditProductInput,
    onSubmit: async (data) => {
      await m.mutateAsync({
        title: data.title,
        description: data.description,
        priceUah: data.priceUah,
      });
      toast.success("Зміни збережено");
    },
  });
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-2xl">
      <FormErrorSummary errors={form.formState.errors as never} fieldLabels={labels} />
      <FormField name="title" label="Назва" required error={form.formState.errors.title?.message}>
        <Input {...form.register("title")} />
      </FormField>
      <FormField
        name="description"
        label="Опис"
        required
        error={form.formState.errors.description?.message}
      >
        <Textarea rows={8} {...form.register("description")} />
      </FormField>
      <FormField
        name="priceUah"
        label="Ціна (UAH)"
        required
        hint="50.00 — 50000.00"
        error={form.formState.errors.priceUah?.message}
      >
        <Input inputMode="decimal" {...form.register("priceUah")} />
      </FormField>
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>
          Зберегти зміни
        </PillButton>
      </FormFooter>
    </Form>
  );
}
