"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { ApiError } from "@/shared/api/errors";
import { uk } from "@/shared/i18n";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  const needs2fa = error instanceof ApiError && error.isUnauthorized;
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.adminStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">
          {uk.errors.adminHeadline}
        </h1>
        <div className="flex gap-3">
          <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
          {needs2fa && (
            <PillButton variant="outline-d" asChild>
              <Link href="/admin/2fa">2FA</Link>
            </PillButton>
          )}
        </div>
      </Stack>
    </Container>
  );
}
