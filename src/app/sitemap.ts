import type { MetadataRoute } from "next";
import { serverApi } from "@/shared/api/server-client";
import type { Page as P, ProductCardDto } from "@/shared/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const products = await serverApi<P<ProductCardDto>>("/products?page=0&size=1000&sort=newest", {
    revalidate: 3600,
  }).catch(() => null);
  const productEntries: MetadataRoute.Sitemap = (products?.content ?? []).map((p) => ({
    url: `${base}/p/${p.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));
  return [
    { url: `${base}/`, priority: 1, changeFrequency: "daily" },
    { url: `${base}/catalog`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/collections`, priority: 0.7 },
    { url: `${base}/about`, priority: 0.5 },
    { url: `${base}/contacts`, priority: 0.4 },
    ...productEntries,
  ];
}
