import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, MuseumLabel, Stamp } from "@/shared/ui";
import type { AuthorDto, ProductDetailDto } from "@/shared/api";

/**
 * Narrowed ProductDetailDto with all fields the UI relies on asserted present.
 * BE always emits these for public products; orval marks them optional because
 * the OpenAPI schema does not declare them as `required`.
 */
export type ProductDetail = ProductDetailDto &
  Required<
    Pick<
      ProductDetailDto,
      | "id"
      | "title"
      | "slug"
      | "description"
      | "priceUah"
      | "type"
      | "stockQty"
      | "viewCount"
      | "imageUrls"
    >
  > & { author: Required<Pick<AuthorDto, "firstName" | "grade">> & AuthorDto };

export function assertProductDetail(p: ProductDetailDto): asserts p is ProductDetail {
  if (
    !p.id ||
    !p.title ||
    !p.slug ||
    !p.description ||
    p.priceUah == null ||
    !p.type ||
    p.stockQty == null ||
    p.viewCount == null ||
    !p.author?.firstName ||
    !p.author?.grade ||
    !p.imageUrls
  ) {
    throw new Error("ProductDetailDto missing required fields from BE");
  }
}

export function ProductDetailScreen({ product }: { product: ProductDetail }) {
  const [main, ...rest] = product.imageUrls;
  const thumbs = [rest[0], rest[1], rest[2]];

  return (
    <EditorialPageShell>
      {/* Lead 60/40 */}
      <section className="grid grid-cols-1 gap-12 md:grid-cols-[60%_40%] lg:gap-16">
        {/* Left: Gallery */}
        <div className="flex flex-col gap-4">
          <ImageSlot
            slot={`product/${product.slug}/main`}
            ratio="4/5"
            variant="photo-print"
            caption="Головне фото"
            src={main}
            alt={`${product.title} — головне фото`}
            priority
            className="shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          />
          <div className="grid grid-cols-3 gap-4">
            {thumbs.map((url, i) => (
              <ImageSlot
                key={i}
                slot={`product/${product.slug}/thumb-${i + 1}`}
                ratio="1/1"
                variant="plain"
                caption={`Деталь ${i + 1}`}
                src={url}
                alt={`${product.title} — деталь ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-8 md:sticky md:top-32 md:self-start">
          <div className="space-y-4">
            <EditorialLabel>▌ УНІКАЛЬНИЙ ЕКЗЕМПЛЯР</EditorialLabel>
            <h1 className="font-display text-h1 italic leading-none text-burgundy">
              {product.title}
            </h1>
            <p className="font-display text-h2 text-ink">{product.priceUah} ₴</p>
          </div>

          <div className="border-ink/30 border-t-[1.5px] border-dashed pt-8">
            <div className="mb-6 flex items-center gap-4">
              <ImageSlot
                slot={`product/${product.slug}/authors/mini`}
                ratio="1/1"
                variant="portrait"
                caption={product.author.firstName}
                className="w-16 rounded-full"
              />
              <div>
                <p className="font-hand text-hand-m text-ink">{product.author.firstName}</p>
                <p className="text-small text-ink-soft">{product.author.grade}</p>
              </div>
            </div>

            <MuseumLabel
              title={product.title}
              author={`${product.author.firstName}, ${product.author.grade}`}
              priceUah={String(product.priceUah)}
            />
          </div>
        </div>
      </section>

      <EditorialDivider />

      {/* Story Behind */}
      <section className="bg-burgundy-soft/50 -mx-6 px-6 py-16 md:-mx-12 md:px-12 lg:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-3 md:gap-8">
          <div className="flex rotate-[-3deg] justify-center md:justify-end">
            <ImageSlot
              slot="product/story/process-1"
              src="/images/product/story/process-1.png"
              ratio="1/1"
              variant="polaroid"
              caption="Процес створення"
              className="w-64"
            />
          </div>

          <div className="flex flex-col items-center text-center">
            <Stamp text="ІСТОРІЯ" rotation={8} animateOn="hover" className="mb-8 text-burgundy" />
            <p className="font-display text-quote italic text-burgundy">
              «Кожна нерівність тут залишена навмисно. Вона показує рух руки.»
            </p>
          </div>

          <div className="flex rotate-[4deg] justify-center md:justify-start">
            <ImageSlot
              slot="product/story/process-2"
              src="/images/product/story/process-2.png"
              ratio="4/5"
              variant="polaroid"
              caption="Деталі фактури"
              className="w-56"
            />
          </div>
        </div>
      </section>

      <EditorialDivider />

      <article
        className="prose max-w-prose text-body text-ink"
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
    </EditorialPageShell>
  );
}
