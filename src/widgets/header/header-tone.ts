export type HeaderTone = "light" | "dark";

/**
 * Маршрути з темним фото-hero. У rest-стані (хедер прозорий) лінки та іконки
 * на цих сторінках фарбуються кремовим. У floating-стані тон ігнорується —
 * хедер завжди світле скло.
 */
const DARK_TONE_PATHS = ["/catalog", "/authors/all"];

/** Тон хедера для заданого маршруту. */
export function toneForPath(pathname: string): HeaderTone {
  const dark = DARK_TONE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  return dark ? "dark" : "light";
}
