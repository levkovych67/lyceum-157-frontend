# План 2 — Кнопки · форми · екрани login/register

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Кнопка стає «друкованим блоком» (гострі кути, зміщена тінь, вдавлювання при hover) замість пігулки; інпути login/register уніфікуються через variant; екрани входу та реєстрації стають двоколонковими дзеркальними.

**Architecture:** Редизайн зосереджено в трьох спільних компонентах — `PillButton` (cva-варіанти), `Input` (новий `variant`), новий віджет `AuthLayout`. Зміна cva кнопки автоматично розкочується на всі ~49 call-sites. Override-класи кнопки/інпутів на іменованих формах прибираються — лишається тільки `variant` + layout. Login/Register перестають використовувати центрований `EditorialPageShell` і переходять на `AuthLayout` (двоколонкова сітка з фото-колонкою).

**Tech Stack:** Next.js 14.2 (App Router) · TypeScript strict · Tailwind v3 + CSS-var токени · class-variance-authority · Vitest + Testing Library · ESLint FSD-boundaries.

---

## Контекст плану

Це **План 2 із 3** для спеки
`docs/superpowers/specs/2026-05-20-frontend-visual-rework-design.md`:

1. План 1 — каркас: токени скла, хедер, навігація, ритм секцій. **Виконано/готовий окремо.**
2. **План 2 (цей)** — кнопки + форми + екрани login/register. Спека §9, §10, §11, §12 (`--sh-press`).
3. План 3 — 4 hero, смуги Колекції/Контакти, футер; тон хедера над темним hero. Спека §7, §8 + §4-тони.

**Залежність від Плану 1.** План 1 уже додав до `tokens.css` блок `--header-glass-bg` і колір `glass` у Tailwind. Цей план дописує токени тіні **після** наявних shadow-токенів — не плутати з блоком скла.

## Конвенції

- **Коміти робить користувач** — у задачах кроку `git commit` немає; задача завершується верифікацією. Після кожної задачі зупинись, дай користувачу переглянути й закомітити.
- Тести: unit (`.test.ts`) → `tests/unit/**`, компонентні (`.test.tsx`) → `tests/component/**` (так налаштовано `vitest.config.ts` `include`).
- Тільки токенні класи — жодних hardcoded кольорів. Зміщення/розміри кнопки (`translate-x-[5px]` тощо) — це геометрія компонента, не дизайн-токени; вони лишаються в cva кнопки і ніде більше.
- **Назву компонента не міняємо.** Спека §9 дозволяє ренейм `PillButton → Button`, але це торкнулося б ~49 call-sites + тестів. Лишаємо експорти `PillButton`/`PillButtonProps` як є — редизайн суто візуальний. Внутрішню cva-константу `pill` перейменовуємо на `button` (локально, без впливу назовні).
- **Назви cva-варіантів не міняємо** (`primary`, `outline-d`, `outline-l`, `ghost`) — інакше довелося б правити всі call-sites із `variant`-проп. Міняємо лише їхні стилі: `primary` → друкований блок, `outline-d` → чорнильний контур (вторинна), `outline-l` → контур для темного тла, `ghost` → текстова.
- Чисто візуальні зміни (точні тіні/зсуви/анімація) не покриваються unit-тестами — верифікація = `typecheck + lint + build` + ручна перевірка в `pnpm dev`. Тести пишемо там, де є логіка чи контрактні класи (variant-класи кнопки, variant інпута, структура `AuthLayout`).
- Спейсинг 1–12 у Tailwind перевизначено на `--s-*` (`p-6`=32px, `p-7`=48px, `p-8`=64px, `p-9`=96px). Враховувати.
- Рух поважає `prefers-reduced-motion` автоматично: transition кнопки йде на `duration-d2`, а `tokens.css` занулює `--d-2` під reduced-motion.
- **Кнопки по всьому застосунку.** Редизайн cva авто-розкочується на всі ~35 call-sites (`<PillButton>` у 29 файлах). Більшість викликів не мають override-класів — наслідують новий вигляд без правок. Вручну правимо лише: іменовані форми (Tasks 4–5), один layout-override на `product-detail` і відступи у рядках-парах кнопок на error-сторінках (Task 9). Зміщена тінь кнопки (`6px 6px`) перевірена проти обрізання: `DialogContent` не має `overflow-hidden`, дашборди використовують `grid gap-4` (16px ≥ 11px виносу) — колізій немає.

## Структура файлів

