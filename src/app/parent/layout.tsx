import type { ReactNode } from "react";
import { Container } from "@/shared/ui";

export const dynamic = "force-dynamic";

export const metadata = { robots: "noindex, nofollow" };

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg-warm">
      <Container narrow>{children}</Container>
    </main>
  );
}
