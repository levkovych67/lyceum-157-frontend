"use client";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
export const toast = sonnerToast;
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      duration={5000}
      toastOptions={{
        className:
          "rounded-md border-l-4 border-burgundy bg-bg-card text-ink shadow-paper font-body",
        descriptionClassName: "text-small text-ink-soft",
      }}
    />
  );
}
