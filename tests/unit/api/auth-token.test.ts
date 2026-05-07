import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAccessToken, getSnapshot, setSnapshot, subscribe } from "@/shared/api/auth-token";

describe("auth-token", () => {
  beforeEach(() => setSnapshot(null));

  it("returns null when not set", () => {
    expect(getAccessToken()).toBeNull();
    expect(getSnapshot()).toBeNull();
  });

  it("stores and retrieves snapshot", () => {
    setSnapshot({ accessToken: "tok", userId: "u1", role: "STUDENT", expiresAt: 1 });
    expect(getAccessToken()).toBe("tok");
    expect(getSnapshot()?.userId).toBe("u1");
  });

  it("notifies subscribers", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    setSnapshot({ accessToken: "x", userId: "u", role: "ADMIN", expiresAt: 1 });
    expect(fn).toHaveBeenCalledOnce();
    unsub();
    setSnapshot(null);
    expect(fn).toHaveBeenCalledOnce();
  });
});
