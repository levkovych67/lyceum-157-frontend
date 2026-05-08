import type { Metadata } from "next";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { uk } from "@/shared/i18n";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Угода користувача",
  description: "Умови використання сервісу Майстерня 157.",
};

export default function TermsPage() {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.legalStubStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.legal.termsTitle}</h1>
        <p className="text-lead text-ink-soft">{uk.legal.stubBody}</p>
        <p className="font-hand text-hand-s text-ink-soft">
          {uk.legal.stubContact}{" "}
          <a href="mailto:legal@157.kyiv.ua" className="underline">
            legal@157.kyiv.ua
          </a>
        </p>
      </Stack>
    </Container>
  );
}
