"use client";
import { useCartStore } from "@/entities/cart";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, PillButton, Stamp } from "@/shared/ui";
import { mulMoney, sumMoney } from "@/shared/lib/money";
import Link from "next/link";

export function CartScreen() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const total = sumMoney(items.map((it) => mulMoney(it.priceUah, it.qty)));

  return (
    <EditorialPageShell>
      <section className="relative py-8">
        <EditorialLabel>СПИСОК ЗАБРАТИ ДОДОМУ</EditorialLabel>
        <h1 className="mt-4 font-display text-display italic leading-none text-burgundy">Кошик</h1>
      </section>

      <EditorialDivider />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 py-24">
          <p className="font-hand text-hand-l text-ink">Поки що тут порожньо.</p>
          <ImageSlot
            slot="cart/empty-state"
            src="/images/cart/empty-state.webp"
            ratio="1/1"
            variant="plain"
            caption="Порожній кошик"
            className="w-48 opacity-50 grayscale"
          />
          <PillButton asChild className="mt-8">
            <Link href="/catalog">До каталогу</Link>
          </PillButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-16 py-8 md:grid-cols-[1fr_320px]">
          {/* Items List */}
          <ul className="divide-line-strong/30 space-y-2 divide-y">
            {items.map((it, idx) => (
              <li
                key={it.productId}
                className="flex flex-col items-start justify-between gap-6 py-8 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="flex w-full flex-1 items-center gap-6">
                  {/* Polaroid Frame Thumbnail */}
                  <div
                    className={`shrink-0 transition-transform duration-300 hover:rotate-0 hover:scale-105 ${
                      idx % 2 === 0 ? "rotate-[-3deg]" : "rotate-[4deg]"
                    }`}
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

                  <div className="min-w-0 flex-1">
                    <p className="max-w-sm truncate font-display text-h3 italic text-ink sm:max-w-md">
                      {it.title}
                    </p>

                    <div className="mt-4 flex items-center gap-4">
                      {/* Pill Quantity Stepper */}
                      <div className="flex h-8 w-24 items-center overflow-hidden rounded-none border-[1.5px] border-line-strong bg-bg">
                        <button
                          onClick={() => setQty(it.productId, it.qty - 1)}
                          className="hover:bg-bg-warm/50 flex h-full w-8 items-center justify-center font-display text-sm font-bold text-ink transition-colors hover:text-burgundy focus:outline-none"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="flex-1 select-none text-center font-body text-xs font-bold text-ink">
                          {it.qty}
                        </span>
                        <button
                          onClick={() => setQty(it.productId, it.qty + 1)}
                          className="hover:bg-bg-warm/50 flex h-full w-8 items-center justify-center font-display text-sm font-bold text-ink transition-colors hover:text-burgundy focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Deletion Button */}
                      <button
                        onClick={() => remove(it.productId)}
                        className="text-burgundy/80 flex items-center gap-1 font-hand text-hand-s transition-colors hover:text-burgundy hover:underline focus:outline-none"
                      >
                        видалити ✕
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product price in list */}
                <div className="border-line-strong/20 flex w-full shrink-0 items-center justify-between border-t border-dashed pt-3 text-right sm:w-auto sm:flex-col sm:items-end sm:justify-center sm:self-center sm:border-0 sm:pt-0">
                  <span className="font-body text-[10px] uppercase tracking-wider text-ink-soft sm:hidden">
                    ЦІНА:
                  </span>
                  <p className="font-display text-h3 text-burgundy">{it.priceUah} ₴</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Checkout Panel */}
          <aside className="relative sticky top-[140px] w-full rotate-[0.5deg] self-start border-[1.5px] border-dashed border-line-strong bg-bg-warm p-8 shadow-paper">
            <Stamp
              text="РАХУНОК"
              rotation={-8}
              size={90}
              className="absolute -left-6 -top-6 bg-bg-warm text-burgundy shadow-paper"
            />
            <EditorialLabel className="mb-6 block text-right">ПІДСУМОК</EditorialLabel>

            <div className="border-ink/30 mb-6 space-y-4 border-b-[1.5px] border-dashed pb-6 text-lead text-ink">
              <div className="flex justify-between">
                <span className="font-body text-xs uppercase tracking-wider text-ink-soft">
                  Роботи ({items.reduce((acc, it) => acc + it.qty, 0)})
                </span>
                <span className="font-display text-sm font-semibold">{total} ₴</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span className="font-body text-xs uppercase tracking-wider text-ink-fade">
                  Доставка
                </span>
                <span className="font-hand text-hand-s text-green">за тарифами 📦</span>
              </div>
            </div>

            <div className="mb-8 flex justify-between font-display text-h2 text-burgundy">
              <span>Разом</span>
              <span>{total} ₴</span>
            </div>

            <PillButton asChild className="w-full">
              <Link href="/checkout">Оформити</Link>
            </PillButton>
          </aside>
        </div>
      )}
    </EditorialPageShell>
  );
}
