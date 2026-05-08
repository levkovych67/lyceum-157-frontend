"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export function RegisterScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА КАРТКА</EditorialLabel>
      <div className="relative">
        <ImageSlot
          slot="auth/register/decorative-stamp"
          ratio="1/1"
          variant="stamp"
          caption="Печатка реєстрації"
          className="absolute -right-2 -top-4 w-20 rotate-[-8deg] md:-right-6 md:-top-6 md:w-24"
        />
        <h1 className="font-display text-h1 italic text-burgundy">Реєстрація</h1>
      </div>
      <RegisterForm />
    </EditorialPageShell>
  );
}
