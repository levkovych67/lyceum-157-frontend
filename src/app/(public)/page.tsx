import type { Metadata } from "next";
import { HomeScreen } from "@/views/home";
import { serverApi } from "@/shared/api/server-client";
import type { Page as P, ProductCardDto } from "@/shared/api";

export const metadata: Metadata = {
  title: "Майстерня 157 — Архів учнівських робіт Ліцею №157, Київ",
  description:
    "Архів робіт учнів художнього класу Ліцею №157 у Києві: кераміка, графіка, текстиль, живопис. З 1957 року. Купуйте напряму у автора — підтримайте дитячу творчість.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Майстерня 157 — Архів учнівських робіт",
    description:
      "Архів робіт учнів художнього класу Ліцею №157 у Києві: кераміка, графіка, текстиль, живопис.",
    url: "/",
  },
};
export const revalidate = 300;

export default async function Page() {
  const initial = await serverApi<P<ProductCardDto>>("/products?page=0&size=8&sort=newest", {
    revalidate: 300,
    tags: ["catalog"],
  }).catch(() => null);
  return <HomeScreen initial={initial} />;
}
