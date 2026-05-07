import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailScreen } from "@/views/product-detail";
import { serverApi } from "@/shared/api/server-client";
import type { ProductDetailDto, Page as P, ProductCardDto } from "@/shared/api";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const top = await serverApi<P<ProductCardDto>>("/products?page=0&size=100&sort=popular", {
    revalidate: 3600,
  }).catch(() => null);
  return top?.content.map(({ slug }) => ({ slug })) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = await serverApi<ProductDetailDto>(`/products/${params.slug}`, {
    revalidate: 600,
    tags: [`product:${params.slug}`],
  }).catch(() => null);
  if (!p) return { title: "Робота" };
  return {
    title: p.title,
    description: p.description.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: { title: p.title, images: p.imageUrls[0] ? [p.imageUrls[0]] : [] },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const p = await serverApi<ProductDetailDto>(`/products/${params.slug}`, {
    revalidate: 600,
    tags: [`product:${params.slug}`],
  }).catch(() => null);
  if (!p) notFound();
  return <ProductDetailScreen product={p} />;
}
