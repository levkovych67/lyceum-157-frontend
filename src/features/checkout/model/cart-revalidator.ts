"use client";
import { catalogApi } from "@/shared/api";
import type { CartItem } from "@/entities/cart";

export type CartRevalidationIssue =
  | { productId: string; reason: "unavailable" }
  | { productId: string; reason: "insufficient-stock"; available: number };

export async function revalidateCart(items: CartItem[]): Promise<CartRevalidationIssue[]> {
  const issues: CartRevalidationIssue[] = [];
  await Promise.all(
    items.map(async (it) => {
      try {
        const p = await catalogApi.bySlug(it.slug);
        if (it.type === "PHYSICAL" && p.stockQty < it.qty) {
          issues.push({
            productId: it.productId,
            reason: "insufficient-stock",
            available: p.stockQty,
          });
        }
      } catch {
        issues.push({ productId: it.productId, reason: "unavailable" });
      }
    }),
  );
  return issues;
}
