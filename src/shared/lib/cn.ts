import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Проєкт має повністю кастомну шкалу `fontSize` у `tailwind.config.ts`
 * (`text-mega`, `text-h1`, `text-small`, `text-hand-m` …). Без реєстрації
 * tailwind-merge не розпізнає їх як розміри й плутає з `text-{color}` —
 * у підсумку викидає колір (напр. `text-white` на кнопці). Реєструємо їх
 * у класовій групі `font-size`, щоб розмір і колір не конфліктували.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "mega",
            "display",
            "h1",
            "h2",
            "h3",
            "quote",
            "lead",
            "body",
            "small",
            "label",
            "hand-s",
            "hand-m",
            "hand-l",
          ],
        },
      ],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
