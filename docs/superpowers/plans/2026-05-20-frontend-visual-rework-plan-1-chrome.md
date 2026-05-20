# План 1 — Каркас: хедер · навігація · ритм секцій

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Хедер отримує два стани (прозорий угорі / матове скло при скролі), навігація — ковзний індикатор-рамку замість підкреслення, а вертикальний ритм сторінок стає послідовним.

**Architecture:** Скрол-логіка хедера виноситься в тестований хук `useHeaderState`. Хедер стає stateless щодо скролу — лише застосовує класи за `floating`. Навігація рендерить один абсолютний індикатор-рамку, що позиціонується по `getBoundingClientRect` активної/наведеної лінки. Ритм задається спільними компонентами (`Section`, `Stack`, `EditorialDivider`, `EditorialPageShell`) — фікс автоматично розкочується на всі сторінки.

**Tech Stack:** Next.js 14.2 (App Router) · TypeScript strict · Tailwind v3 + CSS-var токени · Vitest + Testing Library · ESLint FSD-boundaries.

---

## Контекст плану

Це **План 1 із 3** для спеки
`docs/superpowers/specs/2026-05-20-frontend-visual-rework-design.md`:

1. **План 1 (цей)** — каркас: токени скла, хедер, навігація, ритм секцій. Спека §4 (частково — без тонів hero), §5, §6, §12 (header-glass).
2. План 2 — кнопки + форми + екрани login/register. Спека §9, §10, §11, §12 (`--sh-press`).
3. План 3 — 4 hero, смуги Колекції/Контакти, футер; тон хедера над темним hero. Спека §7, §8 + §4-тони.

**Тон хедера над темним hero** (спека §4) свідомо відкладено в План 3 — він має сенс лише разом із темними фото-hero. У Плані 1 хедер завжди у «світлому» трактуванні (лінки `ink`).

## Конвенції

- **Коміти робить користувач** — у задачах кроку `git commit` немає; задача завершується верифікацією. Після кожної задачі зупинись, дай користувачу переглянути й закомітити.
- Тести: unit (`.test.ts`) → `tests/unit/**`, компонентні (`.test.tsx`) → `tests/component/**` (так налаштовано `vitest.config.ts` `include`).
- Тільки токенні класи — жодних hardcoded кольорів/розмірів (виняток — наявні в коді `text-[10px]` у мобільному drawer, їх не чіпаємо).
- Спейсинг 1–12 у Tailwind **перевизначено** на `--s-*` (`p-6`=32px, `p-7`=48px, `p-8`=64px, `p-9`=96px). Враховувати це.
- Чисто візуальні зміни (точні тіні/блюр/анімація) не покриваються unit-тестами — для них верифікація = `typecheck + lint + build` + ручна перевірка в `pnpm dev`. Тести пишемо там, де є логіка (хук, активний стан навігації, класи ритму).

## Структура файлів

| Файл | Відповідальність | Дія |
|---|---|---|
| `src/_app/styles/tokens.css` | CSS-токен фону скла хедера | Modify |
| `tailwind.config.ts` | Реєстрація кольору `glass` | Modify |
| `src/widgets/header/use-header-state.ts` | Хук: scrollY → `floating` | Create |
| `src/widgets/header/header.tsx` | Хедер: 2 стани | Modify |
| `src/widgets/header/nav.tsx` | Навігація: ковзний індикатор-рамка | Modify |
| `src/shared/ui/layout/section.tsx` | Новий `pad="page"` | Modify |
| `src/shared/ui/layout/stack.tsx` | Новий `gap="block"` (responsive) | Modify |
| `src/shared/ui/editorial-divider/editorial-divider.tsx` | Прибрати власні верт. відступи | Modify |
| `src/widgets/editorial-page-shell/editorial-page-shell.tsx` | Застосувати `pad="page"` + `gap="block"` | Modify |
| `tests/unit/widgets/header/use-header-state.test.ts` | Тест хука | Create |
| `tests/component/widgets/nav.test.tsx` | Тест навігації | Create |
| `tests/component/atoms/layout-rhythm.test.tsx` | Тести `Section`/`Stack` | Create |
| `tests/component/atoms/editorial-divider.test.tsx` | Тест розділювача | Create |

