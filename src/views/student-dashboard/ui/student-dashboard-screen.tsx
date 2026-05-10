import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, PillButton } from "@/shared/ui";

export function StudentDashboardScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>КАБІНЕТ УЧНЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Привіт! Що сьогодні створюєш?</h1>
      <ImageSlot
        slot="student/dashboard/hero"
        src="/images/student/dashboard/hero.png"
        ratio="16/9"
        variant="interlude"
        caption="Hero банер кабінету учня"
      />
      <EditorialDivider />
      <nav aria-label="Швидкі дії" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <PillButton asChild>
          <Link href="/student/products">Мої роботи</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/student/products/new">Додати роботу</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/student/finance">Фінанси</Link>
        </PillButton>
      </nav>
      <EditorialDivider />
      <div className="flex flex-col items-center gap-3 py-8">
        <ImageSlot
          slot="student/empty/no-products"
          src="/images/student/empty/no-products.png"
          ratio="1/1"
          variant="stamp"
          caption="Поки робіт немає"
          className="w-32"
        />
        <p className="font-display text-h3 italic text-ink-soft">
          Додай свою першу роботу — і вона з’явиться в архіві.
        </p>
      </div>
    </EditorialPageShell>
  );
}
