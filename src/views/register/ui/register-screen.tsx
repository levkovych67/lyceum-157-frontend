"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export function RegisterScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстрація</h1>
      <RegisterForm />
    </EditorialPageShell>
  );
}
