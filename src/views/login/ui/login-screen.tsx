"use client";
import { Suspense } from "react";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export function LoginScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Вхід</h1>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </EditorialPageShell>
  );
}
