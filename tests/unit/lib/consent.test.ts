import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CONSENT_COOKIE,
  getConsentDismissed,
  setConsentDismissed,
} from "@/shared/lib/consent/consent";

describe("consent cookie helpers", () => {
  describe("getConsentDismissed", () => {
    it("returns false when cookie jar is empty string", () => {
      expect(getConsentDismissed("")).toBe(false);
    });
    it("returns false when cookie jar is undefined", () => {
      expect(getConsentDismissed(undefined)).toBe(false);
    });
    it("returns false when cookie absent in jar", () => {
      expect(getConsentDismissed("foo=1; bar=2")).toBe(false);
    });
    it("returns true when consent_dismissed=1 present", () => {
      expect(getConsentDismissed(`${CONSENT_COOKIE}=1`)).toBe(true);
    });
    it("returns true when cookie present alongside others", () => {
      expect(getConsentDismissed(`foo=a; ${CONSENT_COOKIE}=1; bar=b`)).toBe(true);
    });
    it("returns false when cookie value is 0", () => {
      expect(getConsentDismissed(`${CONSENT_COOKIE}=0`)).toBe(false);
    });
  });

  describe("setConsentDismissed", () => {
    beforeEach(() => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        configurable: true,
        value: "",
      });
    });
    it("writes cookie with max-age and sameSite", () => {
      const setter = vi.fn();
      Object.defineProperty(document, "cookie", { set: setter, get: () => "" });
      setConsentDismissed();
      expect(setter).toHaveBeenCalledTimes(1);
      const firstCall = setter.mock.calls[0];
      expect(firstCall).toBeDefined();
      const written = firstCall![0] as string;
      expect(written).toContain(`${CONSENT_COOKIE}=1`);
      expect(written).toContain("max-age=31536000");
      expect(written.toLowerCase()).toContain("samesite=lax");
      expect(written).toContain("path=/");
    });
  });
});
