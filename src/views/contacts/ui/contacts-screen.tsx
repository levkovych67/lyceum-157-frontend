import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function ContactsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>КОЛОФОН</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Контакти</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
