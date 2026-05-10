"use client";
import { Suspense } from "react";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export function LoginScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
      <div className="relative mt-4">
        <ImageSlot
          slot="auth/login/decorative-stamp"
          src="/images/auth/login/decorative-stamp.png"
          ratio="1/1"
          variant="stamp"
          caption="Печатка входу"
          className="absolute -right-2 -top-12 z-10 w-20 rotate-[-8deg] md:-right-6 md:-top-16 md:w-24"
        />
        <h1 className="font-display text-mega italic text-burgundy">Вхід</h1>
      </div>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </EditorialPageShell>
  );
}
