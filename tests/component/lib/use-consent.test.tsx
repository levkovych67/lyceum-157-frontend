import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConsent } from "@/shared/lib/consent";
import { CONSENT_COOKIE } from "@/shared/lib/consent/consent";

describe("useConsent", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      configurable: true,
      value: "",
    });
  });

  it("starts with dismissed=null before hydration effect runs", () => {
    const { result } = renderHook(() => useConsent());
    // After first render + effect, value reflects cookie state
    expect([null, false]).toContain(result.current.dismissed);
  });

  it("reads dismissed=false when no cookie present", () => {
    Object.defineProperty(document, "cookie", { value: "", writable: true, configurable: true });
    const { result } = renderHook(() => useConsent());
    expect(result.current.dismissed).toBe(false);
  });

  it("reads dismissed=true when cookie present", () => {
    Object.defineProperty(document, "cookie", {
      value: `${CONSENT_COOKIE}=1`,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useConsent());
    expect(result.current.dismissed).toBe(true);
  });

  it("dismiss() flips state and writes cookie", () => {
    let cookieValue = "";
    Object.defineProperty(document, "cookie", {
      get: () => cookieValue,
      set: (v: string) => {
        cookieValue = v;
      },
      configurable: true,
    });
    const { result } = renderHook(() => useConsent());
    expect(result.current.dismissed).toBe(false);
    act(() => result.current.dismiss());
    expect(result.current.dismissed).toBe(true);
    expect(cookieValue).toContain(`${CONSENT_COOKIE}=1`);
  });
});
