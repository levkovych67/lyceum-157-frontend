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
      className="relative inline-flex items-center justify-center"
    >
      <ShoppingCart size={24} strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-burgundy px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
