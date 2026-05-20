import type { ReactNode } from "react";
import { Container, Section, Stack } from "@/shared/ui";

export function EditorialPageShell({ children }: { children: ReactNode }) {
  return (
    <Section pad="page" className="overflow-x-hidden">
      <Container>
        <Stack gap="block">{children}</Stack>
      </Container>
    </Section>
  );
}
