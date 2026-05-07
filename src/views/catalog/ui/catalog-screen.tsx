import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import type { Page, ProductCardDto } from "@/shared/api";

export function CatalogScreen({ data }: { data: Page<ProductCardDto> | null }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПОКАЖЧИК ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог</h1>
      {data ? (
        <p className="text-lead text-ink-soft">
          Сторінка {data.number + 1} з {data.totalPages}, всього {data.totalElements} робіт.
        </p>
      ) : (
        <p className="text-lead text-ink-soft">Каталог тимчасово недоступний.</p>
      )}
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
