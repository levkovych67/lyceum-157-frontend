"use client";
import { Suspense } from "react";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export function LoginScreen() {
  return (
    <EditorialPageShell>
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center text-center">
        <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
        <div className="relative mb-2 mt-4">
          <ImageSlot
            slot="auth/login/decorative-stamp"
            src="/images/auth/login/decorative-stamp.webp"
            ratio="1/1"
            variant="stamp"
            caption="Печатка входу"
            className="pointer-events-none absolute -right-16 -top-12 z-10 w-20 rotate-[-8deg] md:-right-20 md:-top-16 md:w-24"
          />
          <h1 className="font-display text-mega italic text-burgundy">Вхід</h1>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </EditorialPageShell>
  );
}
