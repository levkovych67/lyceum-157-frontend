"use client";
import { useRouter } from "next/navigation";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import {
  Form,
  FormField,
  Input,
  Textarea,
  PillButton,
  FormFooter,
  FormErrorSummary,
} from "@/shared/ui";
import {
  CreateProductSchema,
  type CreateProductInput,
} from "@/features/product-create/model/schemas";
import { useCreateProduct } from "@/features/product-create/model/use-create-product";

const labels = {
  title: "Назва",
  description: "Опис",
  priceUah: "Ціна",
  type: "Тип",
  stockQty: "Залишок",
};

export function CreateProductForm() {
  const router = useRouter();
  const m = useCreateProduct();
  const form = useAppForm({
    schema: CreateProductSchema,
    defaultValues: {
      title: "",
      description: "",
      priceUah: "",
      type: "PHYSICAL",
      stockQty: 1,
    } as CreateProductInput,
    onSubmit: async (data) => {
      const { productId } = await m.mutateAsync({
        title: data.title,
        description: data.description,
        priceUah: Number(data.priceUah),
        type: data.type,
        stockQty: data.stockQty,
      });
      if (!productId) {
        throw new Error("CreatedProductResponse missing productId from BE");
      }
      router.push(`/student/products/${productId}/edit`);
    },
  });
  const type = form.watch("type");
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
      <FormField name="type" label="Тип" required>
        <select
          {...form.register("type")}
          className="h-14 w-full rounded-md border border-line bg-bg-card px-4"
        >
          <option value="PHYSICAL">PHYSICAL</option>
          <option value="DIGITAL">DIGITAL</option>
        </select>
      </FormField>
      {type === "PHYSICAL" && (
        <FormField
          name="stockQty"
          label="Залишок"
          required
          error={form.formState.errors.stockQty?.message}
        >
          <Input type="number" min={1} {...form.register("stockQty", { valueAsNumber: true })} />
        </FormField>
      )}
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>
          Зберегти чернетку
        </PillButton>
      </FormFooter>
    </Form>
  );
}
