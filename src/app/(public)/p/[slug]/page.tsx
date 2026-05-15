import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailScreen, assertProductDetail } from "@/views/product-detail";
import { serverApi } from "@/shared/api/server-client";
import type { ProductDetailDto, Page as P, ProductCardDto } from "@/shared/api";
import { JsonLd, productSchema, breadcrumbSchema } from "@/shared/seo";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const top = await serverApi<P<ProductCardDto>>("/products?page=0&size=100&sort=popular", {
    revalidate: 3600,
  }).catch(() => null);
  return top?.content.flatMap(({ slug }) => (slug ? [{ slug }] : [])) ?? [];
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  if (!p) return { title: "Робота не знайдена" };
  assertProductDetail(p);
  const author = `${p.author.firstName}, ${p.author.grade}`;
  const desc =
    `${plainText(p.description).slice(0, 140)} · Автор: ${author} · ${p.priceUah} ₴`.slice(0, 170);
  return {
    title: `${p.title} — робота учня ${author}`,
    description: desc,
    alternates: { canonical: `/p/${params.slug}` },
    openGraph: {
      type: "article",
      title: `${p.title} · ${author}`,
      description: desc,
      url: `/p/${params.slug}`,
      images: p.imageUrls.slice(0, 4).map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.title} · ${author}`,
      description: desc,
      images: p.imageUrls.slice(0, 1),
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const p = await serverApi<ProductDetailDto>(`/products/${params.slug}`, {
    revalidate: 600,
    tags: [`product:${params.slug}`],
  }).catch(() => null);
  if (!p) notFound();
  assertProductDetail(p);
  return (
    <>
      <JsonLd
        data={[
          productSchema({
            slug: p.slug,
            title: p.title,
            description: plainText(p.description),
            priceUah: p.priceUah,
            imageUrls: p.imageUrls,
            authorName: p.author.firstName,
            authorGrade: p.author.grade,
          }),
          breadcrumbSchema([
            { name: "Головна", url: "/" },
            { name: "Каталог", url: "/catalog" },
            { name: p.title, url: `/p/${p.slug}` },
          ]),
        ]}
      />
      <ProductDetailScreen product={p} />
    </>
  );
}
