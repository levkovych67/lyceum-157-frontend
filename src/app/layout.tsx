import type { Metadata } from "next";
import { fraunces, sourceSerif, manrope, caveat } from "@/_app/fonts";
import { AppProviders } from "@/_app/providers";
import { CookieBanner } from "@/widgets/cookie-banner";
import "@/_app/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Майстерня 157 — Архів учнівських робіт", template: "%s · Майстерня 157" },
  description: "Випуск №47 архіву Ліцею №157, Київ · Оболонь",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Майстерня 157",
    description: "Архів учнівських робіт. З 1957.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "uk_UA",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uk"
      className={`${fraunces.variable} ${sourceSerif.variable} ${manrope.variable} ${caveat.variable}`}
    >
      <body className="bg-bg font-body text-ink antialiased">
        <AppProviders>{children}</AppProviders>
        <CookieBanner />
      </body>
    </html>
  );
}
