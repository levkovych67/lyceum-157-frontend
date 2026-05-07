import type { Metadata } from "next";
import { CatalogScreen } from "@/views/catalog";
import { serverApi } from "@/shared/api/server-client";
import type { Page as P, ProductCardDto } from "@/shared/api";

export const metadata: Metadata = { title: "Каталог" };
export const revalidate = 300;
export const dynamic = "auto";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string; type?: string };
}) {
  const params = new URLSearchParams();
  params.set("page", searchParams.page ?? "0");
  params.set("size", "20");
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.type) params.set("type", searchParams.type);
  const data = await serverApi<P<ProductCardDto>>(`/products?${params}`, {
    revalidate: 300,
    tags: ["catalog"],
  }).catch(() => null);
  return <CatalogScreen data={data} />;
}
