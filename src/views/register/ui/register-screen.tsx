"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export function RegisterScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА КАРТКА</EditorialLabel>
      <div className="relative mt-4">
        <ImageSlot
          slot="auth/register/decorative-stamp"
          src="/images/auth/register/decorative-stamp.png"
          ratio="1/1"
          variant="stamp"
          caption="Печатка реєстрації"
          className="absolute -right-2 -top-12 z-10 w-20 rotate-[-8deg] md:-right-6 md:-top-16 md:w-24"
        />
        <h1 className="font-display text-mega italic text-burgundy">Реєстрація</h1>
      </div>
      <RegisterForm />
    </EditorialPageShell>
  );
}
