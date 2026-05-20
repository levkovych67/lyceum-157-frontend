"use client";
import { Suspense } from "react";
import { AuthLayout } from "@/widgets/auth-layout";
import { EditorialLabel } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export function LoginScreen() {
  return (
    <AuthLayout photoSide="left" photoSlot="auth/login/cover" photoCaption="Читальна зала ліцею">
      <div className="w-full max-w-[460px]">
        <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
        <h1 className="mt-4 font-display text-display italic text-burgundy">Вхід</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </AuthLayout>
  );
}
