import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function AdminProductsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>МОДЕРАЦІЯ РОБІТ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Роботи на перевірку</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
