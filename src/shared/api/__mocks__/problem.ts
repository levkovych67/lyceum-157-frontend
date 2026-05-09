import type { ProblemDetail } from "@/shared/api/types";

export type ProblemOverrides = Partial<ProblemDetail> & {
  retryAfter?: number;
  idempotencyReplayed?: boolean;
};

const DEFAULTS: Record<string, { status: number; title: string; detail: string }> = {
  "urn:l157:auth/refresh-replay": {
    status: 401,
    title: "Refresh Token Reuse",
    detail: "Refresh token reuse detected — all sessions revoked, please re-login",
  },
  "urn:l157:auth/refresh-expired": {
    status: 401,
    title: "Refresh expired",
    detail: "Refresh token expired or invalid",
  },
  "urn:l157:product/wrong-state": {
    status: 409,
    title: "Wrong product state",
    detail: "Product is not in a state that allows this operation",
  },
  "urn:l157:payout/wrong-state": {
    status: 409,
    title: "Wrong payout state",
    detail: "Payout is not in a state that allows this operation",
  },
  "urn:l157:order/idem-conflict": {
    status: 409,
    title: "Idempotency conflict",
    detail: "Idempotency key already used with a different request body",
  },
  "urn:l157:rate-limit": {
    status: 429,
    title: "Rate limit exceeded",
    detail: "Too many requests, retry after the indicated window",
  },
  "urn:l157:state/wrong-state": {
    status: 409,
    title: "Wrong state",
    detail: "Operation not allowed in current state",
  },
  "urn:l157:order/out-of-stock": {
    status: 409,
    title: "Out of stock",
    detail: "Insufficient stock for one or more items",
  },
  "urn:l157:validation-error": {
    status: 400,
    title: "Validation error",
    detail: "Request validation failed",
  },
  "urn:l157:auth/invalid-credentials": {
    status: 401,
    title: "Invalid credentials",
    detail: "Email or password is invalid",
  },
};

export function makeProblem(type: string, overrides: ProblemOverrides = {}): Response {
  const def = DEFAULTS[type] ?? { status: 500, title: type, detail: "" };
  const status = overrides.status ?? def.status;
  const body: ProblemDetail = {
    type,
    title: overrides.title ?? def.title,
    status,
    detail: overrides.detail ?? def.detail,
    instance: overrides.instance ?? "/test",
    timestamp: overrides.timestamp ?? new Date().toISOString(),
    invalidParams: overrides.invalidParams,
  };
  const headers = new Headers({ "Content-Type": "application/problem+json" });
  if (type === "urn:l157:rate-limit") {
    headers.set("Retry-After", String(overrides.retryAfter ?? 60));
  }
  if (overrides.idempotencyReplayed) {
    headers.set("X-Idempotency-Replayed", "true");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export function makeReplayedSuccess<T>(body: T): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Replayed": "true",
    },
  });
}
