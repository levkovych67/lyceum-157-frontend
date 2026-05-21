"use client";
import Link from "next/link";
import { User } from "lucide-react";
import { AccountMonogram } from "./account-monogram";
import { useAccountIdentity } from "./use-account-identity";

const roleLabel: Record<"STUDENT" | "PARENT" | "ADMIN", string> = {
  STUDENT: "Кабінет учня",
  PARENT: "Батьківський кабінет",
  ADMIN: "Адміністрування",
};

/** Блок акаунта у мобільному drawer. `onNavigate` закриває шухляду при кліку. */
export function DrawerAccount({ onNavigate }: { onNavigate: () => void }) {
  const { isAuthenticated, initial, displayName, role } = useAccountIdentity();
  const rowClass =
    "group flex items-center gap-4 border-b-2 border-dashed border-line-strong px-6 py-5";
  const arrow = (
    <span className="font-body text-burgundy transition-transform duration-d2 ease-paper group-hover:translate-x-1">
      →
    </span>
  );

  if (isAuthenticated && initial && displayName) {
    return (
      <Link href="/account" onClick={onNavigate} className={rowClass}>
        <AccountMonogram
          initial={initial}
          className="h-11 w-11 shrink-0 bg-burgundy text-lead text-bg-warm"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-h3 italic text-burgundy">
            {displayName}
          </span>
          <span className="mt-0.5 block font-hand text-hand-s text-ink-soft">
            {role ? roleLabel[role] : "Мій кабінет"}
          </span>
        </span>
        {arrow}
      </Link>
    );
  }

  return (
    <Link href="/account" onClick={onNavigate} className={rowClass}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink">
        <User size={20} strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-h3 italic text-burgundy">Увійти в кабінет</span>
        <span className="mt-0.5 block font-hand text-hand-s text-ink-soft">
          учень · батьки · адмін
        </span>
      </span>
      {arrow}
    </Link>
  );
}
