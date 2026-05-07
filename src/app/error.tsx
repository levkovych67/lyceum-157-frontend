"use client";
import { Stamp, PillButton, Container, Stack } from "@/shared/ui";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text="ВИПУСК ПОШКОДЖЕНО" rotation={5} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">Сторінка не друкується</h1>
        <p className="text-lead text-ink-soft">
          Щось пішло не так під час верстки. Спробуйте оновити.
        </p>
        <PillButton onClick={reset}>Перезавантажити аркуш</PillButton>
      </Stack>
    </Container>
  );
}
