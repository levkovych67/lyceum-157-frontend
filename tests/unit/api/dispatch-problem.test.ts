import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import {
  dispatchProblem,
  IdempotencyConflictError,
  isProblemType,
} from "@/shared/api/dispatch-problem";
import type { ProblemDetail } from "@/shared/api/types";

vi.mock("@/shared/ui", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/shared/api/revalidate", () => ({
  revalidateOnClient: vi.fn(async () => {}),
}));

import { toast } from "@/shared/ui";

function problem(type: string, overrides: Partial<ProblemDetail> = {}): ProblemDetail {
  return {
    type,
    title: overrides.title ?? type,
    status: overrides.status ?? 500,
    detail: overrides.detail ?? "",
    instance: "",
    timestamp: "",
    invalidParams: overrides.invalidParams,
  };
}

describe("dispatchProblem", () => {
  let queryClient: QueryClient;
  let router: { push: ReturnType<typeof vi.fn> };
  let bannerEvents: CustomEvent[];
  let securityEvents: CustomEvent[];
  let bannerHandler: EventListener;
  let securityHandler: EventListener;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.spyOn(queryClient, "invalidateQueries").mockImplementation(async () => undefined);
    router = { push: vi.fn() };
    bannerEvents = [];
    securityEvents = [];
    bannerHandler = ((e: Event) => bannerEvents.push(e as CustomEvent)) as EventListener;
    securityHandler = ((e: Event) => securityEvents.push(e as CustomEvent)) as EventListener;
    window.addEventListener("app:banner", bannerHandler);
    window.addEventListener("auth:security-incident", securityHandler);
    vi.clearAllMocks();
  });
  afterEach(() => {
    window.removeEventListener("app:banner", bannerHandler);
    window.removeEventListener("auth:security-incident", securityHandler);
  });

  it("auth/refresh-replay → emits banner + security incident + redirect /login", () => {
    dispatchProblem(problem("urn:l157:auth/refresh-replay", { status: 401 }), {
      queryClient,
      router,
    });
    expect(router.push).toHaveBeenCalledWith("/login");
    expect(bannerEvents).toHaveLength(1);
    expect(bannerEvents[0]!.detail).toMatchObject({ severity: "error", persistent: true });
    expect(securityEvents).toHaveLength(1);
  });

  it("auth/refresh-expired → silent redirect, no banner", () => {
    dispatchProblem(problem("urn:l157:auth/refresh-expired", { status: 401 }), {
      queryClient,
      router,
    });
    expect(router.push).toHaveBeenCalledWith("/login");
    expect(bannerEvents).toHaveLength(0);
  });

  it("product/wrong-state → toast + invalidate product caches", () => {
    dispatchProblem(problem("urn:l157:product/wrong-state", { status: 409 }), {
      queryClient,
      router,
    });
    expect(toast.error).toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["product"] });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["admin", "products"] });
  });

  it("payout/wrong-state → toast + invalidate admin payouts", () => {
    dispatchProblem(problem("urn:l157:payout/wrong-state", { status: 409 }), {
      queryClient,
      router,
    });
    expect(toast.error).toHaveBeenCalled();
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["admin", "payouts"],
    });
  });

  it("order/idem-conflict → throws IdempotencyConflictError", () => {
    expect(() =>
      dispatchProblem(problem("urn:l157:order/idem-conflict", { status: 409 }), {
        queryClient,
        router,
      }),
    ).toThrow(IdempotencyConflictError);
  });

  it("rate-limit → reads Retry-After from response when provided", () => {
    const response = new Response(null, { status: 429, headers: { "Retry-After": "42" } });
    dispatchProblem(problem("urn:l157:rate-limit", { status: 429 }), {
      queryClient,
      router,
      response,
    });
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("42"));
  });

  it("rate-limit → defaults to 60 when response missing", () => {
    dispatchProblem(problem("urn:l157:rate-limit", { status: 429 }), {
      queryClient,
      router,
    });
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("60"));
  });

  it("default → falls back to problem.title", () => {
    dispatchProblem(problem("urn:l157:unknown", { title: "Boom" }), { queryClient, router });
    expect(toast.error).toHaveBeenCalledWith("Boom");
  });

  it("validation-error → silent (deferred to useAppForm/applyApiErrorToForm)", () => {
    dispatchProblem(problem("urn:l157:validation-error", { status: 400 }), {
      queryClient,
      router,
    });
    expect(toast.error).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("isProblemType narrows correctly", () => {
    const conflict = new IdempotencyConflictError(problem("urn:l157:order/idem-conflict"));
    expect(isProblemType(conflict, "urn:l157:order/idem-conflict")).toBe(true);
    expect(isProblemType(conflict, "urn:l157:payout/wrong-state")).toBe(false);
    expect(isProblemType("not-an-error", "urn:l157:order/idem-conflict")).toBe(false);
  });
});
