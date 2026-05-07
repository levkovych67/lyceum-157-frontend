"use client";
import { useAuth } from "@/_app/providers/auth-provider";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton } from "@/shared/ui";

export function AccountScreen() {
  const { user, role, logout } = useAuth();
  return (
    <EditorialPageShell>
      <EditorialLabel>ПЕРСОНАЛЬНИЙ КУТИК</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кабінет</h1>
      <p className="text-lead text-ink-soft">
        Роль: {role ?? "—"} · userId: {user?.userId ?? "—"}
      </p>
      <PillButton variant="outline-d" onClick={logout}>
        Вийти
      </PillButton>
      <PageStubBanner cluster="auth" />
    </EditorialPageShell>
  );
}