---

## Task 1: Токен фону скла хедера

**Files:**
- Modify: `src/_app/styles/tokens.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Додати CSS-токен у `tokens.css`**

У `src/_app/styles/tokens.css`, одразу після рядка `--sh-deep: 0 32px 64px rgba(0, 0, 0, 0.24);` і перед коментарем `/* Easings */`, додати:

```css

  /* Header — фон матового скла у floating-стані (sticky) */
  --header-glass-bg: rgba(250, 250, 247, 0.72);
```

- [ ] **Step 2: Зареєструвати колір `glass` у Tailwind**

У `tailwind.config.ts`, у `theme.extend.colors`, одразу після рядка `error: "var(--c-error)",` додати:

```ts
        glass: "var(--header-glass-bg)",
```

- [ ] **Step 3: Перевірити збірку**

Run: `pnpm build`
Expected: збірка успішна, без помилок. Клас `bg-glass` стане доступним.

---

## Task 2: Хук `useHeaderState`

**Files:**
- Create: `src/widgets/header/use-header-state.ts`
- Test: `tests/unit/widgets/header/use-header-state.test.ts`

- [ ] **Step 1: Написати тест**

Створити `tests/unit/widgets/header/use-header-state.test.ts`:

```ts
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useHeaderState } from "@/widgets/header/use-header-state";

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, writable: true, configurable: true });
  window.dispatchEvent(new Event("scroll"));
}

describe("useHeaderState", () => {
  afterEach(() => scrollTo(0));

  it("не floating на самому верху сторінки", () => {
    scrollTo(0);
    const { result } = renderHook(() => useHeaderState());
    expect(result.current.floating).toBe(false);
  });

  it("стає floating після прокручування за поріг", () => {
    const { result } = renderHook(() => useHeaderState());
    act(() => scrollTo(40));
    expect(result.current.floating).toBe(true);
  });

  it("повертається в non-floating при поверненні на верх", () => {
    const { result } = renderHook(() => useHeaderState());
    act(() => scrollTo(40));
    act(() => scrollTo(0));
    expect(result.current.floating).toBe(false);
  });
});
```

- [ ] **Step 2: Запустити тест — має впасти**

Run: `pnpm test tests/unit/widgets/header/use-header-state.test.ts`
Expected: FAIL — `Failed to resolve import "@/widgets/header/use-header-state"`.

- [ ] **Step 3: Реалізувати хук**

Створити `src/widgets/header/use-header-state.ts`:

```ts
import { useEffect, useState } from "react";

/** Поріг скролу (px), за яким хедер переходить у floating-стан (матове скло). */
const FLOATING_THRESHOLD = 8;

/**
 * Слідкує, чи прокручено сторінку за {@link FLOATING_THRESHOLD}.
 * `floating` керує скляним/компактним трактуванням хедера.
 */
export function useHeaderState() {
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > FLOATING_THRESHOLD);
    onScroll(); // синхронізація на маунті (напр. відновлена позиція скролу)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { floating };
}
```

- [ ] **Step 4: Запустити тест — має пройти**

Run: `pnpm test tests/unit/widgets/header/use-header-state.test.ts`
Expected: PASS — 3 тести зелені.

---

## Task 3: Хедер — два стани

**Files:**
- Modify: `src/widgets/header/header.tsx`

- [ ] **Step 1: Переписати `header.tsx`**

Замінити весь вміст `src/widgets/header/header.tsx` на:

```tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, User, Menu, X } from "lucide-react";
import { TopBar } from "./top-bar";
import { Nav } from "./nav";
import { CartBadge } from "./cart-badge";
import { useHeaderState } from "./use-header-state";
import { Container, Stamp } from "@/shared/ui";
import { cn } from "@/shared/lib";

const navItems = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про проєкт" },
];

