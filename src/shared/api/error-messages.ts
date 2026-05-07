import type { ApiError } from "./errors";
import type { ProblemDetail } from "./types";

const messages: Record<number, (p: ProblemDetail) => string> = {
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

export const messageFor = (e: ApiError): string =>
  messages[e.problem.status]?.(e.problem) ?? e.problem.title;
