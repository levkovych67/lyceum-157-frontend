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
      className="border-burgundy/30 bg-bg-warm/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-sm"
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
