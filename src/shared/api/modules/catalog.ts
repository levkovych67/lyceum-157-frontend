import { api } from "@/shared/api/client";
import type { Page } from "@/shared/api/types";

export type ProductType = "PHYSICAL" | "DIGITAL";
export type Sort = "newest" | "price_asc" | "price_desc" | "popular";

export type AuthorDto = { studentId: string; firstName: string; grade: string };

export type ProductCardDto = {
  id: string;
  title: string;
  slug: string;
  priceUah: string;
  type: ProductType;
  author: AuthorDto;
  thumbnailUrl: string | null;
};

export type ProductDetailDto = {
  id: string;
  title: string;
  slug: string;
  description: string; // sanitized HTML
  priceUah: string;
  type: ProductType;
  stockQty: number;
  viewCount: number;
  author: AuthorDto;
  imageUrls: string[];
};

const qs = (o: Record<string, unknown>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

export const catalogApi = {
  list: (q: { page?: number; size?: number; type?: ProductType; sort?: Sort }) =>
    api<Page<ProductCardDto>>(`/products?${qs(q)}`, { auth: false }),
  bySlug: (slug: string) => api<ProductDetailDto>(`/products/${slug}`, { auth: false }),
};
