# План 3 — Hero-секції · футер · тон хедера

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Кожна ключова сторінка отримує власний hero (Головна — masthead+колаж, Каталог — повноширинне фото, Про проєкт — розворот-маніфест, нова сторінка Автори — стіна портретів); Колекції та Контакти — компактні заголовки-смуги; футер скорочується до однієї листівки; хедер над темним фото-hero фарбується кремовим.

**Architecture:** Тон хедера виноситься у чисту функцію `toneForPath(pathname)` — хедер сам визначає тон за маршрутом, сторінки нічого не «оголошують». Паралакс — окремий хук `useScrollParallax` у `shared/hooks`, що повертає `0` під `prefers-reduced-motion`. Hero кожної сторінки — окремий компонент у `views/<page>/ui/` (клієнтський острівець там, де є рух); самі екрани лишаються RSC, де були. Футер втрачає стан (collapsible) і стає server-компонентом.

**Tech Stack:** Next.js 14.2 (App Router) · TypeScript strict · Tailwind v3 + CSS-var токени · Vitest + Testing Library · ESLint FSD-boundaries.

---

## Контекст плану

Це **План 3 із 3** для спеки
`docs/superpowers/specs/2026-05-20-frontend-visual-rework-design.md`:

1. План 1 — каркас: токени скла, хедер, навігація, ритм секцій. **Готовий окремо.**
2. План 2 — кнопки + форми + екрани login/register. Спека §9–§12. **Готовий окремо.**
3. **План 3 (цей)** — 4 hero, смуги Колекції/Контакти, футер; тон хедера. Спека §7, §8, §4-тони.

**Залежності.** Спирається на каркас Плану 1: хедер уже має `data-floating`/`useHeaderState`,
`Section pad="page"`, `Stack gap="block"`, `EditorialPageShell`. Plan 3 не залежить від Плану 2.
**Спекою §7 передбачено hero для сторінки «Автори», якої не існує** — у цьому плані
**створюється** мінімальна сторінка `/authors/all` (узгоджено з користувачем). Це лагодить і
наявний 404 у навігації хедера/футера, що лінкує `/authors/all`.

## Конвенції

- **Коміти робить користувач** — задача завершується верифікацією. Після кожної зупинись.
- Тести: unit (`.test.ts`) → `tests/unit/**`, компонентні (`.test.tsx`) → `tests/component/**`.
- Тільки токенні класи — жодних hardcoded кольорів. Геометрія hero (`-mt-[124px]`, `h-[68vh]`)
  — це layout компонента, не дизайн-токени; лишається локально в hero-компонентах.
- **Hero-компоненти** живуть у `views/<page>/ui/` поряд з екраном; екран імпортує їх
  відносним `./` (дозволено — як `header.tsx` імпортує `./nav`). Клієнтський острівець
  (`"use client"`) — лише там, де рух (паралакс, проявлення); екрани лишаються RSC.
- **Імпорт хуків** — явним шляхом до файлу (`@/shared/hooks/use-scroll-parallax`), не через
  можливий barrel. Це не relative-parent, ESLint-boundaries дозволяє.
- Чисто візуальні зміни (тіні/скрим/анімація) не покриваються unit-тестами — верифікація =
  `typecheck + lint + build` + ручна перевірка в `pnpm dev`. Тести пишемо для логіки:
  `toneForPath` (unit), `useScrollParallax` (unit, reduced-motion гілка).
- Рух: усе нове під `prefers-reduced-motion` — миттєве. `useScrollParallax` повертає `0`;
  проявлення тексту має `motion-reduce:` override у фінальний стан. `stamp-drop` не чіпаємо.
- Спейсинг 1–12 у Tailwind перевизначено на `--s-*` (`p-8`=64px, `space-y-8`=64px,
  `space-y-12`=200px). Враховувати.
- **Повноширинні hero** (Каталог, Автори) «підлазять» під фіксований хедер: `main` має
  `pt-[100px] md:pt-[124px]` (`app/(public)/layout.tsx`), тож hero-обгортка скасовує його
  через `-mt-[100px] md:-mt-[124px]` і вертає внутрішнім `pt-[100px] md:pt-[124px]`.

## Структура файлів

| Файл | Відповідальність | Дія |
|---|---|---|
| `src/widgets/header/header-tone.ts` | `toneForPath()` — тон за маршрутом | Create |
| `src/widgets/header/header.tsx` | Застосувати тон до іконок/меню, прокинути в `Nav` | Modify |
| `src/widgets/header/nav.tsx` | Проп `tone`: кремові лінки/рамка на темному хедері | Modify |
| `src/shared/hooks/use-scroll-parallax.ts` | Хук скрол-паралаксу (0 під reduced-motion) | Create |
| `src/widgets/footer/footer.tsx` | Прибрати лицьову листівку + шов; одноблочний футер | Modify |
| `src/views/home/ui/home-hero.tsx` | Masthead + колаж як один hero, дрейф полароїдів | Create |
| `src/views/home/ui/home-screen.tsx` | Підключити `HomeHero`, прибрати ad-hoc спейсинг | Modify |
| `src/views/catalog/ui/catalog-hero.tsx` | Повноширинний фото-hero зі скримом + паралакс | Create |
| `src/views/catalog/ui/catalog-screen.tsx` | Підключити `CatalogHero`, прибрати старий hero | Modify |
| `src/views/about/ui/about-hero.tsx` | Розворот-маніфест: фото-половина + текст-заява | Create |
| `src/views/about/ui/about-screen.tsx` | Підключити `AboutHero`, прибрати старий hero | Modify |
| `src/views/collections/ui/collections-screen.tsx` | Замінити hero на заголовок-смугу | Modify |
| `src/views/contacts/ui/contacts-screen.tsx` | Замінити hero на заголовок-смугу | Modify |
| `src/views/authors-list/ui/authors-list-screen.tsx` | Нова сторінка «Автори»: стіна портретів | Create |
| `src/views/authors-list/index.ts` | Public-export view | Create |
| `src/app/(public)/authors/all/page.tsx` | Маршрут `/authors/all` | Create |
| `tests/unit/widgets/header/header-tone.test.ts` | Тест `toneForPath` | Create |
| `tests/unit/shared/hooks/use-scroll-parallax.test.ts` | Тест хука паралаксу | Create |

