import type { Metadata } from "next";
import { AboutScreen } from "@/views/about";
import { JsonLd, aboutPageSchema, breadcrumbSchema } from "@/shared/seo";

export const metadata: Metadata = {
  title: "Про Ліцей №157 — школа з художнім ухилом, Київ",
  description:
    "Ліцей №157 — київська школа з художнім ухилом, заснована в 1957 році. Майстерня 157 — онлайн-архів робіт учнів, продовження класичної практики дитячого мистецтва.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Про Ліцей №157 · Майстерня 157",
    description:
      "Київська школа з художнім ухилом, заснована в 1957. Архів учнівського мистецтва — онлайн.",
    url: "/about",
  },
};

export const dynamic = "force-static";

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          aboutPageSchema(),
          breadcrumbSchema([
            { name: "Головна", url: "/" },
            { name: "Про нас", url: "/about" },
          ]),
        ]}
      />
      <AboutScreen />
    </>
  );
}
