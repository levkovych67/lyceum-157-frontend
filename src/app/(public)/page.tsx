import type { Metadata } from "next";
import { HomeScreen } from "@/views/home";
import { serverApi } from "@/shared/api/server-client";
import type { Page as P, ProductCardDto } from "@/shared/api";

export const metadata: Metadata = { title: "Майстерня 157" };
export const revalidate = 300;

export default async function Page() {
  const initial = await serverApi<P<ProductCardDto>>("/products?page=0&size=8&sort=newest", {
    revalidate: 300,
    tags: ["catalog"],
  }).catch(() => null);
  return <HomeScreen initial={initial} />;
}
