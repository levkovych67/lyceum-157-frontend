import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sumMoney, mulMoney } from "@/shared/lib/money";
import type { CartItem } from "./types";

type CartState = {
  items: CartItem[];
  count: number;
  add: (item: CartItem) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  totalUah: () => string;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const items = existing
            ? state.items.map((i) =>
                i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i,
              )
            : [...state.items, item];
          return { items, count: items.reduce((s, i) => s + i.qty, 0) };
        }),
      setQty: (productId, qty) =>
        set((state) => {
          const items =
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) => (i.productId === productId ? { ...i, qty } : i));
          return { items, count: items.reduce((s, i) => s + i.qty, 0) };
        }),
      remove: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          return { items, count: items.reduce((s, i) => s + i.qty, 0) };
        }),
      clear: () => set({ items: [], count: 0 }),
      totalUah: () => sumMoney(get().items.map((i) => mulMoney(i.priceUah, i.qty))),
    }),
    { name: "lyceum-cart-v1" },
  ),
);
