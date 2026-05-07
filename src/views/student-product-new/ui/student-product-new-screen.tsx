"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentProductNewScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА РОБОТА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Додати роботу</h1>
      <p className="text-lead text-ink-soft">Форма (Phase 6)</p>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
