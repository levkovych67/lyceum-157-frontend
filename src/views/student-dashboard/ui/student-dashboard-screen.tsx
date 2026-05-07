import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentDashboardScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>КАБІНЕТ УЧНЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Привіт! Що сьогодні створюєш?</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
