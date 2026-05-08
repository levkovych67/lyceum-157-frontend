"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { CheckoutForm } from "@/features/checkout";

export function CheckoutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БЛАНК-ЗАМОВЛЕННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оформлення</h1>
      <CheckoutForm />
      <div className="flex items-center gap-3 border-t border-line pt-4">
        <ImageSlot
          slot="checkout/trust-seal"
          ratio="1/1"
          variant="stamp"
          caption="Безпечний платіж"
          className="w-16"
        />
        <p className="text-small text-ink-soft">
          Платіж проходить через WayForPay. Картку не зберігаємо.
        </p>
      </div>
    </EditorialPageShell>
  );
}
