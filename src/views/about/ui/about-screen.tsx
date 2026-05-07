import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function AboutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>РЕДАКТОРСЬКА КОЛОНКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Про проєкт</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
