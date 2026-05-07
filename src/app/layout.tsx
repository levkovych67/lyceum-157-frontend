import type { Metadata } from "next";
import { fraunces, manrope, caveat } from "@/_app/fonts";
import { AppProviders } from "@/_app/providers";
import "@/_app/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Майстерня 157 — Архів учнівських робіт", template: "%s · Майстерня 157" },
  description: "Випуск №47 архіву Ліцею №157, Київ · Оболонь",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${fraunces.variable} ${manrope.variable} ${caveat.variable}`}>
      <body className="bg-bg font-body text-ink antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
