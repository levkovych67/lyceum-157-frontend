import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ApiOptions } from "@/shared/api/client";

const apiMock = vi.fn(async (_path: string, _opts?: ApiOptions) => ({ ok: true }));
vi.mock("@/shared/api/client", () => ({
  api: (path: string, opts?: ApiOptions) => apiMock(path, opts),
}));

import { customFetch } from "@/shared/api/orval-mutator";

function lastCall(): readonly [string, ApiOptions] {
  const call = apiMock.mock.calls.at(-1);
  if (!call) throw new Error("api() was not called");
  const [path, opts] = call;
  return [path, opts ?? {}] as const;
}

describe("customFetch", () => {
  beforeEach(() => apiMock.mockClear());

  it("forwards method, headers, body, signal", async () => {
    const ac = new AbortController();
    await customFetch<{ ok: true }>("/x", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Custom": "1" },
      body: '{"a":1}',
      signal: ac.signal,
    });
    expect(apiMock).toHaveBeenCalledOnce();
    const [path, opts] = lastCall();
    expect(path).toBe("/x");
    expect(opts.method).toBe("POST");
    expect(opts.body).toBe('{"a":1}');
    expect(opts.signal).toBe(ac.signal);
    const h = new Headers(opts.headers as HeadersInit);
    expect(h.get("Content-Type")).toBe("application/json");
    expect(h.get("X-Custom")).toBe("1");
  });

  it("translates Idempotency-Key header to ApiOptions.idemKey", async () => {
    await customFetch<{ ok: true }>("/x", {
      method: "POST",
      headers: { "Idempotency-Key": "abc-123" },
      body: "{}",
    });
    const [, opts] = lastCall();
    expect(opts.idemKey).toBe("abc-123");
    // Should NOT also leave the raw header in (client.ts adds it once based on idemKey)
    const h = new Headers(opts.headers as HeadersInit);
    expect(h.has("Idempotency-Key")).toBe(false);
  });

  it("translates X-TOTP-Code header to ApiOptions.totp", async () => {
    await customFetch<{ ok: true }>("/x", {
      method: "POST",
      headers: { "X-TOTP-Code": "999000" },
      body: "{}",
    });
    const [, opts] = lastCall();
    expect(opts.totp).toBe("999000");
    const h = new Headers(opts.headers as HeadersInit);
    expect(h.has("X-TOTP-Code")).toBe(false);
  });

  it("translates X-Auth-Disable: true header to ApiOptions.auth=false", async () => {
    await customFetch<{ ok: true }>("/x", {
      method: "POST",
      headers: { "X-Auth-Disable": "true" },
      body: "{}",
    });
    const [, opts] = lastCall();
    expect(opts.auth).toBe(false);
    const h = new Headers(opts.headers as HeadersInit);
    expect(h.has("x-auth-disable")).toBe(false);
  });

  it("works with undefined init (GET with no options)", async () => {
    await customFetch<{ ok: true }>("/x");
    expect(apiMock).toHaveBeenCalledOnce();
    const [path, opts] = lastCall();
    expect(path).toBe("/x");
    expect(opts.method).toBeUndefined();
  });
});
