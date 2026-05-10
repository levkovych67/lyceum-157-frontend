import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
export function AdminPayoutsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ВИПЛАТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстр виплат</h1>
      <div
        role="alert"
        className="border-burgundy/30 flex items-center gap-4 border-2 bg-bg-warm p-4"
      >
        <ImageSlot
          slot="admin/payouts/shield"
          src="/images/admin/payouts/shield.png"
          ratio="1/1"
          variant="stamp"
          caption="2FA-замок"
          className="w-20"
        />
        <p className="text-small text-ink-soft">
          Виконання виплат потребує підтвердження 2FA (FRONTEND-API §3.11). Без активного
          TOTP-токена дія заблокована.
        </p>
      </div>
      <p className="max-w-prose text-body text-ink-soft">Форма payouts/execute зʼявиться тут.</p>
    </EditorialPageShell>
  );
}
