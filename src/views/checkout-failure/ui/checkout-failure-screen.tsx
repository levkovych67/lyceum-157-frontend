import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { Stamp, PillButton, EditorialLabel } from "@/shared/ui";

export function CheckoutFailureScreen() {
  return (
    <EditorialPageShell>
      <Stamp text="ВИПУСК ПОШКОДЖЕНО" rotation={5} animateOn="load" />
      <EditorialLabel>ПЛАТІЖ НЕ ПРИЙНЯТО</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Спробуйте ще раз</h1>
      <PillButton asChild>
        <Link href="/cart">Повернутись до кошика</Link>
      </PillButton>
    </EditorialPageShell>
  );
}
