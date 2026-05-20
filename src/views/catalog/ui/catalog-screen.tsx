import Link from "next/link";
import { MOCK_PRODUCTS_CARDS } from "@/shared/api/mock-products";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";
import type { Page, ProductCardDto } from "@/shared/api";

export function CatalogScreen({ data }: { data: Page<ProductCardDto> | null }) {
  const products =
    !data || !data.content || data.content.length === 0 ? MOCK_PRODUCTS_CARDS : data.content;
  const isEmpty = products.length === 0;

  return (
    <EditorialPageShell>
      {/* Page hero */}
      <section aria-label="Каталог hero" className="relative py-12">
        <EditorialLabel>▌ ТОМ 47 · ТРАВЕНЬ 2026</EditorialLabel>
        <h1 className="font-display text-mega italic text-burgundy">
          Каталог
          <br />
          робіт
        </h1>
        <div className="absolute right-[10%] top-[10%] hidden md:block">
          <Stamp
            text="MAYSTERNYA · KYIV"
            rotation={-10}
            animateOn="load"
            className="text-burgundy"
          />
        </div>
        <p className="mt-8 max-w-prose text-lead text-ink-soft">
          Оригінальні роботи учнів ліцею. Повний перелік наявних творів.
        </p>
      </section>

      <EditorialDivider />

      {/* Categories strip */}
      <section
        aria-label="Категорії"
        className="grid grid-cols-1 gap-8 py-8 md:grid-cols-12 md:gap-4 lg:gap-8"
      >
        <div className="flex rotate-[-2deg] justify-center transition-transform hover:rotate-0 hover:scale-105 md:col-span-4 md:col-start-1 md:mt-8 md:justify-end">
          <ImageSlot
            slot="catalog/category/tile-1"
            src="/images/catalog/category/tile-1.png"
            ratio="4/5"
            variant="photo-print"
            caption="Кераміка"
            className="w-56 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          />
        </div>
        <div className="z-10 flex rotate-[3deg] justify-center transition-transform hover:rotate-0 hover:scale-105 md:col-span-5 md:col-start-4 md:-mt-4">
          <ImageSlot
            slot="catalog/category/tile-2"
            src="/images/catalog/category/tile-2.png"
            ratio="4/5"
            variant="photo-print"
            caption="Графіка"
            className="w-64 shadow-[0_12px_24px_rgba(0,0,0,0.18)] lg:w-80"
          />
        </div>
        <div className="flex rotate-[-4deg] justify-center transition-transform hover:rotate-0 hover:scale-105 md:col-span-4 md:col-start-9 md:mt-12 md:justify-start">
          <ImageSlot
            slot="catalog/category/tile-3"
            src="/images/catalog/category/tile-3.png"
            ratio="4/5"
            variant="photo-print"
            caption="Текстиль"
            className="w-48 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
          />
        </div>
      </section>

      <EditorialDivider />

      {/* Product Grid */}
      <section aria-label="Перелік учнівських робіт" className="py-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, idx) => {
            const rotations = [-3, 2, -4, 3, -2, 4];
            const rotation = rotations[idx % rotations.length];
            return (
              <div key={product.id} className="flex justify-center">
                <Link
                  href={`/p/${product.slug}`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="group relative flex w-full max-w-[280px] flex-col items-center rounded-[2px] bg-white p-4 pb-10 shadow-photo transition-all duration-d3 ease-spring hover:rotate-0 hover:scale-[1.04]"
                >
                  {/* Polaroid photo display */}
                  <div className="relative mb-3 aspect-[3/4] w-full overflow-hidden rounded-[1px] bg-bg-warm">
                    <ImageSlot
                      slot={`products/${product.slug}`}
                      src={product.thumbnailUrl}
                      ratio="3/4"
                      variant="plain"
                      caption={product.title ?? "Робота"}
                      className="absolute inset-0 h-full w-full"
                    />
                  </div>
                  {/* Polaroid bottom border content */}
                  <div className="w-full space-y-1 text-center">
                    <h3 className="truncate px-1 font-hand text-hand-m leading-tight text-ink">
                      {product.title}
                    </h3>
                    <p className="text-ink-soft/80 select-none font-hand text-hand-s">
                      Автор: {product.author?.firstName}, {product.author?.grade}
                    </p>
                    <div className="mt-2 border-t border-dashed border-line pt-2">
                      <span className="font-mono text-body font-bold text-burgundy">
                        {product.priceUah} ₴
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mid-page intermission */}
      <section aria-label="Цитата-інтермісія" className="-mx-5 my-12 md:-mx-6">
        <ImageSlot
          slot="catalog/intermission/quote"
          src="/images/catalog/intermission/quote.png"
          ratio="21/9"
          variant="interlude"
          caption="Інтермісія — full-bleed цитата"
        />
      </section>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <p className="font-hand text-hand-l text-ink">Хм, нічого не знайшлось.</p>
          <ImageSlot
            slot="catalog/empty-state/illustration"
            src="/images/catalog/empty-state/illustration.png"
            ratio="1/1"
            variant="plain"
            caption="Порожній альбом"
            className="w-48 opacity-50 grayscale"
          />
        </div>
      )}
    </EditorialPageShell>
  );
}
