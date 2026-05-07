"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function CatalogScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПОКАЖЧИК ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог</h1>
      <p className="text-lead text-ink-soft">
        Усі роботи учнів Ліцею №157, упорядковано за номером випуску.
      </p>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
