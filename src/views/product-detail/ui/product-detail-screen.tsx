import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, MuseumLabel } from "@/shared/ui";
import type { ProductDetailDto } from "@/shared/api";

export function ProductDetailScreen({ product }: { product: ProductDetailDto }) {
  const [main, ...rest] = product.imageUrls;
  const thumbs = [rest[0], rest[1], rest[2]];

  return (
    <EditorialPageShell>
      <EditorialLabel>СТАТТЯ ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">{product.title}</h1>

      {/* Gallery */}
      <section
        aria-label="Галерея товару"
        className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-start"
      >
        <ImageSlot
          slot={`product/${product.slug}/main`}
          ratio="4/5"
          variant="photo-print"
          caption="Головне фото"
          src={main}
          alt={`${product.title} — головне фото`}
          priority
        />
        <div className="flex flex-row gap-3 md:w-28 md:flex-col">
          {thumbs.map((url, i) => (
            <ImageSlot
              key={i}
              slot={`product/${product.slug}/thumb-${i + 1}`}
              ratio="1/1"
              variant="plain"
              caption={`Деталь ${i + 1}`}
              src={url}
              alt={`${product.title} — деталь ${i + 1}`}
              className="w-24 md:w-full"
            />
          ))}
        </div>
      </section>

      <EditorialDivider />

      {/* Museum label + author mini */}
      <section
        aria-label="Інформація про роботу"
        className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-start"
      >
        <ImageSlot
          slot={`product/${product.slug}/authors/mini`}
          ratio="1/1"
          variant="portrait"
          caption={product.author.firstName}
          className="w-20"
        />
        <MuseumLabel
          title={product.title}
          author={`${product.author.firstName}, ${product.author.grade}`}
          priceUah={product.priceUah}
        />
      </section>

      <EditorialDivider />

      <article
        className="prose max-w-prose"
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
    </EditorialPageShell>
  );
}
