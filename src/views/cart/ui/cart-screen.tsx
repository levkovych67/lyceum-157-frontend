"use client";
import { useCartStore } from "@/entities/cart";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton } from "@/shared/ui";
import Link from "next/link";

export function CartScreen() {
  const items = useCartStore((s) => s.items);
  return (
    <EditorialPageShell>
      <EditorialLabel>СПИСОК ЗАБРАТИ ДОДОМУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кошик</h1>
      {items.length === 0 ? (
        <p className="text-lead text-ink-soft">Кошик порожній.</p>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {items.map((it) => (
              <li key={it.productId} className="flex justify-between py-3">
                <span>
                  {it.title} × {it.qty}
                </span>
                <span>{it.priceUah} ₴</span>
              </li>
            ))}
          </ul>
          <PillButton asChild>
            <Link href="/checkout">Оформити</Link>
          </PillButton>
        </>
      )}
      <PageStubBanner cluster="checkout" />
    </EditorialPageShell>
  );
}
