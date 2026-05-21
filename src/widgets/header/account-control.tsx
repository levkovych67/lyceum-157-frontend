"use client";
import Link from "next/link";
import { User } from "lucide-react";
import { cn } from "@/shared/lib";
import { AccountMonogram } from "./account-monogram";
import { useAccountIdentity } from "./use-account-identity";

/**
 * Контрол акаунта в публічному хедері (видимий із `sm`).
 * Залогінений із завантаженим іменем → монограма; інакше → іконка `<User>`.
 */
export function AccountControl({ dark }: { dark: boolean }) {
  const { isAuthenticated, initial } = useAccountIdentity();

  if (isAuthenticated && initial) {
    return (
      <Link
        href="/account"
        aria-label="Кабінет"
        className="hidden transition-transform duration-d1 ease-paper hover:-translate-y-0.5 active:scale-90 sm:block"
      >
        <AccountMonogram
          initial={initial}
          className={cn(
            "h-8 w-8 text-small",
            dark ? "bg-bg-warm text-ink" : "bg-burgundy text-bg-warm",
          )}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      aria-label="Кабінет"
      className="hidden transition-[color,transform] duration-d1 ease-paper hover:-translate-y-0.5 hover:text-burgundy active:scale-90 sm:block"
    >
      <User size={20} strokeWidth={1.5} />
    </Link>
  );
}
