"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/entities/cart";

export function CartBadge() {
  const count = useCartStore((s) => s.count);
  return (
    <Link
      href="/cart"
      aria-label="Кошик"
      className="relative inline-flex items-center justify-center transition-transform duration-d1 ease-paper hover:-translate-y-0.5 active:scale-90"
    >
      <ShoppingCart size={24} strokeWidth={1.5} />
      {count > 0 && (
        // key={count} — лічильник «впечатується» наново на кожну зміну кошика.
        <span
          key={count}
          className="absolute -right-2 -top-2 inline-flex h-[18px] min-w-[18px] animate-badge-pop items-center justify-center rounded-full bg-burgundy px-1 text-[11px] font-bold text-white"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
