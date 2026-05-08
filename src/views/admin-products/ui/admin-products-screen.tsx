import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
export function AdminProductsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>МОДЕРАЦІЯ РОБІТ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Роботи на перевірку</h1>
      <p className="max-w-prose text-body text-ink-soft">
        FRONTEND-API §3.9 — список ROLE_ADMIN, дії approve / reject (з reasonText).
      </p>
      <div className="flex flex-col items-center gap-3 py-12">
        <ImageSlot
          slot="admin/empty/queue"
          ratio="1/1"
          variant="stamp"
          caption="Черга порожня"
          className="w-32"
        />
        <p className="font-display text-h3 italic text-ink-soft">Нових робіт на модерацію немає.</p>
      </div>
    </EditorialPageShell>
  );
}