| Файл | Відповідальність | Дія |
|---|---|---|
| `src/_app/styles/tokens.css` | CSS-токени зміщеної тіні кнопки | Modify |
| `tailwind.config.ts` | Реєстрація `boxShadow.press` і `boxShadow.press-sm` | Modify |
| `src/shared/ui/pill-button/pill-button.tsx` | Редизайн cva: друкований блок / чорнильний контур | Modify |
| `src/shared/ui/form-field/input.tsx` | Новий `variant: "box" \| "underline"` | Modify |
| `src/features/auth/ui/login-form.tsx` | Прибрати override-класи кнопки + інпутів | Modify |
| `src/features/auth/ui/register-form.tsx` | Прибрати override-класи кнопки + інпутів | Modify |
| `src/features/checkout/ui/checkout-form.tsx` | Прибрати override-класи кнопки + інпутів | Modify |
| `src/views/cart/ui/cart-screen.tsx` | Прибрати override кнопок + гострі кути степера | Modify |
| `src/widgets/auth-layout/auth-layout.tsx` | Новий віджет: двоколонкова auth-сітка | Create |
| `src/widgets/auth-layout/index.ts` | Public-export віджета | Create |
| `src/views/login/ui/login-screen.tsx` | Двоколонковий екран (фото зліва) | Modify |
| `src/views/register/ui/register-screen.tsx` | Двоколонковий екран (форма зліва) | Modify |
| `src/views/product-detail/ui/product-detail-screen.tsx` | Спростити override кнопки «в кошик» | Modify |
| `src/app/account/error.tsx` | Gap у рядку з 2 кнопок | Modify |
| `src/app/student/error.tsx` | Gap у рядку з 2 кнопок | Modify |
| `src/app/(public)/error.tsx` | Gap у рядку з 2 кнопок | Modify |
| `src/app/admin/error.tsx` | Gap у рядку з 2 кнопок | Modify |
| `tests/component/atoms/pill-button.test.tsx` | Тести variant-класів кнопки | Modify |
| `tests/component/atoms/input.test.tsx` | Тест `variant` інпута | Create |
| `tests/component/widgets/auth-layout.test.tsx` | Тест структури `AuthLayout` | Create |

---

## Task 1: Токени зміщеної тіні кнопки

**Files:**
- Modify: `src/_app/styles/tokens.css`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Додати CSS-токени у `tokens.css`**

У `src/_app/styles/tokens.css`, у блоці `/* Shadows */`, одразу після рядка
`--sh-deep: 0 32px 64px rgba(0, 0, 0, 0.24);` (рядок 59) і **перед** порожнім рядком
та коментарем `/* Header — фон матового скла... */`, додати два рядки:

```css
  --sh-press: 6px 6px 0 var(--c-bg-noir);
  --sh-press-sm: 2px 2px 0 var(--c-bg-noir);
```

Результат — блок shadows виглядає так:

```css
  /* Shadows */
  --sh-paper: 0 1px 0 rgba(0, 0, 0, 0.04), 0 4px 16px rgba(110, 39, 61, 0.06);
  --sh-lift: 0 8px 32px rgba(110, 39, 61, 0.12);
  --sh-photo: 0 12px 24px rgba(0, 0, 0, 0.18), 0 2px 4px rgba(0, 0, 0, 0.1);
  --sh-deep: 0 32px 64px rgba(0, 0, 0, 0.24);
  --sh-press: 6px 6px 0 var(--c-bg-noir);
  --sh-press-sm: 2px 2px 0 var(--c-bg-noir);
```

- [ ] **Step 2: Зареєструвати тіні у Tailwind**

У `tailwind.config.ts`, у `theme.extend.boxShadow`, після рядка `deep: "var(--sh-deep)",`
додати два ключі:

```ts
      boxShadow: {
        paper: "var(--sh-paper)",
        lift: "var(--sh-lift)",
        photo: "var(--sh-photo)",
        deep: "var(--sh-deep)",
        press: "var(--sh-press)",
        "press-sm": "var(--sh-press-sm)",
      },
```

- [ ] **Step 3: Верифікувати**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS (нові токени синтаксично коректні; CSS-var не ламає типів).

Run: `pnpm build`
Expected: build PASS — Tailwind підхопив `shadow-press` / `shadow-press-sm` (без використання вони не tree-shake-нуться помилково, бо застосуються у Task 2).

---

## Task 2: Редизайн кнопки — друкований блок / чорнильний контур

**Files:**
- Modify: `src/shared/ui/pill-button/pill-button.tsx`
- Modify (test): `tests/component/atoms/pill-button.test.tsx`

