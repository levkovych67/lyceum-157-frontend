import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot } from "@/shared/ui";
import type { Page, ProductCardDto } from "@/shared/api";

export function CatalogScreen({ data }: { data: Page<ProductCardDto> | null }) {
  const isEmpty = !data || data.totalElements === 0;

  return (
    <EditorialPageShell>
      {/* Page hero */}
      <section aria-label="Каталог hero">
        <ImageSlot
          slot="catalog/hero/banner"
          ratio="16/9"
          variant="interlude"
          caption="Заголовний банер каталогу"
        />
        <EditorialLabel className="mt-6">ПОКАЖЧИК ВИПУСКУ</EditorialLabel>
        <h1 className="font-display text-h1 italic text-burgundy">Каталог</h1>
      </section>

      <EditorialDivider />

      {/* Categories strip */}
      <section aria-label="Категорії" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ImageSlot
          slot="catalog/category/tile-1"
          ratio="4/5"
          variant="photo-print"
          caption="Кераміка"
        />
        <ImageSlot
          slot="catalog/category/tile-2"
          ratio="4/5"
          variant="photo-print"
          caption="Графіка"
        />
        <ImageSlot
          slot="catalog/category/tile-3"
          ratio="4/5"
          variant="photo-print"
          caption="Текстиль"
        />
      </section>

      <EditorialDivider />

      {/* Pagination info / placeholder for product grid */}
      {data ? (
        <p className="text-lead text-ink-soft">
          Сторінка {data.number + 1} з {data.totalPages}, всього {data.totalElements} робіт.
        </p>
      ) : (
        <p className="text-lead text-ink-soft">Каталог тимчасово недоступний.</p>
      )}

      {/* Mid-page intermission */}
      <section aria-label="Цитата-інтермісія" className="-mx-6 my-12 md:-mx-12">
        <ImageSlot
          slot="catalog/intermission/quote"
          ratio="21/9"
          variant="interlude"
          caption="Інтермісія — full-bleed цитата"
        />
      </section>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center gap-4 py-16">
          <ImageSlot
            slot="catalog/empty-state/illustration"
            ratio="1/1"
            variant="stamp"
            caption="Порожня поличка"
            className="w-48"
          />
          <p className="font-display text-h3 italic text-ink-soft">Тут поки порожньо.</p>
        </div>
      )}
    </EditorialPageShell>
  );
}
