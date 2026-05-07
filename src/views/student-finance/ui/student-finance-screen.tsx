import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentFinanceScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>РОЗРАХУНОК</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Фінанси</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
