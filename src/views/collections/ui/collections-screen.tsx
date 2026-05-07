import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function CollectionsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ТЕМАТИЧНІ СПЕЦВИПУСКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Колекції</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
