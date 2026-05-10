"use client";
import Link from "next/link";
import { useConsent } from "@/shared/lib/consent";
import { Container } from "@/shared/ui/layout/container";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export function CookieBanner() {
  const { dismissed, dismiss } = useConsent();
  if (dismissed !== false) return null;
  return (
    <div
      role="region"
      aria-label={uk.cookies.ariaLabel}
      className="border-ink/30 fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-dashed bg-bg-warm shadow-[0_-8px_32px_rgba(110,39,61,0.12)]"
    >
      <Container>
        <div className="flex items-center justify-between gap-4 py-2">
          <p className="font-hand text-hand-s text-ink">
            {uk.cookies.notice}{" "}
            <Link href="/privacy" className="underline">
              {uk.cookies.policyLink}
            </Link>
          </p>
          <PillButton variant="ghost" size="s" onClick={dismiss} aria-label={uk.cookies.dismiss}>
            ✕
          </PillButton>
        </div>
      </Container>
    </div>
  );
}
