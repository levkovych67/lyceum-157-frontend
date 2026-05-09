import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useCheckoutIdempotencyKey,
  clearCheckoutIdempotencyKey,
  rotateCheckoutIdempotencyKey,
} from "@/shared/api/idempotency";

const STORAGE_KEY = "checkout.idem-key";

describe("checkout idempotency key", () => {
  beforeEach(() => sessionStorage.clear());

  it("useCheckoutIdempotencyKey returns same UUID across re-renders", () => {
    const { result, rerender } = renderHook(() => useCheckoutIdempotencyKey());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
    expect(first).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("persists key across hook lifecycles via sessionStorage", () => {
    const { result, unmount } = renderHook(() => useCheckoutIdempotencyKey());
    const first = result.current;
    unmount();
    const { result: result2 } = renderHook(() => useCheckoutIdempotencyKey());
    expect(result2.current).toBe(first);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe(first);
  });

  it("clearCheckoutIdempotencyKey wipes storage so next hook entry generates a fresh key", () => {
    const { result, unmount } = renderHook(() => useCheckoutIdempotencyKey());
    const first = result.current;
    unmount();
    clearCheckoutIdempotencyKey();
    const { result: result2 } = renderHook(() => useCheckoutIdempotencyKey());
    expect(result2.current).not.toBe(first);
  });

  it("rotateCheckoutIdempotencyKey returns new UUID and persists it", () => {
    const { result } = renderHook(() => useCheckoutIdempotencyKey());
    const first = result.current;
    const next = rotateCheckoutIdempotencyKey();
    expect(next).not.toBe(first);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBe(next);
  });
});
