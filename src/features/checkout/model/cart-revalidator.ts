"use client";
import { getBySlug } from "@/shared/api/generated/catalog/catalog";
import type { CartItem } from "@/entities/cart";

export type CartRevalidationIssue =
  | { productId: string; reason: "unavailable" }
  | { productId: string; reason: "insufficient-stock"; available: number };

export async function revalidateCart(items: CartItem[]): Promise<CartRevalidationIssue[]> {
  const issues: CartRevalidationIssue[] = [];
  await Promise.all(
    items.map(async (it) => {
      try {
        const p = await getBySlug(it.slug);
        const stockQty = p.stockQty ?? 0;
        if (it.type === "PHYSICAL" && stockQty < it.qty) {
          issues.push({
            productId: it.productId,
            reason: "insufficient-stock",
            available: stockQty,
          });
        }
      } catch {
        issues.push({ productId: it.productId, reason: "unavailable" });
      }
    }),
  );
  return issues;
}
