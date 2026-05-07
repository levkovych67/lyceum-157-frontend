import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function AuthorProfileScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПРОФАЙЛ-FEATURE</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Автор: {id}</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
