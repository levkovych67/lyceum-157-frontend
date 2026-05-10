"use client";
import { useCartStore } from "@/entities/cart";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, PillButton, Stamp } from "@/shared/ui";
import Link from "next/link";

export function CartScreen() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((acc, it) => acc + Number(it.priceUah) * it.qty, 0);

  return (
    <EditorialPageShell>
      <section className="relative py-8">
        <EditorialLabel>СПИСОК ЗАБРАТИ ДОДОМУ</EditorialLabel>
        <h1 className="mt-4 font-display text-mega italic text-burgundy">Кошик</h1>
      </section>

      <EditorialDivider />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <p className="font-hand text-hand-l text-ink">Поки що тут порожньо.</p>
          <ImageSlot
            slot="cart/empty-state"
            src="/images/cart/empty-state.png"
            ratio="1/1"
            variant="plain"
            caption="Порожній кошик"
            className="w-48 opacity-50 grayscale"
          />
          <PillButton asChild className="hover:bg-burgundy/90 mt-8 bg-burgundy text-bg-warm">
            <Link href="/catalog">До каталогу</Link>
          </PillButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-16 py-8 md:grid-cols-[1fr_320px]">
          {/* Items */}
          <ul className="space-y-8">
            {items.map((it, idx) => (
              <li key={it.productId} className="flex items-center gap-6">
                <div
                  className={`transition-transform hover:rotate-0 ${idx % 2 === 0 ? "rotate-[-3deg]" : "rotate-[4deg]"}`}
                >
                  <ImageSlot
                    slot={`cart/item/${it.productId}`}
                    src={`/images/product/${it.productId}/thumb-1.png`}
                    ratio="1/1"
                    variant="polaroid"
                    caption=""
                    className="w-24 shadow-photo"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-display text-h3 italic text-ink">{it.title}</p>
                  <p className="mt-1 text-small uppercase tracking-wider text-ink-soft">
                    КІЛЬКІСТЬ: {it.qty}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-h3 text-burgundy">{it.priceUah} ₴</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Checkout Panel */}
          <aside className="relative rotate-[1deg] self-start border-[1.5px] border-burgundy bg-bg-warm p-8 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
            <Stamp
              text="РАХУНОК"
              rotation={-8}
              className="absolute -left-6 -top-6 bg-bg-warm text-burgundy"
            />
            <EditorialLabel className="mb-6">ПІДСУМОК</EditorialLabel>

            <div className="border-ink/30 mb-6 space-y-4 border-b-[1.5px] border-dashed pb-6 text-lead text-ink">
              <div className="flex justify-between">
                <span>Роботи ({items.reduce((acc, it) => acc + it.qty, 0)})</span>
                <span>{total} ₴</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Доставка</span>
                <span>За тарифами</span>
              </div>
            </div>

            <div className="mb-8 flex justify-between font-display text-h2 text-burgundy">
              <span>Разом</span>
              <span>{total} ₴</span>
            </div>

            <PillButton
              asChild
              className="hover:bg-burgundy/90 w-full justify-center bg-burgundy text-bg-warm"
            >
              <Link href="/checkout">Оформити</Link>
            </PillButton>
          </aside>
        </div>
      )}
    </EditorialPageShell>
  );
}
