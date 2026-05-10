import type { Metadata } from "next";
import { CollectionsScreen } from "@/views/collections";
import { JsonLd, collectionPageSchema, breadcrumbSchema } from "@/shared/seo";

export const metadata: Metadata = {
  title: "Колекції — тематичні спецвипуски учнівського мистецтва",
  description:
    "Тематичні колекції робіт учнів Ліцею №157: «Шевченківські дні», «Випуск 11-А», «Літня практика», «Архів 2024». Кураторські добірки художнього класу.",
  alternates: { canonical: "/collections" },
  openGraph: {
    title: "Колекції · Майстерня 157",
    description:
      "Тематичні колекції учнівських робіт: Шевченківські дні, випуск 11-А, літня практика.",
    url: "/collections",
  },
};

export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          collectionPageSchema({
            url: "/collections",
            name: "Колекції · Майстерня 157",
            description: "Тематичні спецвипуски учнівського мистецтва Ліцею №157.",
          }),
          breadcrumbSchema([
            { name: "Головна", url: "/" },
            { name: "Колекції", url: "/collections" },
          ]),
        ]}
      />
      <CollectionsScreen />
    </>
  );
}
