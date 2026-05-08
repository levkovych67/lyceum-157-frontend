"use client";
import { useEffect } from "react";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export default function ParentError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.parentStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">
          {uk.errors.parentHeadline}
        </h1>
        <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
      </Stack>
    </Container>
  );
}
