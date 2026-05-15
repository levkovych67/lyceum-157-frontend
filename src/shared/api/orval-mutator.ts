import { api, type ApiOptions } from "@/shared/api/client";

const HEADER_TO_OPTION_MAP = {
  "Idempotency-Key": "idemKey",
  "X-TOTP-Code": "totp",
} as const;

/**
 * Orval-compatible mutator. Bridges RequestInit-style options (which is all
 * orval-generated functions can pass) into our internal ApiOptions shape
 * understood by client.ts. Special-cases two headers that client.ts already
 * knows how to set itself (so we strip them from the outgoing Headers object
 * to avoid double-set) plus an X-Auth-Disable opt-out flag.
 */
export const customFetch = <T>(url: string, init?: RequestInit): Promise<T> => {
  const opts: ApiOptions = {
    method: init?.method,
    body: init?.body as ApiOptions["body"],
    signal: init?.signal ?? undefined,
  };

  if (init?.headers) {
    const headers = new Headers(init.headers as HeadersInit);

    for (const [headerName, optionKey] of Object.entries(HEADER_TO_OPTION_MAP)) {
      const val = headers.get(headerName);
      if (val !== null) {
        (opts as Record<string, unknown>)[optionKey] = val;
        headers.delete(headerName);
      }
    }

    if (headers.get("X-Auth-Disable") === "true") {
      opts.auth = false;
      headers.delete("X-Auth-Disable");
    }

    // Re-serialise the remaining headers as a plain record so api() can append
    // its own (Accept, Content-Type, Authorization) without conflicts.
    const plain: Record<string, string> = {};
    headers.forEach((v, k) => {
      plain[k] = v;
    });
    opts.headers = plain;
  }

  return api<T>(url, opts);
};

export default customFetch;