---

## Task 1: `toneForPath` — тон хедера за маршрутом

**Files:**
- Create: `src/widgets/header/header-tone.ts`
- Create (test): `tests/unit/widgets/header/header-tone.test.ts`

- [ ] **Step 1: Написати тест**

Створити `tests/unit/widgets/header/header-tone.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { toneForPath } from "@/widgets/header/header-tone";

describe("toneForPath", () => {
  it("returns dark for the catalog (full-bleed photo hero)", () => {
    expect(toneForPath("/catalog")).toBe("dark");
    expect(toneForPath("/catalog/anything")).toBe("dark");
  });

  it("returns dark for the authors listing (dark portrait wall)", () => {
    expect(toneForPath("/authors/all")).toBe("dark");
  });

  it("returns light for an individual author profile", () => {
    expect(toneForPath("/authors/student-olena")).toBe("light");
  });

  it("returns light for light-toned pages", () => {
    expect(toneForPath("/")).toBe("light");
    expect(toneForPath("/about")).toBe("light");
    expect(toneForPath("/collections")).toBe("light");
    expect(toneForPath("/contacts")).toBe("light");
  });
});
```

- [ ] **Step 2: Запустити тест — переконатися, що падає**

Run: `pnpm test tests/unit/widgets/header/header-tone.test.ts`
Expected: FAIL — модуль `@/widgets/header/header-tone` ще не існує.

- [ ] **Step 3: Створити `header-tone.ts`**

Створити `src/widgets/header/header-tone.ts`:

```ts
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
```

- [ ] **Step 4: Запустити тест — має пройти**

Run: `pnpm test tests/unit/widgets/header/header-tone.test.ts`
Expected: PASS — усі 4 тести зелені.

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

---

## Task 2: Прокинути тон у хедер і навігацію

**Files:**
- Modify: `src/widgets/header/nav.tsx`
- Modify: `src/widgets/header/header.tsx`

> У rest-стані (`floating === false`) на темних маршрутах лінки/іконки/рамка-індикатор
> стають кремовими. У floating-стані тон завжди світлий (хедер — світле скло).

- [ ] **Step 1: Додати проп `tone` у `Nav`**

Замінити **весь вміст** `src/widgets/header/nav.tsx` на:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib";

const items = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про проєкт" },
];

/** Лінка активна, якщо маршрут збігається з її верхнім сегментом. */
function isActive(pathname: string, href: string): boolean {
  const segment = "/" + href.split("/")[1];
  return pathname === segment || pathname.startsWith(segment + "/");
}

