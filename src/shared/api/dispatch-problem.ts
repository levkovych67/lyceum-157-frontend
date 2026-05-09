"use client";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/ui";
import { revalidateOnClient } from "./revalidate";
import type { ProblemDetail } from "./types";

export class IdempotencyConflictError extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.title || "Idempotency conflict");
    this.name = "IdempotencyConflictError";
  }
}

export type DispatchContext = {
  queryClient: QueryClient;
  router: { push: (path: string) => void };
  response?: Response;
};

export type ProblemBannerEvent = {
  severity: "error" | "warning" | "info";
  title: string;
  body?: string;
  persistent?: boolean;
};

const SECURITY_INCIDENT_EVENT = "auth:security-incident";
const BANNER_EVENT = "app:banner";

function emit<T>(name: string, detail: T): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function dispatchProblem(problem: ProblemDetail, ctx: DispatchContext): void {
  const { queryClient, router, response } = ctx;
  switch (problem.type) {
    // === Auth ===
    case "urn:l157:auth/invalid-credentials":
      toast.error("Невірний email або пароль");
      return;

    case "urn:l157:auth/refresh-expired":
      router.push("/login");
      return;

    case "urn:l157:auth/refresh-replay":
      emit<ProblemBannerEvent>(BANNER_EVENT, {
        severity: "error",
        title: "Виявлено підозрілу активність",
        body: "Усі сесії скинуто. Будь ласка, увійдіть заново.",
        persistent: true,
      });
      emit(SECURITY_INCIDENT_EVENT, { kind: "refresh-replay" });
      router.push("/login");
      return;

    case "urn:l157:auth/email-taken":
      toast.error("Цей email уже зареєстрований");
      return;

    case "urn:l157:admin/totp-invalid":
      toast.error("Невірний код 2FA");
      return;

    // === Catalog / Product ===
    case "urn:l157:product/kyc-required":
      toast.error("Спочатку завершіть KYC");
      return;

    case "urn:l157:product/images-required":
      toast.error("Додайте хоча б одне зображення");
      return;

    case "urn:l157:product/wrong-state": {
      toast.error("Цю дію не можна виконати у поточному статусі товару");
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      return;
    }

    // === Order / Idempotency ===
    case "urn:l157:order/out-of-stock": {
      const stock = problem.invalidParams?.[0] as
        | (Record<string, string> & { available?: string })
        | undefined;
      const available = stock?.available ?? "0";
      toast.error(`Товар закінчився (доступно: ${available})`);
      return;
    }

    case "urn:l157:order/idem-conflict":
      throw new IdempotencyConflictError(problem);

    case "urn:l157:order/refund-conflict":
      toast.error("Виплата вже виконана — refund неможливий");
      return;

    // === Payout ===
    case "urn:l157:payout/wrong-state":
      toast.error("Виплата вже не у потрібному статусі");
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
      return;

    // === KYC ===
    case "urn:l157:kyc/token-invalid":
      router.push("/kyc/error?reason=invalid");
      return;
    case "urn:l157:kyc/token-consumed":
      router.push("/kyc/error?reason=consumed");
      return;

    // === Image ===
    case "urn:l157:image/mime-mismatch":
      toast.error("Файл не є справжнім зображенням");
      return;

    // === Captcha ===
    case "urn:l157:captcha/rejected":
      toast.error("Підозріла активність. Оновіть сторінку та спробуйте ще раз.");
      return;

    // === Rate-limit ===
    case "urn:l157:rate-limit": {
      const retryAfter = response ? Number(response.headers.get("Retry-After") ?? 60) : 60;
      toast.error(`Забагато спроб з вашої мережі. Зачекайте до ${retryAfter} с.`);
      return;
    }

    // === Generic state-machine fallback ===
    case "urn:l157:state/wrong-state":
      toast.error("Дія недоступна у поточному стані");
      queryClient.invalidateQueries();
      return;

    // === Validation: dispatcher не дублює useAppForm/applyApiErrorToForm — мовчимо ===
    case "urn:l157:validation-error":
      return;

    default:
      toast.error(problem.title || "Сталася помилка");
      return;
  }
}

export function isProblemType<T extends string>(
  err: unknown,
  type: T,
): err is Error & { problem: ProblemDetail & { type: T } } {
  return (
    typeof err === "object" &&
    err !== null &&
    "problem" in err &&
    (err as { problem: ProblemDetail }).problem.type === type
  );
}

export const SECURITY_INCIDENT_EVENT_NAME = SECURITY_INCIDENT_EVENT;
export const BANNER_EVENT_NAME = BANNER_EVENT;
