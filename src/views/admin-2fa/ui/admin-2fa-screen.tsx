import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function Admin2faScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ДВОФАКТОРНА АВТЕНТИФІКАЦІЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">2FA</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
