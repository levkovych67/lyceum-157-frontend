import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, MuseumLabel } from "@/shared/ui";
import type { ProductDetailDto } from "@/shared/api";

export function ProductDetailScreen({ product }: { product: ProductDetailDto }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>СТАТТЯ ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">{product.title}</h1>
      <MuseumLabel
        title={product.title}
        author={`${product.author.firstName}, ${product.author.grade}`}
        priceUah={product.priceUah}
      />
      <article
        className="prose max-w-prose"
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