export function Header() {
  const { floating } = useHeaderState();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      data-floating={floating}
      className={cn(
        "fixed left-0 right-0 top-0 z-30 border-b transition-all duration-d3 ease-paper",
        floating
          ? "h-16 border-line bg-glass shadow-paper backdrop-blur-md"
          : "h-[88px] border-transparent bg-transparent md:h-[124px]",
      )}
    >
      <div
        className={cn(
          "overflow-hidden transition-all duration-d3 ease-paper",
          floating ? "h-0 opacity-0" : "h-9 opacity-100",
        )}
      >
        <TopBar />
      </div>
      <Container>
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-d3 ease-paper",
            floating ? "h-16" : "h-[88px]",
          )}
        >
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="-ml-2 p-2 text-ink transition-colors hover:text-burgundy md:hidden"
            aria-label="Відкрити меню"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Logo - Centered on mobile, Left-aligned on desktop */}
          <Link
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center transition-all duration-d3 ease-paper md:static md:translate-x-0"
          >
            <Image
              src="/logo.webp"
              alt="Майстерня 157"
              width={80}
              height={80}
              priority
              className={cn(
                "object-contain transition-all duration-d3 ease-paper",
                floating ? "h-10 w-10 md:h-12 md:w-12" : "h-16 w-16 md:h-20 md:w-20",
              )}
            />
          </Link>

          {/* Desktop Nav */}
          <Nav />

          {/* Global Icons */}
          <div className="flex items-center gap-4 text-ink md:gap-5">
            <Search
              size={20}
              strokeWidth={1.5}
              className="hidden cursor-pointer transition-colors hover:text-burgundy sm:block"
              aria-label="Пошук"
            />
            <Link
              href="/account"
              className="hidden transition-colors hover:text-burgundy sm:block"
              aria-label="Кабінет"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
            <CartBadge />
          </div>
        </div>
      </Container>

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-d3"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 flex w-full max-w-[300px] flex-col justify-between border-r border-line bg-bg p-6 shadow-deep transition-transform duration-d3 ease-paper",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex flex-col">
                  <span className="font-hand text-hand-m -rotate-2 text-green">зміст випуску</span>
                  <span className="font-body text-[10px] uppercase tracking-widest text-ink-fade">
                    Архів 157
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full p-2 text-ink transition-colors hover:bg-line"
                  aria-label="Закрити меню"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="mt-8">
                <ul className="flex flex-col gap-6">
                  {navItems.map((it) => (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="font-display text-h2 italic text-burgundy transition-colors hover:text-green"
                      >
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Drawer Footer with Stamp decoration */}
            <div className="flex flex-col items-center gap-4 border-t border-line pt-6">
              <Stamp
                text="1957"
                shape="octagon"
                rotation={-5}
                size={64}
                animateOn="none"
                smudge={true}
                className="text-burgundy/20"
              />
              <p className="text-center font-body text-[10px] uppercase tracking-[0.15em] text-ink-fade">
                ВИПУСК №47 · ТРАВЕНЬ 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
```

Зміни проти оригіналу: скрол-логіка → `useHeaderState`; `collapsed` → `floating`; `data-collapsed` → `data-floating`; rest-стан тепер `bg-transparent border-transparent` (без блюру/тіні), floating — `bg-glass backdrop-blur-md border-line shadow-paper`; додано `priority` логотипу. Решта (мобільний drawer тощо) — без змін.

- [ ] **Step 2: Типи й лінт**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS, без помилок і warning.

- [ ] **Step 3: Збірка**

Run: `pnpm build`
Expected: збірка успішна.

- [ ] **Step 4: Ручна перевірка**

Run: `pnpm dev`, відкрити `http://localhost:3000`.
Expected:
- Угорі сторінки хедер **прозорий** — без рамки й тіні, топ-бар видимий, лінки/логотип на місці.
- Прокрутка вниз (>8px) → хедер стає **матовим склом**: напівпрозорий молочний фон + блюр + hairline-рамка знизу + мʼяка тінь; топ-бар згортається; логотип меншає.
- Повернення вгору → плавно назад у прозорий стан.

---

## Task 4: Навігація — ковзний індикатор-рамка

**Files:**
- Modify: `src/widgets/header/nav.tsx`
- Test: `tests/component/widgets/nav.test.tsx`

- [ ] **Step 1: Написати тест**

Створити `tests/component/widgets/nav.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "@/widgets/header/nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/catalog" }));

describe("Nav", () => {
  it("рендерить чотири головні лінки навігації", () => {
    render(<Nav />);
    for (const label of ["Каталог", "Автори", "Колекції", "Про проєкт"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("позначає лінку поточного маршруту як активну", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Каталог" }).className).toMatch(/text-burgundy/);
  });

  it("рендерить рухомий індикатор-рамку", () => {
    const { container } = render(<Nav />);
    const indicator = container.querySelector('[data-nav-indicator="true"]');
    expect(indicator).not.toBeNull();
    expect(indicator?.className).toMatch(/border-burgundy/);
  });
});
```

- [ ] **Step 2: Запустити тест — має впасти**

Run: `pnpm test tests/component/widgets/nav.test.tsx`
Expected: FAIL — стара навігація не має лінки «Про проєкт» (має «Про»), не позначає активну лінку й не має `data-nav-indicator`.

- [ ] **Step 3: Переписати `nav.tsx`**

Замінити весь вміст `src/widgets/header/nav.tsx` на:

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

export function Nav() {
  const pathname = usePathname() ?? "/";
  const listRef = useRef<HTMLUListElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);

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
            "pointer-events-none absolute bottom-1 top-1 rounded-sm border-[1.5px] border-burgundy",
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
                i === activeIndex ? "text-burgundy" : "text-ink hover:text-burgundy",
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

- [ ] **Step 4: Запустити тест — має пройти**

Run: `pnpm test tests/component/widgets/nav.test.tsx`
Expected: PASS — 3 тести зелені.

- [ ] **Step 5: Типи, лінт, збірка, ручна перевірка**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS.
Потім `pnpm dev`, навести курсор на навігацію: бордова рамка плавно (~480ms) ковзає під лінку під курсором; курсор геть — рамка повертається на активну лінку; без підкреслення.

---

## Task 5: Вертикальний ритм секцій

**Files:**
- Modify: `src/shared/ui/layout/section.tsx`
- Modify: `src/shared/ui/layout/stack.tsx`
- Modify: `src/shared/ui/editorial-divider/editorial-divider.tsx`
- Modify: `src/widgets/editorial-page-shell/editorial-page-shell.tsx`
- Test: `tests/component/atoms/layout-rhythm.test.tsx`
- Test: `tests/component/atoms/editorial-divider.test.tsx`

- [ ] **Step 1: Написати тести**

Створити `tests/component/atoms/layout-rhythm.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Section } from "@/shared/ui/layout/section";
import { Stack } from "@/shared/ui/layout/stack";

describe("Section pad='page'", () => {
  it("дає компактний верх і просторий низ", () => {
    const { container } = render(
      <Section pad="page">
        <p>контент</p>
      </Section>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\bpt-6\b/);
    expect(cls).toMatch(/\bpb-8\b/);
    expect(cls).toMatch(/md:pt-7/);
    expect(cls).toMatch(/md:pb-9/);
  });
});

describe("Stack gap='block'", () => {
  it("дає responsive міжблоковий ритм", () => {
    const { container } = render(
      <Stack gap="block">
        <p>a</p>
        <p>b</p>
      </Stack>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\bgap-6\b/);
    expect(cls).toMatch(/md:gap-8/);
  });

  it("числовий gap працює як раніше", () => {
    const { container } = render(
      <Stack gap={4}>
        <p>a</p>
      </Stack>,
    );
    expect(container.firstElementChild!.className).toMatch(/\bgap-4\b/);
  });
});
```

Створити `tests/component/atoms/editorial-divider.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EditorialDivider } from "@/shared/ui/editorial-divider";

describe("EditorialDivider", () => {
  it("варіант 'marks' не додає власних вертикальних відступів", () => {
    const { container } = render(<EditorialDivider variant="marks" />);
    expect(container.firstElementChild!.className).not.toMatch(/\bpy-4\b/);
  });

  it("варіант 'number' не додає власних вертикальних відступів", () => {
    const { container } = render(<EditorialDivider variant="number" number={3} />);
    expect(container.firstElementChild!.className).not.toMatch(/\bpy-4\b/);
  });

  it("дефолтний 'dashed' рендерить hr", () => {
    const { container } = render(<EditorialDivider />);
    expect(container.firstElementChild!.tagName).toBe("HR");
  });
});
```

- [ ] **Step 2: Запустити тести — мають впасти**

Run: `pnpm test tests/component/atoms/layout-rhythm.test.tsx tests/component/atoms/editorial-divider.test.tsx`
Expected: FAIL — `Section` ще не має `pad="page"`, `Stack` не має `gap="block"`, `marks`/`number` ще мають `py-4`.

- [ ] **Step 3a: Додати `pad="page"` у `section.tsx`**

У `src/shared/ui/layout/section.tsx` замінити обʼєкт `pad` на:

```ts
const pad = {
  default: "py-16 md:py-[120px]",
  tight: "py-10 md:py-16",
  wide: "py-20 md:py-[160px]",
  page: "pt-6 pb-8 md:pt-7 md:pb-9",
} as const;
```

(`pt-6`=32px, `pb-8`=64px, `md:pt-7`=48px, `md:pb-9`=96px — за перевизначеною шкалою `--s-*`.)

- [ ] **Step 3b: Додати `gap="block"` у `stack.tsx`**

У `src/shared/ui/layout/stack.tsx` замінити обʼєкт `gapMap` на:

```ts
const gapMap = {
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  block: "gap-6 md:gap-8",
} as const;
```

Тип `gap?: keyof typeof gapMap` лишається — тепер приймає і `8`, і `"block"`; наявні виклики з числами 3–7 далі валідні.

- [ ] **Step 3c: Прибрати власні відступи розділювача**

У `src/shared/ui/editorial-divider/editorial-divider.tsx`:
- у гілці `variant === "marks"` змінити `"flex items-center justify-center gap-2 py-4"` → `"flex items-center justify-center gap-2"`;
- у гілці `variant === "number"` змінити `"flex items-center gap-3 py-4 text-small text-ink-soft"` → `"flex items-center gap-3 text-small text-ink-soft"`;
- у фінальній гілці (`star`) змінити `"flex items-center gap-3 py-4"` → `"flex items-center gap-3"`.

Гілку `dashed` (`<hr>`) не чіпати.

- [ ] **Step 3d: Застосувати ритм у `editorial-page-shell.tsx`**

Замінити весь вміст `src/widgets/editorial-page-shell/editorial-page-shell.tsx` на:

```tsx
import type { ReactNode } from "react";
import { Container, Section, Stack } from "@/shared/ui";

export function EditorialPageShell({ children }: { children: ReactNode }) {
  return (
    <Section pad="page" className="overflow-x-hidden">
      <Container>
        <Stack gap="block">{children}</Stack>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Запустити тести — мають пройти**

Run: `pnpm test tests/component/atoms/layout-rhythm.test.tsx tests/component/atoms/editorial-divider.test.tsx`
Expected: PASS — усі тести зелені.

- [ ] **Step 5: Типи, лінт, збірка**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: PASS.
Ручна перевірка `pnpm dev`: контент сторінок (каталог, кошик, про проєкт) починається ближче до хедера — велика порожнеча зверху зникла; проміжки між блоками рівні й послідовні.

---

## Фінальна верифікація Плану 1

- [ ] Run: `pnpm verify`
  Expected: `typecheck`, `lint`, `test`, `scan-images`, `build`, `e2e --grep @smoke` — усі зелені.
- [ ] Ручний прохід `pnpm dev`: хедер у двох станах; ховер навігації; ритм секцій.
- [ ] Зупинитись — користувач переглядає й комітить.

## Залежності для наступних планів

- План 2 (кнопки/форми) — незалежний, може йти паралельно.
- План 3 (hero/футер) — модифікує `header.tsx` і `nav.tsx` повторно (додає тон над темним hero) та `home-screen.tsx` (прибирає локальні `py-12/py-8/space-y-12`, які лишилися поза скоупом Плану 1).
