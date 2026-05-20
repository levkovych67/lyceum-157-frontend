import type { ReactNode } from "react";
import { Container, Section, Stack } from "@/shared/ui";

export function EditorialPageShell({ children }: { children: ReactNode }) {
  return (
    <Section pad="default" className="overflow-x-hidden">
      <Container>
        <Stack gap={6}>{children}</Stack>
      </Container>
    </Section>
  );
}
