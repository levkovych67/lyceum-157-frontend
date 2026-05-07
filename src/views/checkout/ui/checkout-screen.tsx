"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function CheckoutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БЛАНК-ЗАМОВЛЕННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оформлення</h1>
      <p className="text-lead text-ink-soft">Форма замовлення (Phase 6)</p>
      <PageStubBanner cluster="checkout" />
    </EditorialPageShell>
  );
}
