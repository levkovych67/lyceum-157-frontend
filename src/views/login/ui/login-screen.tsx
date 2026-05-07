"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function LoginScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Вхід</h1>
      <p className="text-lead text-ink-soft">Форма входу (Phase 6)</p>
    </EditorialPageShell>
  );
}
