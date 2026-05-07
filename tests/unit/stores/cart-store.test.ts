import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/entities/cart/model/cart-store";

const item = {
  productId: "p1",
  slug: "p-1",
  title: "X",
  priceUah: "100.00",
  qty: 1,
  thumbnailUrl: null,
  type: "PHYSICAL" as const,
};

describe("cart-store", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("adds new item", () => {
    useCartStore.getState().add(item);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().count).toBe(1);
  });

  it("merges qty when same product added twice", () => {
    useCartStore.getState().add(item);
    useCartStore.getState().add({ ...item, qty: 2 });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.qty).toBe(3);
    expect(useCartStore.getState().count).toBe(3);
  });

  it("setQty 0 removes item", () => {
    useCartStore.getState().add(item);
    useCartStore.getState().setQty("p1", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("totalUah sums price × qty", () => {
    useCartStore.getState().add(item);
    useCartStore.getState().add({ ...item, productId: "p2", priceUah: "50.00", qty: 2 });
    expect(useCartStore.getState().totalUah()).toBe("200.00");
  });
});
