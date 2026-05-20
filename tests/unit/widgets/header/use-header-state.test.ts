import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useHeaderState } from "@/widgets/header/use-header-state";

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, writable: true, configurable: true });
  window.dispatchEvent(new Event("scroll"));
}

describe("useHeaderState", () => {
  afterEach(() => scrollTo(0));

  it("не floating на самому верху сторінки", () => {
    scrollTo(0);
    const { result } = renderHook(() => useHeaderState());
    expect(result.current.floating).toBe(false);
  });

  it("стає floating після прокручування за поріг", () => {
    const { result } = renderHook(() => useHeaderState());
    act(() => scrollTo(40));
    expect(result.current.floating).toBe(true);
  });

  it("повертається в non-floating при поверненні на верх", () => {
    const { result } = renderHook(() => useHeaderState());
    act(() => scrollTo(40));
    act(() => scrollTo(0));
    expect(result.current.floating).toBe(false);
  });
});
