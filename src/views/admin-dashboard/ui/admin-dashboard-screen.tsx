import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, PillButton } from "@/shared/ui";

export function AdminDashboardScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>АДМІНІСТРУВАННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кабінет адміністратора</h1>
      <ImageSlot
        slot="admin/dashboard/hero"
        ratio="16/9"
        variant="interlude"
        caption="Hero банер адмінки"
      />
      <EditorialDivider />
      <nav aria-label="Розділи адмінки" className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PillButton asChild>
          <Link href="/admin/products">Модерація робіт</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/admin/payouts">Виплати (2FA)</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/admin/reports/tax">Податковий звіт</Link>
        </PillButton>
        <PillButton asChild>
          <Link href="/admin/2fa">2FA · enroll/verify</Link>
        </PillButton>
      </nav>
      <EditorialDivider />
      <div className="flex flex-col items-center gap-3 py-8">
        <ImageSlot
          slot="admin/empty/queue"
          ratio="1/1"
          variant="stamp"
          caption="Черга порожня"
          className="w-32"
        />
        <p className="font-display text-h3 italic text-ink-soft">Нових заявок поки немає.</p>
      </div>
    </EditorialPageShell>
  );
}
