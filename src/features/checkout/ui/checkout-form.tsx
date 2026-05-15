"use client";
import { useState } from "react";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, FormError } from "@/shared/ui";
import { useCartStore } from "@/entities/cart";
import { CheckoutSchema, type CheckoutInput } from "@/features/checkout/model/schemas";
import { useCreateOrder } from "@/features/checkout/model/use-create-order";
import Link from "next/link";
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
      if (!resp.paymentUrl) {
        throw new Error("OrderCreationResponse missing paymentUrl from BE");
      }
      clear();
      window.location.href = resp.paymentUrl;
    },
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <p className="text-lead text-ink-soft">
          Кошик порожній. Щоб оформити замовлення, спочатку оберіть роботу.
        </p>
        <PillButton asChild className="hover:bg-burgundy/90 mt-4 bg-burgundy text-bg-warm">
          <Link href="/catalog">До каталогу</Link>
        </PillButton>
      </div>
    );
  }

  return (
    <Form
      onSubmit={form.handleSubmit}
      className="grid grid-cols-1 gap-12 py-8 md:grid-cols-[1fr_320px]"
    >
      <div className="space-y-8">
        {issues.length > 0 && (
          <FormError
            message={`Деякі товари недоступні: ${issues.map((i) => i.productId).join(", ")}. Поверніться у кошик.`}
          />
        )}
        <div className="max-w-xl space-y-6">
          <FormField
            name="buyerName"
            label="Імʼя та прізвище"
            required
            error={form.formState.errors.buyerName?.message}
          >
            <Input
              {...form.register("buyerName")}
              className="rounded-none border-b border-ink bg-transparent px-0 shadow-none focus:ring-0"
            />
          </FormField>
          <FormField
            name="buyerEmail"
            label="Email"
            required
            error={form.formState.errors.buyerEmail?.message}
          >
            <Input
              type="email"
              {...form.register("buyerEmail")}
              className="rounded-none border-b border-ink bg-transparent px-0 shadow-none focus:ring-0"
            />
          </FormField>
          <FormField
            name="buyerPhone"
            label="Телефон"
            required
            hint="+380XXXXXXXXX"
            error={form.formState.errors.buyerPhone?.message}
          >
            <Input
              type="tel"
              {...form.register("buyerPhone")}
              className="rounded-none border-b border-ink bg-transparent px-0 shadow-none focus:ring-0"
            />
          </FormField>

          <FormFooter className="pt-8">
            <span />
            <PillButton
              type="submit"
              loading={m.isPending}
              className="hover:bg-burgundy/90 bg-burgundy text-bg-warm"
            >
              {m.isPending ? "Перенаправляємо на LiqPay…" : `Сплатити ${totalUah} ₴`}
            </PillButton>
          </FormFooter>
        </div>
      </div>

      {/* Checkout Panel */}
      <aside className="relative rotate-[-1deg] self-start border-[1.5px] border-burgundy bg-bg-warm p-8 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
        <div className="absolute -right-6 -top-6 rotate-[12deg] border border-ink-soft bg-bg-warm px-2 py-1">
          <span className="font-mono text-small tracking-widest text-ink-soft">КОПІЯ №2</span>
        </div>
        <p className="mb-6 text-small uppercase tracking-widest text-burgundy">Замовлення №____</p>
        <ul className="border-ink/30 mb-6 space-y-4 border-b-[1.5px] border-dashed pb-6 text-lead text-ink">
          {items.map((it) => (
            <li key={it.productId} className="flex justify-between gap-4">
              <span className="truncate">
                {it.title} × {it.qty}
              </span>
              <span className="whitespace-nowrap">{it.priceUah} ₴</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between font-display text-h2 text-burgundy">
          <span>Разом</span>
          <span>{totalUah} ₴</span>
        </div>
      </aside>
    </Form>
  );
}
