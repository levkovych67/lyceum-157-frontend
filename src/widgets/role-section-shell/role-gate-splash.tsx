"use client";
import { Stamp } from "@/shared/ui";

export function RoleGateSplash({ text = "Перевірка доступу…" }: { text?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
      <p className="text-lead text-ink-soft">{text}</p>
    </main>
  );
}
