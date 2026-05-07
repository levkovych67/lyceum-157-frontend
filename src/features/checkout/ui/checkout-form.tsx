"use client";
import { useState } from "react";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, FormError } from "@/shared/ui";
import { useCartStore } from "@/entities/cart";
import { CheckoutSchema, type CheckoutInput } from "@/features/checkout/model/schemas";
import { useCreateOrder } from "@/features/checkout/model/use-create-order";
import {
  revalidateCart,
  type CartRevalidationIssue,
} from "@/features/checkout/model/cart-revalidator";

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const totalUah = useCartStore((s) => s.totalUah)();
  const clear = useCartStore((s) => s.clear);
  const [issues, setIssues] = useState<CartRevalidationIssue[]>([]);
  const m = useCreateOrder();

  const form = useAppForm({
    schema: CheckoutSchema,
    defaultValues: { buyerEmail: "", buyerName: "", buyerPhone: "+380" } as CheckoutInput,
    onSubmit: async (data) => {
      const newIssues = await revalidateCart(items);
      if (newIssues.length) {
        setIssues(newIssues);
        return;
      }
      const resp = await m.mutateAsync({
        ...data,
        items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
      });
      clear();
      window.location.href = resp.paymentUrl;
    },
  });

  if (items.length === 0) return <p className="text-lead text-ink-soft">Кошик порожній.</p>;

  return (
    <Form onSubmit={form.handleSubmit} className="grid gap-8 md:grid-cols-[2fr,1fr]">
      <div className="space-y-5">
        {issues.length > 0 && (
          <FormError
            message={`Деякі товари недоступні: ${issues.map((i) => i.productId).join(", ")}. Поверніться у кошик.`}
          />
        )}
        <FormField
          name="buyerName"
          label="Імʼя та прізвище"
          required
          error={form.formState.errors.buyerName?.message}
        >
          <Input {...form.register("buyerName")} />
        </FormField>
        <FormField
          name="buyerEmail"
          label="Email"
          required
          error={form.formState.errors.buyerEmail?.message}
        >
          <Input type="email" {...form.register("buyerEmail")} />
        </FormField>
        <FormField
          name="buyerPhone"
          label="Телефон"
          required
          hint="+380XXXXXXXXX"
          error={form.formState.errors.buyerPhone?.message}
        >
          <Input type="tel" {...form.register("buyerPhone")} />
        </FormField>
        <FormFooter>
          <span />
          <PillButton type="submit" loading={m.isPending}>
            {m.isPending ? "Зʼєднання з LiqPay…" : `Сплатити ${totalUah} ₴`}
          </PillButton>
        </FormFooter>
      </div>
      <aside className="space-y-3 rounded-md bg-bg-card p-5 shadow-paper">
        <p className="text-label text-burgundy">▌ ЗАМОВЛЕННЯ</p>
        <ul className="divide-y divide-line text-small">
          {items.map((it) => (
            <li key={it.productId} className="flex justify-between py-2">
              <span>
                {it.title} × {it.qty}
              </span>
              <span>{it.priceUah} ₴</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-ink pt-2 text-h3 font-bold text-burgundy">{totalUah} ₴</p>
      </aside>
    </Form>
  );
}
