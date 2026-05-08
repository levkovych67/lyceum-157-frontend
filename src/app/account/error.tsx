"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export default function AccountError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.accountStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">
          {uk.errors.accountHeadline}
        </h1>
        <div className="flex gap-3">
          <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
          <PillButton variant="outline-d" asChild>
            <Link href="/login">{uk.errors.toLogin}</Link>
          </PillButton>
        </div>
      </Stack>
    </Container>
  );
}
