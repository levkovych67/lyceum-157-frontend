import type { Metadata } from "next";
import { ProductDetailScreen } from "@/views/product-detail";

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  return { title: `Робота: ${params.slug}` };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetailScreen slug={params.slug} />;
}
