"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { CheckoutForm } from "@/features/checkout";

export function CheckoutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БЛАНК-ЗАМОВЛЕННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оформлення</h1>
      <CheckoutForm />
    </EditorialPageShell>
  );
}
