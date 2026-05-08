import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function AdminOrderScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ЗАМОВЛЕННЯ #{id}</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Деталі</h1>
      <p className="max-w-prose text-body text-ink-soft">
        FRONTEND-API §3.10 — кнопка «Повернення коштів» (POST /admin/orders/{`{id}`}/refund). Форма
        зʼявиться тут.
      </p>
    </EditorialPageShell>
  );
}
