"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function RegisterScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстрація</h1>
      <p className="text-lead text-ink-soft">Форма реєстрації (Phase 6)</p>
    </EditorialPageShell>
  );
}
