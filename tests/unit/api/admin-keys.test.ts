import { describe, it, expect } from "vitest";
import { adminKeys } from "@/shared/api/admin-keys";

describe("adminKeys", () => {
  it("products root key is stable", () => {
    expect(adminKeys.products()).toEqual(["admin", "products"]);
  });
  it("order key includes id", () => {
    expect(adminKeys.order("o1")).toEqual(["admin", "order", "o1"]);
  });
  it("orders / payouts / me roots are stable", () => {
    expect(adminKeys.orders()).toEqual(["admin", "orders"]);
    expect(adminKeys.payouts()).toEqual(["admin", "payouts"]);
    expect(adminKeys.me()).toEqual(["admin", "me"]);
  });
});
