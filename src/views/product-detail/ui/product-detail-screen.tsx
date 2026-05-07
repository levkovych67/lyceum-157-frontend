import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function ProductDetailScreen({ slug }: { slug: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>СТАТТЯ ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Робота: {slug}</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
