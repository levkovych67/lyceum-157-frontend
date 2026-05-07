import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function AdminPayoutsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ВИПЛАТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстр виплат</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
