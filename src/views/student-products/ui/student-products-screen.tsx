import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentProductsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>МОЇ РОБОТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог моїх робіт</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
