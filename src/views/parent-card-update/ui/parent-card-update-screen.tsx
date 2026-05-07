import { EditorialLabel } from "@/shared/ui";

export function ParentCardUpdateScreen({ token }: { token: string }) {
  return (
    <div className="space-y-6 py-10">
      <EditorialLabel color="burgundy">ОНОВЛЕННЯ КАРТКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оновити картку для виплат</h1>
      <p className="text-lead text-ink-soft">Token: {token.slice(0, 8)}…</p>
      <p className="text-small text-ink-fade">Форма оновлення (Phase 6)</p>
    </div>
  );
}
