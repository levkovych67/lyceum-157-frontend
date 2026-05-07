"use client";
import type { ReactNode } from "react";
import { Container } from "@/shared/ui";

export function RoleSectionShell({
  role,
  children,
}: {
  role: "student" | "admin";
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <Container>
        <p className="text-label text-burgundy">
          ▌ {role === "student" ? "Кабінет учня" : "Адміністрування"}
        </p>
        {children}
      </Container>
    </main>
  );
}
