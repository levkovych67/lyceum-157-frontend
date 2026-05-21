import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollParallax } from "@/shared/hooks/use-scroll-parallax";

function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe("useScrollParallax", () => {
  beforeEach(() => {
    window.scrollY = 0;
    vi.unstubAllGlobals();
  });

  it("returns 0 at the top of the page", () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useScrollParallax(0.2));
    expect(result.current).toBe(0);
  });

  it("stays 0 under prefers-reduced-motion", () => {
    stubMatchMedia(true);
    window.scrollY = 500;
    const { result } = renderHook(() => useScrollParallax(0.2));
    expect(result.current).toBe(0);
  });
});
