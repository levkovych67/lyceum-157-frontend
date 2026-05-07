import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { api } from "@/shared/api/client";
import { setSnapshot } from "@/shared/api/auth-token";
import { ApiError } from "@/shared/api/errors";
import { _resetRefreshForTest } from "@/shared/api/refresh";

describe("api client", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    setSnapshot(null);
    _resetRefreshForTest();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("attaches Bearer when token present", async () => {
    setSnapshot({
      accessToken: "tok",
      userId: "u",
      role: "STUDENT",
      expiresAt: Date.now() + 100000,
    });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ ok: true }),
    });
    await api("/me");
    const headers = fetchMock.mock.calls[0]![1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok");
  });

  it("auto-generates Idempotency-Key on POST", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: async () => undefined,
    });
    await api("/x", { method: "POST", body: JSON.stringify({}) });
    const headers = fetchMock.mock.calls[0]![1].headers as Headers;
    expect(headers.get("Idempotency-Key")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns undefined on 204", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, headers: new Headers() });
    expect(await api("/x")).toBeUndefined();
  });

  it("throws ApiError on non-ok with ProblemDetail body", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      statusText: "Conflict",
      headers: new Headers({ "Content-Type": "application/problem+json" }),
      json: async () => ({
        type: "",
        title: "Conflict",
        status: 409,
        detail: "x",
        instance: "",
        timestamp: "",
      }),
    });
    await expect(api("/x")).rejects.toBeInstanceOf(ApiError);
  });

  it("retries once after 401 + successful refresh", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({
          status: 401,
          title: "U",
          type: "",
          detail: "",
          instance: "",
          timestamp: "",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ accessToken: "new", expiresIn: 900, userId: "u", role: "STUDENT" }),
      }) // refresh
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ data: 1 }),
      }); // retry
    const result = await api<{ data: number }>("/protected");
    expect(result.data).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
