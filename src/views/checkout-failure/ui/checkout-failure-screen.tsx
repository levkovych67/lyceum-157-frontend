import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { Stamp, PillButton, EditorialLabel, ImageSlot } from "@/shared/ui";

export function CheckoutFailureScreen() {
  return (
    <EditorialPageShell>
      <section className="relative -mx-5 md:-mx-6">
        <ImageSlot
          slot="checkout-failure/rain-bg"
          src="/images/checkout-failure/rain-bg.png"
          ratio="16/9"
          variant="interlude"
          caption="Дощовий фон невдачі"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Stamp text="ВИПУСК ПОШКОДЖЕНО" rotation={5} animateOn="load" />
          <EditorialLabel>ПЛАТІЖ НЕ ПРИЙНЯТО</EditorialLabel>
        </div>
      </section>
      <h1 className="font-display text-h1 italic text-burgundy">Спробуйте ще раз</h1>
      <PillButton asChild>
        <Link href="/cart">Повернутись до кошика</Link>
      </PillButton>
    </EditorialPageShell>
  );
}
