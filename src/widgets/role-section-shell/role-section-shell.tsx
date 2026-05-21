"use client";
import type { ReactNode } from "react";
import { Container } from "@/shared/ui";
import { RoleHeader } from "./role-header";
import { type CabinetRole } from "./role-nav-config";

export function RoleSectionShell({ role, children }: { role: CabinetRole; children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <RoleHeader role={role} />
      <Container>{children}</Container>
    </main>
  );
}
