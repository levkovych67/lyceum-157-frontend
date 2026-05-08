import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
export function Admin2faScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ДВОФАКТОРНА АВТЕНТИФІКАЦІЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">2FA</h1>
      <div className="flex items-center gap-4">
        <ImageSlot
          slot="admin/payouts/shield"
          ratio="1/1"
          variant="stamp"
          caption="2FA-замок"
          className="w-24"
        />
        <p className="max-w-prose text-body text-ink-soft">
          Enroll → Confirm → Verify (FRONTEND-API §3.8). Форма зʼявиться тут.
        </p>
      </div>
    </EditorialPageShell>
  );
}
