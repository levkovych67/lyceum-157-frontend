import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot, PillButton } from "@/shared/ui";

export function StudentProductsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>МОЇ РОБОТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог моїх робіт</h1>
      <PillButton asChild>
        <Link href="/student/products/new">+ Нова робота</Link>
      </PillButton>
      <div className="flex flex-col items-center gap-3 py-12">
        <ImageSlot
          slot="student/empty/no-products"
          ratio="1/1"
          variant="stamp"
          caption="Поки робіт немає"
          className="w-32"
        />
        <p className="font-display text-h3 italic text-ink-soft">
          Список робіт зʼявиться тут після того як додаси першу.
        </p>
      </div>
    </EditorialPageShell>
  );
}
