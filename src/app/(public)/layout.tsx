import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative z-10 min-h-[calc(100vh-124px)]">
      {/* Header and Footer mounted in Phase 4 — temporarily nothing */}
      {children}
    </main>
  );
}
