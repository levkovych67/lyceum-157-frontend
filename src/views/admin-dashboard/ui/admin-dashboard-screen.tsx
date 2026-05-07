import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function AdminDashboardScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>АДМІНІСТРУВАННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кабінет адміністратора</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
