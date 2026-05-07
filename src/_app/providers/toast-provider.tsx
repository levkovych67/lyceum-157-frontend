"use client";
import type { ReactNode } from "react";
import { Toaster } from "@/shared/ui";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
