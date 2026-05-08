"use client";
import { useCartStore } from "@/entities/cart";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot, PillButton } from "@/shared/ui";
import Link from "next/link";

export function CartScreen() {
  const items = useCartStore((s) => s.items);
  return (
    <EditorialPageShell>
      <EditorialLabel>СПИСОК ЗАБРАТИ ДОДОМУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кошик</h1>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <ImageSlot
            slot="cart/empty-state"
            ratio="4/5"
            variant="stamp"
            caption="Кошик порожній"
            className="w-48"
          />
          <p className="font-display text-h3 italic text-ink-soft">Поки що нічого не вибрано</p>
        </div>
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
    </EditorialPageShell>
  );
}
