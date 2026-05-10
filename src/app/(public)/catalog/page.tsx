import type { Metadata } from "next";
import { CatalogScreen } from "@/views/catalog";
import { serverApi } from "@/shared/api/server-client";
import type { Page as P, ProductCardDto } from "@/shared/api";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";

export const metadata: Metadata = {
  title: "Каталог робіт — кераміка, графіка, текстиль учнів Ліцею №157",
  description:
    "Перегляньте каталог учнівських робіт: кераміка, графіка, текстиль, живопис. Кожна робота — від конкретного учня художнього класу Ліцею №157 у Києві.",
  alternates: { canonical: "/catalog" },
  openGraph: {
    title: "Каталог · Майстерня 157",
    description: "Кераміка, графіка, текстиль, живопис учнів художнього класу Ліцею №157, Київ.",
    url: "/catalog",
  },
};
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
  return (
    <WidgetErrorBoundary label="Каталог">
      <CatalogScreen data={data} />
    </WidgetErrorBoundary>
  );
}
