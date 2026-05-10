import type { Metadata, Viewport } from "next";
import { fraunces, sourceSerif, manrope, caveat } from "@/_app/fonts";
import { AppProviders } from "@/_app/providers";
import { CookieBanner } from "@/widgets/cookie-banner";
import { JsonLd, organizationSchema, websiteSchema, SITE_NAME, SITE_URL } from "@/shared/seo";
import "@/_app/styles/globals.css";

const description =
  "Архів учнівських робіт Ліцею №157 у Києві. Кераміка, графіка, текстиль і живопис художнього класу — з 1957 року. Купуючи роботу, ви забираєте час дитини, а не товар.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Архів учнівських робіт Ліцею №157, Київ`,
    template: `%s · ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  keywords: [
    "Ліцей 157",
    "Майстерня 157",
    "учнівські роботи",
    "шкільне мистецтво Київ",
    "кераміка учнів",
    "дитячі малюнки купити",
    "художня школа Оболонь",
    "архів дитячого мистецтва",
    "Lyceum 157",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
    languages: { "uk-UA": "/" },
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Архів учнівських робіт Ліцею №157`,
    description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — архів учнівських робіт Ліцею №157, Київ`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Архів учнівських робіт Ліцею №157`,
    description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5ecd9" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1612" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uk"
      className={`${fraunces.variable} ${sourceSerif.variable} ${manrope.variable} ${caveat.variable}`}
    >
      <body className="bg-bg font-body text-ink antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <AppProviders>{children}</AppProviders>
        <CookieBanner />
      </body>
    </html>
  );
}
