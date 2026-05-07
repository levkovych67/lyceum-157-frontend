import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { tryRefresh, _resetRefreshForTest } from "@/shared/api/refresh";
import { setSnapshot, getSnapshot } from "@/shared/api/auth-token";

describe("tryRefresh", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setSnapshot(null);
    _resetRefreshForTest();
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: "new-tok", expiresIn: 900, userId: "u1", role: "STUDENT" }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sets snapshot on success and returns true", async () => {
    expect(await tryRefresh()).toBe(true);
    expect(getSnapshot()?.accessToken).toBe("new-tok");
  });

  it("single-flight: 5 parallel calls -> 1 fetch", async () => {
    await Promise.all([tryRefresh(), tryRefresh(), tryRefresh(), tryRefresh(), tryRefresh()]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("returns false and clears snapshot on non-ok", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    setSnapshot({ accessToken: "old", userId: "u", role: "STUDENT", expiresAt: 1 });
    expect(await tryRefresh()).toBe(false);
    expect(getSnapshot()).toBeNull();
  });
});
