import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { Stamp, EditorialLabel, ImageSlot } from "@/shared/ui";

export function CheckoutSuccessScreen({ orderId }: { orderId?: string }) {
  return (
    <EditorialPageShell>
      <section className="relative -mx-6 md:-mx-12">
        <ImageSlot
          slot="checkout-success/confetti-bg"
          ratio="16/9"
          variant="interlude"
          caption="Свято успіху"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Stamp text="ВРУЧЕНО" shape="rect" rotation={-3} animateOn="load" trail />
          <EditorialLabel>ПОШТОВА ЛИСТІВКА</EditorialLabel>
        </div>
      </section>
      <h1 className="font-display text-h1 italic text-burgundy">Дякуємо за замовлення</h1>
      {orderId && <p className="font-hand text-hand-l text-burgundy">№ {orderId}</p>}
    </EditorialPageShell>
  );
}
