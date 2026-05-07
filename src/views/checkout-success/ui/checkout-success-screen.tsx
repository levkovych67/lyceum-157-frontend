import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { Stamp, EditorialLabel } from "@/shared/ui";

export function CheckoutSuccessScreen({ orderId }: { orderId?: string }) {
  return (
    <EditorialPageShell>
      <Stamp text="ВРУЧЕНО" shape="rect" rotation={-3} animateOn="load" trail />
      <EditorialLabel>ПОШТОВА ЛИСТІВКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Дякуємо за замовлення</h1>
      {orderId && <p className="font-hand text-hand-l text-burgundy">№ {orderId}</p>}
    </EditorialPageShell>
  );
}
