import type { MetadataRoute } from "next";
import { serverApi } from "@/shared/api/server-client";
import type { Page as P, ProductCardDto } from "@/shared/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  const products = await serverApi<P<ProductCardDto>>(
    "/api/v1/products?page=0&size=1000&sort=newest",
    {
      revalidate: 3600,
    },
  ).catch(() => null);
  const productEntries: MetadataRoute.Sitemap = (products?.content ?? []).map((p) => ({
    url: `${base}/p/${p.slug}`,
    lastModified: now,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));
  return [
    { url: `${base}/`, lastModified: now, priority: 1, changeFrequency: "daily" },
    { url: `${base}/catalog`, lastModified: now, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/collections`, lastModified: now, priority: 0.7, changeFrequency: "weekly" },
    { url: `${base}/about`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/contacts`, lastModified: now, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    { url: `${base}/terms`, lastModified: now, priority: 0.3, changeFrequency: "yearly" },
    ...productEntries,
  ];
}