- [ ] **Step 1: Оновити тест — закласти контракт variant-класів**

Замінити **весь вміст** `tests/component/atoms/pill-button.test.tsx` на:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PillButton } from "@/shared/ui/pill-button";

describe("PillButton", () => {
  it("renders children", () => {
    render(<PillButton>Click</PillButton>);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const fn = vi.fn();
    render(<PillButton onClick={fn}>Hit</PillButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("disables when loading", () => {
    render(<PillButton loading>Send</PillButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("primary variant is a sharp-cornered filled block with offset shadow", () => {
    render(<PillButton>P</PillButton>); // primary = default
    const cls = screen.getByRole("button").className;
    expect(cls).toMatch(/rounded-none/);
    expect(cls).toMatch(/bg-burgundy/);
    expect(cls).toMatch(/shadow-press\b/);
    expect(cls).not.toMatch(/rounded-pill/);
  });

  it("outline-d variant is a transparent ink-contour", () => {
    render(<PillButton variant="outline-d">S</PillButton>);
    const cls = screen.getByRole("button").className;
    expect(cls).toMatch(/border-2/);
    expect(cls).toMatch(/border-burgundy/);
    expect(cls).toMatch(/bg-transparent/);
  });
});
```

- [ ] **Step 2: Запустити тест — переконатися, що падає**

Run: `pnpm test tests/component/atoms/pill-button.test.tsx`
Expected: FAIL — два нові тести червоні (поточна cva має `rounded-pill`, без `shadow-press`, без `border-2`).

- [ ] **Step 3: Переписати cva кнопки**

У `src/shared/ui/pill-button/pill-button.tsx` замінити визначення cva (рядки 6–28, від
`const pill = cva(` до закриваючого `);`) на:

```tsx
const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-none font-body font-bold uppercase " +
    "tracking-[0.08em] transition-[transform,box-shadow,background-color,border-color,color] " +
    "duration-d2 ease-paper disabled:cursor-not-allowed disabled:opacity-45 " +
    "disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none",
  {
    variants: {
      variant: {
        // Друкований блок — заливка, жорстка зміщена тінь, вдавлюється у тінь при hover.
        primary:
          "bg-burgundy text-white shadow-press hover:bg-green " +
          "hover:translate-x-[5px] hover:translate-y-[5px] hover:shadow-press-sm " +
          "active:translate-x-[6px] active:translate-y-[6px] active:shadow-none",
        // Чорнильний контур (вторинна) — прозора, бордовий бордюр, тонка зміщена тінь.
        "outline-d":
          "border-2 border-burgundy bg-transparent text-burgundy shadow-press-sm " +
          "hover:border-green hover:bg-green hover:text-white " +
          "hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none " +
          "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
        // Контур для темного тла — кремовий, без зміщеної тіні.
        "outline-l":
          "border-2 border-white bg-transparent text-white " +
          "hover:bg-white hover:text-burgundy",
        // Текстова — без рамки й тіні.
        ghost: "bg-transparent text-burgundy hover:text-green",
      },
      size: {
        s: "h-9 px-5 text-small",
        m: "h-12 px-7 text-small",
        l: "h-14 px-8 text-body",
        xl: "h-16 px-10 text-body",
      },
    },
    defaultVariants: { variant: "primary", size: "m" },
  },
);
```

- [ ] **Step 4: Оновити посилання на cva всередині компонента**

У тому ж файлі, у тілі `forwardRef`, рядок `const classes = cn(pill({ variant, size }), className);`
замінити на:

```tsx
  const classes = cn(button({ variant, size }), className);
```

Решту файлу (`forwardRef`, `Slot`, `Spinner`, типи) **не чіпати** — `VariantProps<typeof pill>`
у типі `PillButtonProps` теж перейменувати:

У типі `PillButtonProps` рядок `VariantProps<typeof pill>` замінити на `VariantProps<typeof button>`.

- [ ] **Step 5: Запустити тест — має пройти**

Run: `pnpm test tests/component/atoms/pill-button.test.tsx`
Expected: PASS — усі 5 тестів зелені.

- [ ] **Step 6: Повна верифікація компонента**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

Run: `pnpm build`
Expected: PASS — Tailwind згенерував `shadow-press`, `translate-x-[5px]`, `rounded-none`.

> **Ручна перевірка** (після `pnpm dev`): первинна кнопка має гострі кути, темну зміщену тінь; при hover вдавлюється (зсув + тінь стискається) і заливка міняється `burgundy → green`; при кліку — повністю втиснута. ~49 call-sites по сайту перемальовуються автоматично — це навмисно (спека §2).

---

## Task 3: Інпут — variant `box` / `underline`

**Files:**
- Modify: `src/shared/ui/form-field/input.tsx`
- Create (test): `tests/component/atoms/input.test.tsx`

- [ ] **Step 1: Написати тест variant-ів**

Створити `tests/component/atoms/input.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Input } from "@/shared/ui/form-field";

describe("Input", () => {
  it("defaults to the boxed variant", () => {
    const { container } = render(<Input data-testid="i" />);
    const cls = container.querySelector("input")!.className;
    expect(cls).toMatch(/rounded-md/);
    expect(cls).toMatch(/bg-bg-card/);
  });

  it("underline variant renders a bottom-rule field", () => {
    const { container } = render(<Input variant="underline" />);
    const cls = container.querySelector("input")!.className;
    expect(cls).toMatch(/border-b-\[1\.5px\]/);
    expect(cls).toMatch(/bg-transparent/);
    expect(cls).not.toMatch(/rounded-md/);
  });
});
```

- [ ] **Step 2: Запустити тест — переконатися, що падає**

Run: `pnpm test tests/component/atoms/input.test.tsx`
Expected: FAIL — `Input` ще не приймає `variant`; `underline`-тест червоний (TS-помилка або відсутні класи).

- [ ] **Step 3: Додати variant у `Input`**

Замінити **весь вміст** `src/shared/ui/form-field/input.tsx` на:

```tsx
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export type InputVariant = "box" | "underline";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { variant?: InputVariant };

const variants: Record<InputVariant, string> = {
  // Стандартне поле — біла картка з рамкою, фокус-кільце.
  box:
    "h-14 rounded-md border border-line bg-bg-card px-4 " +
    "focus:border-transparent focus:ring-2 focus:ring-burgundy " +
    "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
  // «Бібліотечне» поле — лише нижня лінія, прозоре тло, бордовий focus.
  underline:
    "border-ink/30 h-12 rounded-none border-0 border-b-[1.5px] bg-transparent px-0 " +
    "transition-colors duration-d2 focus:border-burgundy " +
    "aria-[invalid=true]:border-error",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, variant = "box", ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full text-body text-ink placeholder:text-ink-fade focus:outline-none",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
});
```

- [ ] **Step 4: Запустити тести — мають пройти**

Run: `pnpm test tests/component/atoms/input.test.tsx tests/component/atoms/form-field.test.tsx`
Expected: PASS — новий тест зелений; наявний `form-field.test.tsx` лишається зеленим (default `box` зберіг попередню поведінку).

- [ ] **Step 5: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

---

## Task 4: Прибрати override-класи на формах auth + checkout

**Files:**
- Modify: `src/features/auth/ui/login-form.tsx`
- Modify: `src/features/auth/ui/register-form.tsx`
- Modify: `src/features/checkout/ui/checkout-form.tsx`

> Кнопки цих форм використовують дефолтний `primary` (без `variant`-проп). Прибираємо
> ручні `bg-burgundy text-bg-warm hover:...` — нова cva вже дає правильний вигляд.
> Інпути переводимо на `variant="underline"` замість повторюваного className.

- [ ] **Step 1: `login-form.tsx` — інпути**

У `src/features/auth/ui/login-form.tsx` замінити обидва `<Input>` (email — рядки 42–48,
password — рядки 57–63). Email:

```tsx
          <Input
            type="email"
            autoComplete="email"
            variant="underline"
            {...form.register("email")}
            placeholder="your.name@example.com"
          />
```

Password:

```tsx
          <Input
            type="password"
            autoComplete="current-password"
            variant="underline"
            {...form.register("password")}
            placeholder="••••••••"
          />
```

- [ ] **Step 2: `login-form.tsx` — кнопка**

У тому ж файлі замінити `<PillButton>` (рядки 72–78) на:

```tsx
          <PillButton type="submit" loading={m.isPending}>
            Увійти
          </PillButton>
```

- [ ] **Step 3: `register-form.tsx` — інпути**

У `src/features/auth/ui/register-form.tsx` всі п'ять `<Input>` (`firstName`, `lastName`,
`email`, `grade`, `password`, `parentEmail` — шість входжень) мають однаковий override
`className="rounded-none border-b border-ink bg-transparent px-0 shadow-none focus:ring-0"`.
Для кожного: прибрати `className`, додати `variant="underline"`. Приклад для `firstName`:

```tsx
            <Input variant="underline" {...form.register("firstName")} />
```

Для `email`:

```tsx
            <Input
              type="email"
              autoComplete="email"
              variant="underline"
              {...form.register("email")}
            />
```

Для `grade` (зберегти `placeholder`):

```tsx
            <Input variant="underline" placeholder="9-А" {...form.register("grade")} />
```

Для `password`:

```tsx
            <Input
              type="password"
              autoComplete="new-password"
              variant="underline"
              {...form.register("password")}
            />
```

Для `lastName` — як `firstName`. Для `parentEmail`:

```tsx
            <Input type="email" variant="underline" {...form.register("parentEmail")} />
```

- [ ] **Step 4: `register-form.tsx` — кнопка**

Замінити `<PillButton>` (рядки 140–146) на:

```tsx
          <PillButton type="submit" loading={m.isPending}>
            Зареєструватись
          </PillButton>
```

- [ ] **Step 5: `checkout-form.tsx` — інпути та кнопки**

У `src/features/checkout/ui/checkout-form.tsx`:

Три `<Input>` (`buyerName`, `buyerEmail`, `buyerPhone`) мають той самий override
`className="rounded-none border-b border-ink bg-transparent px-0 shadow-none focus:ring-0"`.
Прибрати `className`, додати `variant="underline"`. Приклад `buyerName`:

```tsx
            <Input variant="underline" {...form.register("buyerName")} />
```

`buyerEmail`:

```tsx
            <Input type="email" variant="underline" {...form.register("buyerEmail")} />
```

`buyerPhone`:

```tsx
            <Input type="tel" variant="underline" {...form.register("buyerPhone")} />
```

Кнопка порожнього кошика (рядки 48–50) — прибрати override, лишити layout-клас `mt-4`:

```tsx
        <PillButton asChild className="mt-4">
          <Link href="/catalog">До каталогу</Link>
        </PillButton>
```

Кнопка submit (рядки 106–112) — прибрати override:

```tsx
            <PillButton type="submit" loading={m.isPending}>
              {m.isPending ? "Перенаправляємо на LiqPay…" : `Сплатити ${totalUah} ₴`}
            </PillButton>
```

- [ ] **Step 6: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

Run: `pnpm test tests/component`
Expected: PASS — наявні тести форм (`login`, `register`, `checkout`, якщо є) лишаються зеленими; усі звертання до кнопки/інпута через role/label, не за класами.

> **Ручна перевірка:** усі поля login/register/checkout мають однаковий «бібліотечний»
> підкреслений вигляд із бордовим focus; кнопки submit — друкований блок із вдавлюванням.

---

## Task 5: Кошик — кнопки та степер кількості

**Files:**
- Modify: `src/views/cart/ui/cart-screen.tsx`

- [ ] **Step 1: Прибрати override на кнопці порожнього кошика**

У `src/views/cart/ui/cart-screen.tsx` замінити `<PillButton>` порожнього стану (рядки 34–36) на:

```tsx
          <PillButton asChild className="mt-8">
            <Link href="/catalog">До каталогу</Link>
          </PillButton>
```

- [ ] **Step 2: Прибрати override на кнопці «Оформити»**

Замінити `<PillButton>` у панелі підсумку (рядки 143–148) на:

```tsx
            <PillButton asChild className="w-full">
              <Link href="/checkout">Оформити</Link>
            </PillButton>
```

(`justify-center` уже у base cva — окремий клас не потрібен.)

- [ ] **Step 3: Гострі кути степера кількості**

У степері кількості (рядки 70–89) `<div>`-обгортка має `rounded-full`. Узгодити з новою
мовою — гострі кути. Замінити рядок 71:

```tsx
                      <div className="flex h-8 w-24 items-center overflow-hidden rounded-none border-[1.5px] border-line-strong bg-bg">
```

Решту степера (`−` / `+` кнопки, `<span>` лічильник) не чіпати.

- [ ] **Step 4: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS.

Run: `pnpm test tests/component`
Expected: PASS — наявні cart-тести зелені.

> **Ручна перевірка:** степер прямокутний; кнопки кошика — друкований блок.

---

## Task 6: Віджет `AuthLayout`

**Files:**
- Create: `src/widgets/auth-layout/auth-layout.tsx`
- Create: `src/widgets/auth-layout/index.ts`
- Create (test): `tests/component/widgets/auth-layout.test.tsx`

> `AuthLayout` — двоколонкова сітка: колонка-форма (ширша, `3fr`) і фото-колонка (`2fr`).
> `photoSide` визначає, з якого боку фото; на мобільному фото ховається, форма на весь рядок.
> Компонент без хуків і стану — server-safe (без `"use client"`).

- [ ] **Step 1: Написати тест структури**

Створити `tests/component/widgets/auth-layout.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "@/widgets/auth-layout";

describe("AuthLayout", () => {
  it("renders form-column children", () => {
    render(
      <AuthLayout photoSlot="auth/login/cover" photoCaption="Cover">
        <p>form here</p>
      </AuthLayout>,
    );
    expect(screen.getByText("form here")).toBeInTheDocument();
  });

  it("places the photo before the form when photoSide is left", () => {
    render(
      <AuthLayout photoSide="left" photoSlot="auth/login/cover" photoCaption="Cover">
        <p data-testid="form">form</p>
      </AuthLayout>,
    );
    const grid = screen.getByTestId("auth-grid");
    const formCol = screen.getByTestId("form").closest("[data-auth-col]")!;
    expect(grid.firstElementChild).not.toBe(formCol);
  });

  it("places the photo after the form when photoSide is right (default)", () => {
    render(
      <AuthLayout photoSlot="auth/register/cover" photoCaption="Cover">
        <p data-testid="form">form</p>
      </AuthLayout>,
    );
    const grid = screen.getByTestId("auth-grid");
    const formCol = screen.getByTestId("form").closest("[data-auth-col]")!;
    expect(grid.firstElementChild).toBe(formCol);
  });
});
```

- [ ] **Step 2: Запустити тест — переконатися, що падає**

Run: `pnpm test tests/component/widgets/auth-layout.test.tsx`
Expected: FAIL — модуль `@/widgets/auth-layout` ще не існує.

- [ ] **Step 3: Створити компонент**

Створити `src/widgets/auth-layout/auth-layout.tsx`:

```tsx
import type { ReactNode } from "react";
import { Container, ImageSlot } from "@/shared/ui";
import { cn } from "@/shared/lib";

export type AuthLayoutProps = {
  /** Вміст колонки-форми. */
  children: ReactNode;
  /** Slot-id фото для `ImageSlot` (placeholder-режим, без `src`). */
  photoSlot: string;
  /** Підпис фото (обовʼязковий для `ImageSlot`). */
  photoCaption: string;
  /** З якого боку фото-колонка. Дефолт — справа. */
  photoSide?: "left" | "right";
};

export function AuthLayout({
  children,
  photoSlot,
  photoCaption,
  photoSide = "right",
}: AuthLayoutProps) {
  const photo = (
    <div data-auth-col className="relative hidden md:block">
      <ImageSlot slot={photoSlot} ratio="3/4" variant="portrait" caption={photoCaption} />
    </div>
  );
  const form = (
    <div data-auth-col className="flex justify-center md:justify-start">
      {children}
    </div>
  );

  return (
    <section className="py-7 md:py-9">
      <Container>
        <div
          data-testid="auth-grid"
          className={cn(
            "grid grid-cols-1 items-center gap-10 md:gap-14",
            photoSide === "left" ? "md:grid-cols-[2fr_3fr]" : "md:grid-cols-[3fr_2fr]",
          )}
        >
          {photoSide === "left" ? (
            <>
              {photo}
              {form}
            </>
          ) : (
            <>
              {form}
              {photo}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Створити public-export**

Створити `src/widgets/auth-layout/index.ts`:

```ts
export { AuthLayout } from "./auth-layout";
export type { AuthLayoutProps } from "./auth-layout";
```

- [ ] **Step 5: Запустити тести — мають пройти**

Run: `pnpm test tests/component/widgets/auth-layout.test.tsx`
Expected: PASS — усі 3 тести зелені.

- [ ] **Step 6: Верифікація меж FSD**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `widgets/auth-layout` імпортує лише `@/shared/*`, межі ESLint-boundaries не порушені.

---

## Task 7: Екран login — двоколонковий (фото зліва)

**Files:**
- Modify: `src/views/login/ui/login-screen.tsx`

> Login — дзеркало реєстрації: фото **зліва**, форма **справа**. Заголовок «Вхід»
> зменшується з `text-mega` до `text-display`. Декоративну печатку-`ImageSlot`, що
> переповнювала макет, прибираємо (спека §10) — форма й так має власну печатку
> «СХВАЛЕНО КУРАТОРОМ» усередині.

- [ ] **Step 1: Переписати `login-screen.tsx`**

Замінити **весь вміст** `src/views/login/ui/login-screen.tsx` на:

```tsx
"use client";
import { Suspense } from "react";
import { AuthLayout } from "@/widgets/auth-layout";
import { EditorialLabel } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export function LoginScreen() {
  return (
    <AuthLayout photoSide="left" photoSlot="auth/login/cover" photoCaption="Читальна зала ліцею">
      <div className="w-full max-w-[460px]">
        <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
        <h1 className="mt-4 font-display text-display italic text-burgundy">Вхід</h1>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </AuthLayout>
  );
}
```

- [ ] **Step 2: Верифікація**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `ImageSlot` більше не імпортується у цьому файлі (прибрано), невикористаних імпортів немає.

Run: `pnpm test tests/component`
Expected: PASS.

Run: `pnpm build`
Expected: PASS.

> **Ручна перевірка** (`pnpm dev`, `/login`): фото-колонка зліва, форма справа; на
> мобільному фото сховане, форма на всю ширину; заголовок «Вхід» компактний (не 200px).

---

## Task 8: Екран register — двоколонковий (форма зліва)

**Files:**
- Modify: `src/views/register/ui/register-screen.tsx`

> Register — форма **зліва**, фото **справа**. Структура самої форми (`RegisterForm`)
> не змінюється — її вже уніфіковано в Task 4. Декоративну печатку-`ImageSlot` прибираємо
> (узгоджено з login; форма має власний бейдж «ФОРМА 2»).

- [ ] **Step 1: Переписати `register-screen.tsx`**

Замінити **весь вміст** `src/views/register/ui/register-screen.tsx` на:

```tsx
import { AuthLayout } from "@/widgets/auth-layout";
import { EditorialLabel } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export function RegisterScreen() {
  return (
    <AuthLayout
      photoSide="right"
      photoSlot="auth/register/cover"
      photoCaption="Майстерня художнього класу"
    >
      <div className="w-full max-w-2xl">
        <EditorialLabel>НОВА КАРТКА</EditorialLabel>
        <h1 className="mt-4 font-display text-display italic text-burgundy">Реєстрація</h1>
        <RegisterForm />
      </div>
    </AuthLayout>
  );
}
```

(`"use client"` більше не потрібен — `RegisterScreen` сам не має хуків; `RegisterForm`
лишається client-компонентом із власною директивою.)

- [ ] **Step 2: Верифікація екранів auth**

Run: `pnpm typecheck`
Expected: PASS.

Run: `pnpm lint`
Expected: PASS — FSD-boundaries: `views/{login,register}` імпортують `@/widgets/auth-layout` (дозволено: view → widget).

Run: `pnpm test`
Expected: PASS — увесь Vitest зелений.

Run: `pnpm build`
Expected: PASS.

> **Ручна перевірка** (`pnpm dev`): `/register` — форма зліва, фото справа; `/login` —
> дзеркально. Кнопки submit обох форм — друкований блок із вдавлюванням при hover.

---

## Task 9: Кнопки по всьому застосунку

**Files:**
- Modify: `src/views/product-detail/ui/product-detail-screen.tsx`
- Modify: `src/app/account/error.tsx`
- Modify: `src/app/student/error.tsx`
- Modify: `src/app/(public)/error.tsx`
- Modify: `src/app/admin/error.tsx`

> Новий вигляд кнопки авто-застосовується до всіх ~35 викликів `<PillButton>` (29 файлів) —
> більшість без override наслідують його без правок. Ця задача прибирає останній
> layout-override, дає рядкам із двох кнопок простір під зміщену тінь + hover-зсув і
> завершується ручним обходом усіх екранів із кнопками.

- [ ] **Step 1: Спростити override кнопки на сторінці товару**

У `src/views/product-detail/ui/product-detail-screen.tsx` замінити `<PillButton>` (рядки 97–101) на:

```tsx
              <PillButton onClick={handleAddToCart} className="w-full">
                Забрати роботу в кошик
              </PillButton>
```

(`variant="primary"` — дефолт; `justify-center` уже в base cva; `text-center` зайвий. Лишаємо тільки layout-клас `w-full`.)

- [ ] **Step 2: Дати простір рядкам із двох кнопок на error-сторінках**

Чотири error-сторінки мають рядок із двох кнопок (`reset` + посилання) у `<div className="flex gap-3">`.
Зміщена тінь первинної кнопки (`6px`) плюс hover-зсув (`5px`) не вміщаються у `gap-3` (12px).
У кожному файлі замінити цей `<div>`:

- `src/app/account/error.tsx` — рядок 18
- `src/app/student/error.tsx` — рядок 18
- `src/app/(public)/error.tsx` — рядок 18
- `src/app/admin/error.tsx` — рядок 20

Замінити `<div className="flex gap-3">` на:

```tsx
        <div className="flex flex-wrap gap-5">
```

(`gap-5` = 24px — чистий проміжок під тінь і зсув; `flex-wrap` — на вузьких екранах кнопки переносяться, а не тиснуться.)

- [ ] **Step 3: Верифікація змін**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — `variant="primary"` прибрано без помилок типів; невикористаних імпортів немає.

Run: `pnpm test tests/component`
Expected: PASS — компонентні тести (зокрема product-detail, якщо є) зелені; жоден тест не звіряється з прибраними класами.

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 4: Ручний обхід усіх екранів із кнопками**

`pnpm dev` + Playwright headed (або вручну). На кожному екрані перевірити: кнопки —
гострокутні друковані блоки; зміщена тінь не обрізається контейнером; у рядках/сітках
кнопок тіні та hover-зсув не налазять одна на одну; контраст тексту ≥ 4.5:1.

Публічні екрани:
- [ ] `/p/<slug>` — «Забрати роботу в кошик» (`w-full`, первинна)
- [ ] `/cart` — «До каталогу» (порожній стан) та «Оформити» (`w-full`)
- [ ] `/checkout` — «Сплатити …» (submit) та «До каталогу» (порожній кошик)
- [ ] `/checkout/failure` — «Повернутись до кошика» (`asChild`)
- [ ] `/login`, `/register` — submit-кнопки форм
- [ ] `/not-found` та `(public)/error` — кнопки навігації/reset
- [ ] cookie-banner (внизу будь-якої публічної сторінки) — `ghost`-кнопка ✕

Кабінети:
- [ ] `/account` — «Вийти» (`outline-d`) + «Видалити акаунт» (`ghost`) + діалог підтвердження (2 кнопки у `FormFooter`)
- [ ] `/student` — 3 кнопки-посилання у `grid gap-4`
- [ ] `/student/products` — «+ Нова робота»; `/student/products/new` — «Зберегти чернетку» (submit)
- [ ] `/admin` — 4 кнопки-посилання у `grid gap-4`
- [ ] `/admin/reports/tax` — кнопка експорту CSV
- [ ] `/admin/payouts` — «Виплатити обрані» + модал TOTP (2 кнопки: `ghost` + submit)
- [ ] Модерація робіт — `reject-form` (2 кнопки `FormFooter`); повернення коштів — `refund-form` (2 кнопки)
- [ ] KYC-форми (`kyc-submit`, `kyc-card-update`) — submit-кнопки
- [ ] error-сторінки гілок `account` / `student` / `admin` / `parent` / глобальна `app/error.tsx`

Dev-only:
- [ ] `/_kitchen` — showcase: `primary` / `outline-d` / `ghost` / `loading` рендеряться коректно (правок не потребує).

Якщо знайдено обрізання тіні (`overflow-hidden`/`overflow-clip` у предка) або злипання —
полагодити локально: додати предку `overflow-visible` або підняти `gap`/`p-*` контейнера
до ≥ 12px виносу. Інші правки кнопкового стилю — лише в cva (Task 2), не в call-site.

---

## Фінальна верифікація

Прогнати композит у `lyceum-157-frontend`:

```bash
pnpm verify   # typecheck + lint + test + scan-images + build + e2e @smoke
```

Окремо стежити:

- `pnpm scan-images` — нові `ImageSlot` (`auth/login/cover`, `auth/register/cover`) — у
  placeholder-режимі без `src`. `картинки.md` у проєкті відсутня, тож `scan-images`
  пропускає sync і виходить `0` — це очікувано (скрипт `scripts/scan-image-slots.ts`
  обробляє відсутність md). Коли реальні фото зʼявляться у `public/images/auth/**` —
  додати `src` до `ImageSlot` у `AuthLayout`-виклику або анкори в `картинки.md`.
- Контраст тексту на кнопках усіх станів — ≥ 4.5:1 (білий на `burgundy`/`green` — ок).
- Ручний golden-path: `/login`, `/register`, `/cart`, `/checkout` — кнопки й поля в новій мові.

## Залежності для наступних планів

- План 3 не залежить від Плану 2 напряму, але обидва правлять `tokens.css` — мерджити
  по черзі, тримати блоки токенів окремо (Plan 2 → shadows, Plan 3 → можливі нові — див. його spec-мапу).
- `outline-l` (кремовий контур) лишається валідним варіантом для темних hero Плану 3 —
  кнопки поверх темного фото-hero (Каталог) використовують `variant="outline-l"`.
