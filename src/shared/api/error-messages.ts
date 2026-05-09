import type { ApiError } from "./errors";
import type { ProblemDetail } from "./types";

const byType: Record<string, (p: ProblemDetail) => string> = {
  "urn:l157:auth/invalid-credentials": () => "Невірний email або пароль",
  "urn:l157:auth/refresh-expired": () => "Сесія завершена. Увійдіть знову.",
  "urn:l157:auth/refresh-replay": () => "Виявлено підозрілу активність. Увійдіть заново.",
  "urn:l157:auth/email-taken": () => "Цей email уже зареєстрований",
  "urn:l157:admin/totp-invalid": () => "Невірний код 2FA",
  "urn:l157:product/kyc-required": () => "Спочатку завершіть KYC",
  "urn:l157:product/images-required": () => "Додайте хоча б одне зображення",
  "urn:l157:product/wrong-state": () => "Цю дію не можна виконати у поточному статусі товару",
  "urn:l157:payout/wrong-state": () => "Виплата вже не у потрібному статусі",
  "urn:l157:order/out-of-stock": (p) => {
    const stock = p.invalidParams?.[0] as
      | (Record<string, string> & { available?: string })
      | undefined;
    return `Товар закінчився (доступно: ${stock?.available ?? 0})`;
  },
  "urn:l157:order/idem-conflict": () => "Конфлікт ідемпотентності — спробуйте ще раз",
  "urn:l157:order/refund-conflict": () => "Виплата вже виконана — refund неможливий",
  "urn:l157:image/mime-mismatch": () => "Файл не є справжнім зображенням",
  "urn:l157:captcha/rejected": () => "Підозріла активність. Оновіть сторінку.",
  "urn:l157:rate-limit": () => "Забагато спроб. Зачекайте хвилину.",
  "urn:l157:state/wrong-state": () => "Дія недоступна у поточному стані",
};

const byStatus: Record<number, (p: ProblemDetail) => string> = {
  400: (p) =>
    p.invalidParams?.length
      ? `Перевірте поля: ${p.invalidParams.map((x) => x.field).join(", ")}`
      : p.detail || "Помилка валідації даних",
  401: () => "Сесія завершена. Увійдіть знову.",
  403: () => "Немає прав на цю дію.",
  404: () => "Не знайдено.",
  409: (p) => p.detail || "Конфлікт стану. Перезавантажте сторінку.",
  415: () => "Формат файлу не відповідає типу. Виберіть jpeg/png/webp.",
  503: () => "Сервер тимчасово недоступний. Спробуйте за хвилину.",
};

export const messageFor = (e: ApiError): string => {
  const byT = byType[e.problem.type]?.(e.problem);
  if (byT) return byT;
  return byStatus[e.problem.status]?.(e.problem) ?? e.problem.title;
};