export function Nav({ tone = "light" }: { tone?: "light" | "dark" }) {
  const pathname = usePathname() ?? "/";
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);
  const dark = tone === "dark";

  const activeIndex = items.findIndex((it) => isActive(pathname, it.href));

  const moveTo = useCallback((index: number) => {
    const list = listRef.current;
    const link = linkRefs.current[index];
    if (!list || !link) return;
    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    setBox({ left: linkRect.left - listRect.left, width: linkRect.width });
  }, []);

  // Індикатор сідає на активну лінку; пересідає при зміні маршруту / ресайзі.
  useEffect(() => {
    if (activeIndex < 0) {
      setBox(null);
      return;
    }
    moveTo(activeIndex);
    const onResize = () => moveTo(activeIndex);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex, moveTo]);

  const settle = () => {
    if (activeIndex >= 0) moveTo(activeIndex);
  };

  return (
    <nav className="hidden md:block">
      <ul ref={listRef} onMouseLeave={settle} className="relative flex gap-2">
        <span
          aria-hidden
          data-nav-indicator="true"
          className={cn(
            "pointer-events-none absolute bottom-1 top-1 rounded-sm border-[1.5px]",
            dark ? "border-bg-warm" : "border-burgundy",
            "transition-[left,width,opacity] duration-d4 ease-paper motion-reduce:transition-none",
            box ? "opacity-100" : "opacity-0",
          )}
          style={box ? { left: box.left, width: box.width } : undefined}
        />
        {items.map((it, i) => (
          <li key={it.href}>
            <Link
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              href={it.href}
              onMouseEnter={() => moveTo(i)}
              className={cn(
                "relative z-10 block px-4 py-2 text-small font-bold uppercase tracking-[0.1em]",
                "transition-colors duration-d3 ease-paper",
                i === activeIndex
                  ? dark
                    ? "text-bg-warm"
                    : "text-burgundy"
                  : dark
                    ? "text-bg-warm/75 hover:text-bg-warm"
                    : "text-ink hover:text-burgundy",
              )}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Прокинути тон у `header.tsx` — імпорти**

У `src/widgets/header/header.tsx`, у блоці імпортів, після рядка
`import { cn } from "@/shared/lib";` додати:

```tsx
import { usePathname } from "next/navigation";
import { toneForPath } from "./header-tone";
```

- [ ] **Step 3: Обчислити `dark` у тілі `Header`**

У функції `Header()`, одразу після рядка
`const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);` додати:

```tsx
  const pathname = usePathname() ?? "/";
  // У rest-стані на темних маршрутах хедер «зливається» з фото-hero — кремові елементи.
  const dark = !floating && toneForPath(pathname) === "dark";
```

- [ ] **Step 4: Тонувати кнопку мобільного меню**

У `header.tsx` замінити `className` кнопки мобільного меню (рядок із
`className="-ml-2 p-2 text-ink transition-colors hover:text-burgundy md:hidden"`) на:

```tsx
            className={cn(
              "-ml-2 p-2 transition-colors md:hidden",
              dark ? "text-bg-warm hover:text-white" : "text-ink hover:text-burgundy",
            )}
```

- [ ] **Step 5: Прокинути тон у `Nav`**

У `header.tsx` замінити `<Nav />` на:

```tsx
          <Nav tone={dark ? "dark" : "light"} />
```

- [ ] **Step 6: Тонувати контейнер глобальних іконок**

У `header.tsx` замінити рядок
`<div className="flex items-center gap-4 text-ink md:gap-5">` на:

```tsx
          <div
            className={cn(
              "flex items-center gap-4 md:gap-5",
              dark ? "text-bg-warm" : "text-ink",
            )}
          >
```

(`Search`, `User`, `CartBadge` успадковують колір через `currentColor` — `CartBadge`
малює іконку без власного кольору, бейдж лишається `bg-burgundy text-white`.)

- [ ] **Step 7: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

Run: `pnpm test tests/component/widgets/nav.test.tsx`
Expected: PASS — наявний тест `Nav` зелений (`tone` має дефолт `"light"`, поведінка без пропа не змінилась).

Run: `pnpm build`
Expected: PASS.

> **Ручна перевірка:** на `/catalog` і `/authors/all` у стані rest (скрол угорі) лінки
> навігації та іконки — кремові; після скролу хедер стає світлим склом, лінки темніють.
> На `/`, `/about` лінки завжди темні.

---

## Task 3: Хук скрол-паралаксу

**Files:**
- Create: `src/shared/hooks/use-scroll-parallax.ts`
- Create (test): `tests/unit/shared/hooks/use-scroll-parallax.test.ts`

- [ ] **Step 1: Написати тест**

Створити `tests/unit/shared/hooks/use-scroll-parallax.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useScrollParallax } from "@/shared/hooks/use-scroll-parallax";

function stubMatchMedia(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe("useScrollParallax", () => {
  beforeEach(() => {
    window.scrollY = 0;
    vi.unstubAllGlobals();
  });

  it("returns 0 at the top of the page", () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useScrollParallax(0.2));
    expect(result.current).toBe(0);
  });

  it("stays 0 under prefers-reduced-motion", () => {
    stubMatchMedia(true);
    window.scrollY = 500;
    const { result } = renderHook(() => useScrollParallax(0.2));
    expect(result.current).toBe(0);
  });
});
```

- [ ] **Step 2: Запустити тест — переконатися, що падає**

Run: `pnpm test tests/unit/shared/hooks/use-scroll-parallax.test.ts`
Expected: FAIL — модуль `@/shared/hooks/use-scroll-parallax` ще не існує.

- [ ] **Step 3: Створити хук**

Створити `src/shared/hooks/use-scroll-parallax.ts`:

```ts
"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Зсув у px для паралакс-ефекту: повертає `window.scrollY * speed`,
 * оновлюється у `requestAnimationFrame`. Під `prefers-reduced-motion`
 * завжди повертає `0` (рух вимкнено).
 *
 * @param speed множник швидкості (0.15 = елемент рухається на 15% скролу).
 */
export function useScrollParallax(speed = 0.2): number {
  const [offset, setOffset] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onScroll = () => {
      if (frame.current != null) return;
      frame.current = requestAnimationFrame(() => {
        setOffset(window.scrollY * speed);
        frame.current = null;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [speed]);

  return offset;
}
```

- [ ] **Step 4: Запустити тест — має пройти**

Run: `pnpm test tests/unit/shared/hooks/use-scroll-parallax.test.ts`
Expected: PASS — обидва тести зелені.

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

---

## Task 4: Футер — прибрати лицьову листівку та шов

**Files:**
- Modify: `src/widgets/footer/footer.tsx`

> Лишаємо зворотну листівку (лист, підпис директорки, печатки, марка, адреси, соц-іконки)
> + смужку копірайту. Прибираємо: лицьову листівку (SVG-будівля + EST 1957), перфорацію-шов
> (32 «дірки»), розкривний toggle «обери розділ» (лінки стають завжди видимими), easter-egg
> «лизни марку», дубльований рядок копірайту. `mt-24 → mt-16`, водяний знак перепозиційовано.
> Стану більше немає — `Footer` стає server-компонентом (прибираємо `"use client"`).

- [ ] **Step 1: Переписати `footer.tsx`**

Замінити **весь вміст** `src/widgets/footer/footer.tsx` на:

```tsx
import Link from "next/link";
import { Container, PostageStamp, Stamp } from "@/shared/ui";

const footerNav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про проєкт" },
  { href: "/contacts", label: "Контакти" },
];

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-line bg-bg pb-0 pt-12">
      {/* Watermark "1 5 7" — центрований по висоті одноблочного футера */}
      <div className="text-burgundy/5 pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 -rotate-[4deg] select-none flex-col gap-6 font-display text-[160px] font-black leading-none lg:flex">
        <span>1</span>
        <span>5</span>
        <span>7</span>
      </div>

      {/* --- POSTCARD (зворотна сторона) --- */}
      <Container className="relative z-10 pb-12">
        <div className="border-line-strong/60 bg-bg-warm/70 relative mx-auto max-w-5xl overflow-hidden rounded-lg border-2 border-dashed p-6 shadow-paper md:p-8">
          <div className="absolute left-4 top-4 font-hand text-hand-s text-green opacity-60">
            зворотна сторона
          </div>

          <div className="relative grid grid-cols-1 gap-12 pt-6 lg:grid-cols-2">
            {/* Вертикальний шов для десктопу */}
            <div className="border-line-strong/60 absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 border-l-[1.5px] border-dashed lg:block" />

            {/* ЛІВА ПОЛОВИНА — рукописний лист */}
            <div className="space-y-5 pr-0 font-hand text-hand-s leading-relaxed text-ink lg:pr-8">
              <p className="text-[14px] text-ink-soft opacity-70">Київ · 20 травня 2026</p>
              <p className="-rotate-1 text-hand-m font-bold text-burgundy">Дорогий друже,</p>
              <p className="text-[18px]">
                ми пишемо тобі з Майстерні 157. Тут, на проспекті Оболонському,{" "}
                <span className="relative inline-block px-1">
                  1351 учень
                  <span className="bg-green/30 absolute bottom-[-1px] left-0 h-[3px] w-full rounded-full" />
                </span>{" "}
                щодня щось створює.
              </p>
              <p className="text-[18px]">
                Хтось пише вірші, хтось ліпить чашки, хтось знімає на плівку. Усе, що бачиш на
                цьому сайті —{" "}
                <span className="relative inline-block px-1">
                  насправді існує
                  <span className="bg-green/30 absolute bottom-[-1px] left-0 h-[3px] w-full rounded-full" />
                </span>
                . Можна прийти, поторкати, зустрітись із автором.
              </p>
              <p className="text-[18px]">Заходь, коли матимеш час. Завжди радо приймаємо.</p>
              <div className="pt-2">
                <span className="text-[18px]">З Любов&apos;ю —</span>
                <br />
                <span className="mt-1 block font-display text-[20px] font-bold italic text-burgundy">
                  команда Ліцею №157
                </span>
              </div>

              {/* Підпис директорки */}
              <div className="relative mt-8 w-60 pt-4">
                <div className="absolute left-6 top-[-10px] -rotate-2 select-none font-hand text-[28px] italic text-burgundy opacity-95">
                  О. Поляновська
                </div>
                <div className="bg-ink/40 h-[1px] w-full" />
                <div className="mt-1.5 font-body text-[11px] uppercase tracking-wider text-ink-soft">
                  Олена Поляновська, директорка ліцею
                </div>
              </div>

              {/* Навігація — завжди видима (replaces collapsible toggle) */}
              <nav className="border-line-strong/50 mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t-[1.5px] border-dashed pt-6">
                {footerNav.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ПРАВА ПОЛОВИНА — марка, печатки, адреси, соцмережі */}
            <div className="flex flex-col items-start gap-8 pl-0 lg:items-end lg:pl-8">
              <div className="relative flex w-full items-start justify-between gap-4">
                <div className="relative mt-4 flex select-none gap-2">
                  <Stamp
                    text="АРХІВ ЛІЦЕЮ 157"
                    shape="octagon"
                    rotation={-8}
                    size={84}
                    animateOn="scroll"
                    className="cursor-pointer text-burgundy opacity-90 transition-transform hover:scale-105"
                  />
                  <Stamp
                    text="ПЕРЕДАНО З ОБОЛОНІ"
                    shape="circle"
                    rotation={5}
                    size={80}
                    animateOn="scroll"
                    className="-ml-8 mt-4 cursor-pointer text-ink opacity-80 transition-transform hover:scale-105"
                  />
                </div>
                <PostageStamp className="-rotate-3 cursor-pointer shadow-photo transition-transform duration-d3 hover:-translate-y-1 hover:rotate-0" />
              </div>

              <div className="bg-line-strong/30 h-[1px] w-full" />

              {/* Адреси у стилі музейної підпис-картки */}
              <div className="flex w-full flex-col gap-6 text-left font-body lg:text-right">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-burgundy">
                    ПОЧАТКОВІ КЛАСИ
                  </span>
                  <p className="group mt-1 flex cursor-pointer items-center justify-start gap-1 text-sm font-semibold text-ink transition-colors hover:text-burgundy lg:justify-end">
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                    <span>пр. Володимира Івасюка, 23а</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-soft opacity-80">
                    +38 (044) 418-39-20 · +38 (044) 464-80-47
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-burgundy">
                    СТАРШІ КЛАСИ
                  </span>
                  <p className="group mt-1 flex cursor-pointer items-center justify-start gap-1 text-sm font-semibold text-ink transition-colors hover:text-burgundy lg:justify-end">
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                    <span>пр. Оболонський, 12в</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-soft opacity-80">
                    +38 (044) 418-75-08 · obolon_157@i.ua
                  </p>
                </div>
              </div>

              {/* Соцмережі */}
              <div className="mt-4 flex w-full flex-col items-start gap-3 lg:items-end">
                <span className="-rotate-1 font-hand text-hand-s text-green">знайди нас тут</span>
                <div className="flex gap-3">
                  {["facebook", "youtube", "instagram", "telegram"].map((soc) => (
                    <a
                      key={soc}
                      href={`https://${soc}.com`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-burgundy bg-transparent text-burgundy transition-all duration-d2 hover:-translate-y-1 hover:bg-burgundy hover:text-white hover:shadow-paper focus:outline-none"
                      aria-label={soc}
                    >
                      <SocialIcon name={soc} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* --- COPYRIGHT (один рядок) --- */}
      <div className="border-ink/10 relative z-10 mt-12 border-t bg-bg-noir py-6 text-white">
        <Container>
          <div className="text-bg-warm/85 flex flex-col items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] md:flex-row md:gap-3">
            <span className="font-body text-xs text-burgundy-soft">★</span>
            <span>© ЛІЦЕЙ 157 · ПЛАТФОРМА РОЗВИТКУ · 2026</span>
            <span className="hidden h-4 w-[1.5px] bg-white/20 md:block" />
            <span>ПЕЧАТКА №47/2026</span>
            <span className="font-body text-xs text-burgundy-soft">★</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "facebook":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z" />
          <polygon points="9.75 15.02 15.5 11.54 9.75 8.06 9.75 15.02" fill="currentColor" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case "telegram":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    default:
      return null;
  }
}
```

- [ ] **Step 2: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `useState`/`cn` більше не імпортуються; невикористаних імпортів немає;
`"use client"` прибрано (стану немає).

Run: `pnpm test tests/component`
Expected: PASS — наявні footer-тести (якщо є) зелені або потребують оновлення під новий
DOM; оновити асерти, що зверталися до прибраних блоків (лицьова листівка, toggle).

Run: `pnpm build`
Expected: PASS.

> **Ручна перевірка:** футер — одна листівка (зворотна сторона) + смужка копірайту; немає
> SVG-будівлі, шва з дірок, кнопки «обери розділ», конюшини «лизни марку»; навігаційні
> лінки видимі завжди; відступ зверху помітно менший.

---

## Task 5: Hero Головної — masthead + колаж

**Files:**
- Create: `src/views/home/ui/home-hero.tsx`
- Modify: `src/views/home/ui/home-screen.tsx`

> Masthead і колаж із 3 полароїдів зливаються в **один** hero-блок (розділювач між ними
> прибрано). Полароїди отримують легкий скрол-дрейф (паралакс). Заодно прибираємо ad-hoc
> спейсинг по `home-screen` (спека §6): `py-12` колажу зникає разом зі старим блоком,
> `space-y-12 py-8` дошки натхнення → `space-y-8`.

- [ ] **Step 1: Створити `home-hero.tsx`**

Створити `src/views/home/ui/home-hero.tsx`:

```tsx
"use client";
import { EditorialLabel, ImageSlot, Stamp } from "@/shared/ui";
import { getBlur } from "@/shared/lib";
import { useScrollParallax } from "@/shared/hooks/use-scroll-parallax";

const SIZES_POLAROID = "(min-width: 1024px) 320px, 256px";

/** Masthead + колаж полароїдів — єдиний hero-блок Головної. */
export function HomeHero({ total }: { total: number | null }) {
  const sy = useScrollParallax(1);

  return (
    <section aria-label="Hero Головної" className="space-y-8">
      {/* Masthead */}
      <header className="space-y-2">
        <EditorialLabel>ВИПУСК №47 · ТРАВЕНЬ 2026*</EditorialLabel>
        <h1 className="font-display text-mega italic text-burgundy">Майстерня 157</h1>
        <p className="max-w-prose text-lead text-ink-soft">
          Архів учнівських робіт Ліцею №157. Київ · Оболонь · з 1957 року.
        </p>
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
        {total != null && <p className="text-small text-ink-soft">Робіт у каталозі: {total}</p>}
      </header>

      {/* Колаж — 3 полароїди з легким скрол-дрейфом */}
      <div className="relative grid grid-cols-1 gap-8 overflow-hidden md:grid-cols-3 md:gap-4 md:overflow-visible lg:gap-8">
        <div className="z-10 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mt-12 md:rotate-[-3deg] md:justify-end">
          <div style={{ transform: `translateY(${sy * -0.06}px)` }}>
            <ImageSlot
              slot="home/hero/poster-1"
              src="/images/home/hero/poster-1.webp"
              ratio="3/4"
              variant="polaroid"
              caption="Учнівська робота — кераміка"
              className="w-52 sm:w-64 lg:w-72"
              priority
              sizes={SIZES_POLAROID}
              blurDataURL={getBlur("/images/home/hero/poster-1.webp")}
            />
          </div>
        </div>
        <div className="z-20 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mb-11 md:rotate-[2deg]">
          <div style={{ transform: `translateY(${sy * 0.04}px)` }}>
            <ImageSlot
              slot="home/hero/poster-2"
              src="/images/home/hero/poster-2.webp"
              ratio="3/4"
              variant="polaroid"
              caption="Учнівська робота — графіка"
              className="w-52 sm:w-64 lg:w-80"
              priority
              sizes={SIZES_POLAROID}
              blurDataURL={getBlur("/images/home/hero/poster-2.webp")}
            />
          </div>
        </div>
        <div className="z-10 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mt-20 md:rotate-[-5deg] md:justify-start">
          <div className="relative" style={{ transform: `translateY(${sy * -0.09}px)` }}>
            <ImageSlot
              slot="home/hero/poster-3"
              src="/images/home/hero/poster-3.webp"
              ratio="3/4"
              variant="polaroid"
              caption="Учнівська робота — текстиль"
              className="w-52 sm:w-64 lg:w-72"
              priority
              sizes={SIZES_POLAROID}
              blurDataURL={getBlur("/images/home/hero/poster-3.webp")}
            />
            <p className="absolute -bottom-8 -right-4 hidden rotate-[-8deg] font-hand text-hand-m text-green md:block lg:-right-12 lg:bottom-12">
              ← хіт виставки!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Підключити `HomeHero` у `home-screen.tsx`**

У `src/views/home/ui/home-screen.tsx`:

(a) Додати імпорт після рядка `import { getBlur } from "@/shared/lib";`:

```tsx
import { HomeHero } from "./home-hero";
```

(b) Замінити блок masthead + розділювач + колаж — тобто від `{/* BLOCK 1 — masthead */}`
(рядок 15) до закриваючого `</section>` колажу включно з `<EditorialDivider />` між ними
(рядки 15–79) — на один рядок:

```tsx
      <HomeHero total={initial?.totalElements ?? null} />
```

Тобто перший дочірній елемент `EditorialPageShell` стає `<HomeHero/>`, за ним одразу йде
наявний `<EditorialDivider />` (що був на рядку 81) і далі BLOCK 3 (маніфест).

- [ ] **Step 3: Прибрати ad-hoc спейсинг дошки натхнення**

У `home-screen.tsx` у секції BLOCK 7 замінити
`<section aria-label="Дошка натхнення" className="space-y-12 py-8">` на:

```tsx
      <section aria-label="Дошка натхнення" className="space-y-8">
```

(`space-y-12` = 200px і `py-8` = 64px — подвійний ритм поверх `Stack gap="block"`;
`space-y-8` = 64px лишає охайний внутрішній відступ між заголовком-рядком і колажем.)

- [ ] **Step 4: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `home-screen` лишається RSC; `HomeHero` — клієнтський острівець;
невикористаних імпортів немає (masthead-секція використовувала `EditorialLabel`/`Stamp`,
вони ще потрібні нижче у `home-screen` — імпорти не чіпати).

Run: `pnpm build`
Expected: PASS.

Run: `pnpm scan-images`
Expected: OK / warn — `home/hero/poster-*` мають `src`, тож sync-перевірку пропущено.

> **Ручна перевірка:** Головна — masthead і колаж читаються як один блок (без лінії між
> ними); при скролі полароїди ледь дрейфують з різною швидкістю; під `prefers-reduced-motion`
> дрейфу немає.

---

## Task 6: Hero Каталогу — повноширинне фото

**Files:**
- Create: `src/views/catalog/ui/catalog-hero.tsx`
- Modify: `src/views/catalog/ui/catalog-screen.tsx`

> Повноширинний документальний фото-hero зі скрим-градієнтом зліва, заголовком + ▌-міткою
> поверх, печаткою і музейною підпис-карткою. Підлазить під прозорий хедер (тон — темний,
> див. Task 1–2). Паралакс фону.

- [ ] **Step 1: Створити `catalog-hero.tsx`**

Створити `src/views/catalog/ui/catalog-hero.tsx`:

```tsx
"use client";
import { ImageSlot, Stamp } from "@/shared/ui";
import { useScrollParallax } from "@/shared/hooks/use-scroll-parallax";

/** Повноширинний фото-hero Каталогу — підлазить під прозорий хедер. */
export function CatalogHero() {
  const drift = useScrollParallax(0.15);

  return (
    <section
      aria-label="Каталог — hero"
      className="relative -mt-[100px] h-[68vh] min-h-[440px] w-full overflow-hidden bg-bg-noir md:-mt-[124px]"
    >
      {/* Документальне фото з паралакс-дрейфом */}
      <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${drift}px)` }}>
        <ImageSlot
          slot="catalog/hero/banner"
          src="/images/catalog/hero/banner.webp"
          ratio="21/9"
          variant="plain"
          caption="Документальне фото — каталог робіт"
          priority
          sizes="100vw"
          className="h-[80vh] min-h-[520px] w-full object-cover"
        />
      </div>

      {/* Скрим зліва — щоб текст читався */}
      <div className="from-bg-noir/85 via-bg-noir/45 absolute inset-0 bg-gradient-to-r to-transparent" />

      {/* Контент */}
      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-12 pt-[100px] md:px-12 md:pb-16 md:pt-[124px]">
        <p className="font-body text-small font-bold uppercase tracking-[0.2em] text-bg-warm/80">
          ▌ Том 47 · Травень 2026
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-mega italic leading-[1.05] text-bg-warm">
          Каталог робіт
        </h1>
        {/* Музейна підпис-картка */}
        <p className="border-bg-warm/30 text-bg-warm/85 mt-6 max-w-md border-l-2 pl-4 text-body">
          Оригінальні роботи учнів ліцею. Повний перелік наявних творів.
        </p>
      </div>

      {/* Печатка */}
      <div className="absolute right-6 top-[112px] z-10 md:right-12 md:top-[150px]">
        <Stamp text="MAYSTERNYA · KYIV" rotation={-10} animateOn="load" className="text-bg-warm" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Підключити `CatalogHero` у `catalog-screen.tsx`**

У `src/views/catalog/ui/catalog-screen.tsx`:

(a) Оновити імпорти. Після прибрання старого hero (наступний крок) `EditorialLabel` і `Stamp`
стають невикористані. Замінити рядок
`import { EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";` на:

```tsx
import { EditorialDivider, ImageSlot } from "@/shared/ui";
import { CatalogHero } from "./catalog-hero";
```

(b) Замінити старий hero — від `{/* Page hero */}` (рядок 14) до `<EditorialDivider />`
включно (рядок 35) — тобто прибрати `<section aria-label="Каталог hero" ...>...</section>`
**і** наступний за ним `<EditorialDivider />`.

(c) Обгорнути результат у фрагмент із `CatalogHero` перед `EditorialPageShell`. Початок
`return (` стає:

```tsx
  return (
    <>
      <CatalogHero />
      <EditorialPageShell>
        {/* Categories strip */}
        <section
          aria-label="Категорії"
          className="grid grid-cols-1 gap-8 py-8 md:grid-cols-12 md:gap-4 lg:gap-8"
        >
```

(d) Відповідно закрити фрагмент — наприкінці `return` замінити `</EditorialPageShell>`
на:

```tsx
      </EditorialPageShell>
    </>
  );
```

(Перша секція всередині `EditorialPageShell` тепер — «Категорії».)

- [ ] **Step 3: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `catalog-screen` лишається RSC; `CatalogHero` — клієнтський острівець.

Run: `pnpm build`
Expected: PASS.

Run: `pnpm scan-images`
Expected: OK / warn — `catalog/hero/banner` має `src`, sync пропущено.

> **Ручна перевірка:** `/catalog` — фото-hero на всю ширину одразу під хедером; хедер у
> rest-стані прозорий, лінки кремові (Task 2); при скролі фон ледь рухається; печатка
> «осідає» через `stamp-drop`. **Якщо файлу `public/images/catalog/hero/banner.webp` ще
> немає** — `next/image` покаже биту картинку; це контент-задача, поза цим планом.

---

## Task 7: Hero Про проєкт — розворот-маніфест

**Files:**
- Create: `src/views/about/ui/about-hero.tsx`
- Modify: `src/views/about/ui/about-screen.tsx`

> Замість центрованого тексту на темному фото — тихий розворот: Ч/Б фото на одній половині,
> текст-заява (▌-мітка + h1 + лід) на іншій. Текст проявляється при потраплянні у в'юпорт;
> під `prefers-reduced-motion` — одразу у фінальному стані.

- [ ] **Step 1: Створити `about-hero.tsx`**

Створити `src/views/about/ui/about-hero.tsx`:

```tsx
"use client";
import { useRef } from "react";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { useIntersection } from "@/shared/hooks/use-intersection";
import { cn } from "@/shared/lib";

/** Розворот-маніфест Про проєкт: Ч/Б фото + текст-заява, що проявляється. */
export function AboutHero() {
  const textRef = useRef<HTMLDivElement>(null);
  const shown = useIntersection(textRef, { threshold: 0.3, once: true });

  const revealClass = cn(
    "transition-all duration-d4 ease-paper",
    "motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:!transition-none",
    shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
  );

  return (
    <section
      aria-label="Про проєкт — hero"
      className="grid grid-cols-1 items-stretch md:grid-cols-2"
    >
      {/* Фото-половина */}
      <div className="relative min-h-[340px] bg-bg-noir md:min-h-[72vh]">
        <ImageSlot
          slot="about/hero/portrait"
          src="/images/about/hero/portrait.webp"
          ratio="3/4"
          variant="plain"
          caption="Архівне фото — фасад ліцею"
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover grayscale contrast-125"
        />
      </div>

      {/* Текст-половина */}
      <div
        ref={textRef}
        className="flex flex-col justify-center gap-6 bg-bg-warm px-5 py-16 md:px-12 md:py-0"
      >
        <div className={revealClass} style={{ transitionDelay: "0ms" }}>
          <EditorialLabel>▌ Редакторська колонка</EditorialLabel>
        </div>
        <h1
          className={cn(
            "font-display text-display italic leading-[1.1] text-burgundy",
            revealClass,
          )}
          style={{ transitionDelay: "120ms" }}
        >
          Це не магазин.
          <br />
          Це архів.
        </h1>
        <p
          className={cn("max-w-prose text-lead text-ink-soft", revealClass)}
          style={{ transitionDelay: "240ms" }}
        >
          Кожен учень приносить додому не оцінку, а слід — фізичний обʼєкт, зроблений руками.
          Цей архів — продовження тієї ж практики онлайн.
        </p>
      </div>
    </section>
  );
}
```

> Примітка: `transition-delay` задається через inline `style` — Tailwind JIT не генерує
> класи з шаблонних літералів, тож arbitrary-клас `[transition-delay:${n}ms]` не спрацював би.
> `motion-reduce:!*` — статичні класи, JIT їх бачить; вони переводять елемент у фінальний
> стан і вимикають transition під `prefers-reduced-motion`.

- [ ] **Step 2: Підключити `AboutHero` у `about-screen.tsx`**

У `src/views/about/ui/about-screen.tsx`:

(a) Замінити рядок імпорту
`import { Container, EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";`
на (прибрано `EditorialLabel` — він тепер лише в `AboutHero`; решта ще потрібна нижче):

```tsx
import { Container, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";
import { AboutHero } from "./about-hero";
```

(b) Замінити старий hero — увесь блок `{/* Full bleed hero section */}` від
`<section className="relative w-full overflow-hidden border-b border-line-strong bg-burgundy">`
до його закриваючого `</section>` (рядки 6–40) — на:

```tsx
      <AboutHero />
```

(Решта `about-screen` — `Container` з контентом — без змін.)

- [ ] **Step 3: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `EditorialLabel` більше не імпортується в `about-screen` (перенесено в
`AboutHero`); невикористаних імпортів немає.

Run: `pnpm build`
Expected: PASS.

> **Ручна перевірка:** `/about` — hero-розворот: зліва Ч/Б фото, справа на теплому тлі
> ▌-мітка + заголовок + лід, що проявляються каскадом при появі; під `prefers-reduced-motion`
> текст видно одразу без руху.

---

## Task 8: Колекції та Контакти — заголовки-смуги

**Files:**
- Modify: `src/views/collections/ui/collections-screen.tsx`
- Modify: `src/views/contacts/ui/contacts-screen.tsx`

> Ці сторінки не отримують великого hero — лише компактний охайний заголовок (▌-мітка +
> Fraunces-назва). Прибираємо `py-12` і велику плаваючу печатку.

- [ ] **Step 1: Колекції — замінити hero на заголовок**

У `src/views/collections/ui/collections-screen.tsx` замінити блок `{/* Hero */}` —
`<section className="relative py-12">...</section>` (рядки 50–61) — на:

```tsx
      {/* Заголовок-смуга */}
      <header>
        <EditorialLabel>▌ ТЕМАТИЧНІ СПЕЦВИПУСКИ</EditorialLabel>
        <h1 className="mt-3 font-display text-h1 italic leading-tight text-burgundy">Колекції</h1>
        <p className="mt-3 max-w-prose text-body text-ink-soft">
          Кураторські добірки робіт за темою, випуском чи сезоном — не просто список товарів,
          а спецвипуски архіву.
        </p>
      </header>
```

(`Stamp` ще використовується нижче — у декоративному футері секції; імпорт не чіпати.)

- [ ] **Step 2: Контакти — замінити hero на заголовок**

У `src/views/contacts/ui/contacts-screen.tsx` замінити блок `{/* Hero */}` —
`<section className="relative py-12">...</section>` (рядки 7–18) — на:

```tsx
      {/* Заголовок-смуга */}
      <header>
        <EditorialLabel>КОЛОФОН</EditorialLabel>
        <h1 className="mt-3 font-display text-h1 italic leading-tight text-burgundy">
          Як з нами зв&apos;язатись
        </h1>
      </header>
```

Після цієї заміни `Stamp` у `contacts-screen` більше не використовується — прибрати його
з рядка імпорту: `import { EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";`
→

```tsx
import { EditorialLabel, EditorialDivider, ImageSlot } from "@/shared/ui";
```

- [ ] **Step 3: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — у `contacts-screen` немає невикористаного `Stamp`; у `collections-screen`
`Stamp` лишається використаним.

Run: `pnpm build`
Expected: PASS.

> **Ручна перевірка:** `/collections` і `/contacts` — компактні заголовки одразу під хедером,
> без зайвої порожнечі та без великої печатки у куті.

---

## Task 9: Нова сторінка «Автори» (`/authors/all`)

**Files:**
- Create: `src/views/authors-list/ui/authors-list-screen.tsx`
- Create: `src/views/authors-list/index.ts`
- Create: `src/app/(public)/authors/all/page.tsx`

> Спека §7 проектує для «Авторів» hero — стіну Ч/Б портретів із бордовим блоком назви.
> Сторінки не існувало; створюємо мінімальну: hero-стіна + сітка карток авторів. Список
> авторів виводимо з `MOCK_PRODUCTS_CARDS` (унікальні за `studentId`) — як каталог, що
> має mock-фолбек. Маршрут `/authors/all` статичний — Next віддає перевагу йому над
> динамічним `/authors/[id]`, тож профілі авторів не ламаються.

- [ ] **Step 1: Створити екран `authors-list-screen.tsx`**

Створити `src/views/authors-list/ui/authors-list-screen.tsx`:

```tsx
import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { MOCK_PRODUCTS_CARDS } from "@/shared/api/mock-products";

type Author = { studentId: string; firstName: string; grade: string };

/** Унікальні автори, виведені з карток робіт. */
function uniqueAuthors(): Author[] {
  const map = new Map<string, Author>();
  for (const p of MOCK_PRODUCTS_CARDS) {
    const a = p.author;
    if (a?.studentId && !map.has(a.studentId)) {
      map.set(a.studentId, {
        studentId: a.studentId,
        firstName: a.firstName ?? "Учень",
        grade: a.grade ?? "",
      });
    }
  }
  return [...map.values()];
}

export function AuthorsListScreen() {
  const authors = uniqueAuthors();
  // Стіна-hero завжди має 12 кліток — повторюємо авторів по колу.
  const wall = Array.from({ length: 12 }, (_, i) => authors[i % authors.length]!);

  return (
    <>
      {/* Hero — стіна Ч/Б портретів + бордовий блок назви */}
      <section
        aria-label="Автори — hero"
        className="relative -mt-[100px] w-full overflow-hidden bg-bg-noir md:-mt-[124px]"
      >
        <div className="grid grid-cols-3 gap-0 pt-[100px] opacity-65 md:grid-cols-6 md:pt-[124px]">
          {wall.map((a, i) => (
            <ImageSlot
              key={`${a.studentId}-${i}`}
              slot={`authors/${a.studentId}/face`}
              ratio="1/1"
              variant="plain"
              caption={`Портрет — ${a.firstName}`}
              className="h-full w-full object-cover grayscale contrast-125"
            />
          ))}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-burgundy px-8 py-6 shadow-deep md:px-12 md:py-8">
            <h1 className="font-display text-mega italic leading-none text-bg-warm">Автори</h1>
          </div>
        </div>
      </section>

      <EditorialPageShell>
        <header>
          <EditorialLabel>▌ Учні художнього класу</EditorialLabel>
          <p className="mt-3 max-w-prose text-body text-ink-soft">
            Кожна робота в архіві Майстерні 157 належить конкретному учневі Ліцею №157.
            Оберіть автора, щоб побачити його роботи.
          </p>
        </header>

        <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {authors.map((a) => (
            <li key={a.studentId}>
              <Link href={`/authors/${a.studentId}`} className="group block">
                <ImageSlot
                  slot={`authors/${a.studentId}/card`}
                  ratio="1/1"
                  variant="photo-print"
                  caption={`Портрет — ${a.firstName}`}
                  className="grayscale transition-all duration-d3 ease-paper group-hover:grayscale-0"
                />
                <p className="mt-3 font-display text-h3 italic text-ink">{a.firstName}</p>
                <p className="font-body text-small uppercase tracking-wider text-ink-soft">
                  {a.grade}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </EditorialPageShell>
    </>
  );
}
```

- [ ] **Step 2: Створити public-export view**

Створити `src/views/authors-list/index.ts`:

```ts
export { AuthorsListScreen } from "./ui/authors-list-screen";
```

- [ ] **Step 3: Створити маршрут `/authors/all`**

Створити `src/app/(public)/authors/all/page.tsx`:

```tsx
import type { Metadata } from "next";
import { AuthorsListScreen } from "@/views/authors-list";

export const metadata: Metadata = {
  title: "Автори — учні художнього класу Ліцею №157",
  description:
    "Учні Ліцею №157 у Києві, чиї роботи зберігаються в архіві Майстерні 157: кераміка, графіка, текстиль, живопис.",
  alternates: { canonical: "/authors/all" },
  openGraph: {
    title: "Автори · Майстерня 157",
    description: "Учні художнього класу Ліцею №157, Київ.",
    url: "/authors/all",
  },
};

export const revalidate = 600;

export default function Page() {
  return <AuthorsListScreen />;
}
```

- [ ] **Step 4: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `views/authors-list` імпортує лише `@/widgets/*` та `@/shared/*`
(межі FSD: view → widget/shared — дозволено).

Run: `pnpm build`
Expected: PASS — маршрут `/authors/all` збирається; `/authors/[id]` лишається робочим.

Run: `pnpm scan-images`
Expected: OK / warn — слоти `authors/<id>/face` і `authors/<id>/card` — placeholder-режим
(без `src`); `картинки.md` відсутня, тож sync пропущено.

> **Ручна перевірка:** `/authors/all` відкривається (більше не 404); лінк «Автори» у хедері
> та футері веде сюди; хедер у rest-стані темний → кремові лінки (Task 1–2); кожна картка
> веде на `/authors/<studentId>`. Портрети — placeholder-боксы, доки немає реальних фото.

---

## Фінальна верифікація

Прогнати композит у `lyceum-157-frontend`:

```bash
pnpm verify   # typecheck + lint + test + scan-images + build + e2e @smoke
```

Окремо стежити:

- `pnpm scan-images` — нові `ImageSlot` із `src` (hero Каталогу/Головної/Про проєкт) sync
  не потребують; слоти Авторів — placeholder, `картинки.md` відсутня → скрипт виходить `0`.
- Playwright smoke (`paper-noise`, `stamp drop`, role-redirects, form-ux) — лишається зеленим.
  Якщо smoke перевіряв футер чи навігацію — оновити селектори під новий DOM.
- Контраст: кремові лінки хедера на темних hero ≥ 4.5:1; текст на скримі Каталогу ≥ 4.5:1.
- Ручний обхід: `/`, `/catalog`, `/about`, `/collections`, `/contacts`, `/authors/all` —
  обидва стани хедера, паралакс, проявлення; усе під `prefers-reduced-motion` — миттєве/вимкнене.

## Завершення серії

Після Плану 3 спека `2026-05-20-frontend-visual-rework-design.md` реалізована повністю
(§4–§16). Якщо змін у BE-контракті не було — `api.json` і `BACKEND-CHANGES.md` чіпати не
треба. Реальні фото для нових hero (`catalog/hero/banner`, `authors/*`) — окрема
контент-задача поза цією серією планів.
