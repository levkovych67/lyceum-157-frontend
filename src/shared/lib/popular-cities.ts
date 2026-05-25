// src/shared/lib/popular-cities.ts
// Список показується у focus-dropdown picker'а коли користувач ще не друкував
// (cityQuery.length < 2). Клік резолвить Ref через cities API (перший результат).
export const POPULAR_CITIES = [
  "Київ",
  "Львів",
  "Одеса",
  "Харків",
  "Дніпро",
  "Запоріжжя",
  "Вінниця",
  "Полтава",
] as const;

export type PopularCity = (typeof POPULAR_CITIES)[number];
