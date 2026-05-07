import { describe, it, expect, beforeEach } from "vitest";
import { getOrCreateIdemKey, clearIdemKey } from "@/shared/api/idempotency";

describe("idempotency", () => {
  beforeEach(() => sessionStorage.clear());

  it("returns same key for same body", () => {
    const a = getOrCreateIdemKey("orders.create", { x: 1 });
    const b = getOrCreateIdemKey("orders.create", { x: 1 });
    expect(a).toBe(b);
  });

  it("returns new key for different body", () => {
    const a = getOrCreateIdemKey("orders.create", { x: 1 });
    const b = getOrCreateIdemKey("orders.create", { x: 2 });
    expect(a).not.toBe(b);
  });

  it("clearIdemKey removes stored key", () => {
    const a = getOrCreateIdemKey("orders.create", { x: 1 });
    clearIdemKey("orders.create", { x: 1 });
    const b = getOrCreateIdemKey("orders.create", { x: 1 });
    expect(a).not.toBe(b);
  });
});
