"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { CheckoutForm } from "@/features/checkout";

export function CheckoutScreen() {
  return (
    <EditorialPageShell>
      <section className="relative py-8">
        <EditorialLabel>БЛАНК-ЗАМОВЛЕННЯ</EditorialLabel>
        <h1 className="mt-4 font-display text-mega italic text-burgundy">Оформлення</h1>
      </section>

      <CheckoutForm />

      <div className="border-ink/30 mt-16 flex items-center justify-center gap-4 border-t-[1.5px] border-dashed pt-8 text-center md:justify-start md:text-left">
        <ImageSlot
          slot="checkout/trust-seal"
          src="/images/checkout/trust-seal.png"
          ratio="1/1"
          variant="stamp"
          caption="Безпечний платіж"
          className="w-16 opacity-80 grayscale"
        />
        <p className="max-w-xs font-hand text-hand-m text-ink-soft">
          Платіж проходить через LiqPay. Дані карток не зберігаються у нас.
        </p>
      </div>
    </EditorialPageShell>
  );
}
