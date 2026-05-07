import type { ReactNode } from "react";
import { EditorialDivider, EditorialLabel } from "@/shared/ui";
export function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <EditorialDivider variant="dashed" />
      <EditorialLabel color="burgundy">{title}</EditorialLabel>
      {hint && <p className="text-small text-ink-soft">{hint}</p>}
      {children}
    </section>
  );
}
