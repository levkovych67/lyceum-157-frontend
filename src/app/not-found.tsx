import Link from "next/link";
import { Stamp, PillButton, EditorialLabel, Container, Stack } from "@/shared/ui";

export default function NotFound() {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
        <EditorialLabel>СТОРІНКА №404</EditorialLabel>
        <h1 className="font-display text-display italic text-burgundy">
          Сторінку не знайдено в архіві
        </h1>
        <p className="text-lead text-ink-soft">Можливо, ця стаття була в іншому випуску.</p>
        <div className="w-fit self-start">
          <PillButton asChild variant="primary">
            <Link href="/">До обкладинки</Link>
          </PillButton>
        </div>
      </Stack>
    </Container>
  );
}
