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

  it("sets snapshot on success and returns ok=true", async () => {
    expect(await tryRefresh()).toEqual({ ok: true });
    expect(getSnapshot()?.accessToken).toBe("new-tok");
  });

  it("single-flight: 5 parallel calls -> 1 fetch", async () => {
    await Promise.all([tryRefresh(), tryRefresh(), tryRefresh(), tryRefresh(), tryRefresh()]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("returns reason=expired and clears snapshot on refresh-expired", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        type: "urn:l157:auth/refresh-expired",
        title: "Expired",
        status: 401,
        detail: "",
        instance: "",
        timestamp: "",
      }),
    });
    setSnapshot({ accessToken: "old", userId: "u", role: "STUDENT", expiresAt: 1 });
    const r = await tryRefresh();
    expect(r).toEqual({ ok: false, reason: "expired" });
    expect(getSnapshot()).toBeNull();
  });

  it("returns reason=replay on refresh-replay", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        type: "urn:l157:auth/refresh-replay",
        title: "Reuse",
        status: 401,
        detail: "",
        instance: "",
        timestamp: "",
      }),
    });
    expect(await tryRefresh()).toEqual({ ok: false, reason: "replay" });
  });

  it("returns reason=unknown when body is unparseable", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error("not json");
      },
    });
    expect(await tryRefresh()).toEqual({ ok: false, reason: "unknown" });
  });
});
