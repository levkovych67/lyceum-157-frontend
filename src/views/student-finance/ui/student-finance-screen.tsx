import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot } from "@/shared/ui";

export function StudentFinanceScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>РОЗРАХУНОК</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Фінанси</h1>
      <ImageSlot
        slot="student/finance/banner"
        src="/images/student/finance/banner.png"
        ratio="16/9"
        variant="interlude"
        caption="Hero банер фінансів"
      />
      <EditorialDivider />
      <div className="flex flex-col items-center gap-3 py-12">
        <ImageSlot
          slot="student/empty/no-payouts"
          src="/images/student/empty/no-payouts.png"
          ratio="1/1"
          variant="stamp"
          caption="Виплат поки немає"
          className="w-32"
        />
        <p className="font-display text-h3 italic text-ink-soft">
          Підсумок зʼявиться після першого продажу.
        </p>
      </div>
    </EditorialPageShell>
  );
}
