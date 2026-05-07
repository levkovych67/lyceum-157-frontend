import type { ReactNode } from "react";
import { Container, Section, Stack } from "@/shared/ui";

export function EditorialPageShell({ children }: { children: ReactNode }) {
  return (
    <Section pad="default">
      <Container>
        <Stack gap={6}>{children}</Stack>
      </Container>
    </Section>
  );
}
