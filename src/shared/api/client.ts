import { API_BASE } from "./constants";
import { getAccessToken } from "./auth-token";
import { ApiError, fallbackProblem, type ProblemDetail } from "./errors";
import { tryRefresh } from "./refresh";

export type ApiOptions = RequestInit & {
  auth?: boolean;
  idemKey?: string;
  totp?: string;
};

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  return apiRequest<T>(path, opts, false);
}

async function apiRequest<T>(path: string, opts: ApiOptions, retried: boolean): Promise<T> {
  const headers = new Headers(opts.headers);
  headers.set("Accept", "application/json");
  if (opts.body && !(opts.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth !== false) {
    const tok = getAccessToken();
    if (tok) headers.set("Authorization", `Bearer ${tok}`);
  }
  if (opts.idemKey) headers.set("Idempotency-Key", opts.idemKey);
  if (opts.totp) headers.set("X-TOTP-Code", opts.totp);

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    credentials: path.startsWith("/api/v1/auth/") ? "include" : "same-origin",
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 401 && opts.auth !== false && !path.startsWith("/api/v1/auth/")) {
    if (retried) {
      // Already retried once with a fresh token and still 401 — give up and force logout.
      // res is a 401 (!res.ok === true), so the `if (!res.ok)` block below throws ApiError.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout-required"));
      }
    } else {
      const refresh = await tryRefresh();
      if (refresh.ok) return apiRequest<T>(path, opts, true);
      if (typeof window !== "undefined") {
        if (refresh.reason === "replay") {
          window.dispatchEvent(
            new CustomEvent("auth:security-incident", { detail: { kind: "refresh-replay" } }),
          );
        }
        window.dispatchEvent(new Event("auth:logout-required"));
      }
    }
  }

  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as ProblemDetail | null;
    throw new ApiError(problem ?? fallbackProblem(res));
  }

  const ct = res.headers.get("Content-Type") ?? "";
  if (ct.includes("text/csv") || ct.includes("application/octet-stream")) {
    return (await res.blob()) as unknown as T;
  }
  return res.json() as Promise<T>;
}
