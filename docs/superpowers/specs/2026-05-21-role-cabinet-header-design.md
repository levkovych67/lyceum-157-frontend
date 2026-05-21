# Хедер навігації для кабінетів учня та адміна

**Дата:** 2026-05-21
**Гілка:** feat/student-cabinet

## Проблема

Розділи `/student/*` та `/admin/*` рендеряться через віджет `RoleSectionShell`
(`src/widgets/role-section-shell/role-section-shell.tsx`) — це голий `<main>` з
`<Container>` та крихітним інлайн-лейблом `▌ Кабінет учня` / `▌ Адміністрування`.
Хедера немає взагалі.

Наслідок для користувача (учня чи адміна, що залогінений у кабінеті):

- немає навігації між підсторінками кабінету — лише через посилання всередині
  екранів (дашборд має `PillButton`-и, але інші екрани — ні);
- немає способу повернутись на публічний сайт, окрім кнопки «назад» браузера.

## Підхід

Слім рольовий хедер як **внутрішній модуль віджета `role-section-shell`** —
не окремий віджет. FSD-boundaries (`eslint-plugin-boundaries`) забороняють імпорти
між слайсами одного шару, тож widget `role-section-shell` не може імпортувати інший
widget. Хедер живе файлами всередині того ж слайсу і підключається через
same-directory relative import (`./role-header`) — дозволено; заборонено лише
relative-parent (`../`).

`RoleSectionShell` рендерить `<RoleHeader role={role} />` над `<Container>`.

Публічний `Header` (`src/widgets/header/*`) **не чіпаємо** — кабінетний хедер
окремий: без TopBar, пошуку, кошика, account-іконки.

## Компоненти

### 1. `src/widgets/role-section-shell/role-nav-config.ts`

Конфіг навігації за роллю. Без `"use client"` — чистий модуль даних.

```ts
export type RoleNavItem = {
  href: string;
  label: string;
  /** active лише при точному збігу pathname (для кореневого «Панель»). */
  exact?: boolean;
};

export const roleNav: Record<"student" | "admin", RoleNavItem[]> = {
  student: [
    { href: "/student", label: "Панель", exact: true },
    { href: "/student/products", label: "Мої роботи" },
    { href: "/student/finance", label: "Фінанси" },
  ],
  admin: [
    { href: "/admin", label: "Панель", exact: true },
    { href: "/admin/products", label: "Модерація" },
    { href: "/admin/payouts", label: "Виплати" },
    { href: "/admin/reports/tax", label: "Звіти" },
    { href: "/admin/2fa", label: "2FA" },
  ],
};

export const roleTitle: Record<"student" | "admin", string> = {
  student: "Кабінет учня",
  admin: "Адміністрування",
};
```

Лейбли навігації хардкодяться у конфізі — це узгоджено з публічним `Nav`
(`src/widgets/header/nav.tsx`), де `items` теж містять інлайн-лейбли. Правило
`shared/i18n/uk.ts` стосується error-messages, не nav-лейблів.

### 2. `src/widgets/role-section-shell/role-header.tsx`

`"use client"` (потребує `usePathname`). Props: `{ role: "student" | "admin" }`.

`sticky top-0 z-30` хедер на всю ширину; всередині `<Container>`. Два рядки на
всіх розмірах екрана — просто й стабільно, без жонглювання flex-wrap:

```
┌──────────────────────────────────────────────┐
│ [лого] Кабінет учня              ← На сайт    │  рядок 1: бренд
├──────────────────────────────────────────────┤
│ Панель   Мої роботи   Фінанси                 │  рядок 2: таби
└──────────────────────────────────────────────┘
```

**Рядок 1 (бренд):**
- Ліворуч — `<Link href="/">` з лого (`next/image`, `/logo.webp`, як у публічному
  `Header`) + текстовий підпис `roleTitle[role]`.
- Праворуч — `<Link href="/">` з текстом `← На сайт`.

**Рядок 2 (навігація):**
- `<nav aria-label="Розділи кабінету">` зі списком `roleNav[role]`.
- Кожен пункт — `<Link>`. Активний пункт: колір `text-burgundy` + `aria-current="page"`;
  неактивний — `text-ink` з `hover:text-burgundy`.
- На мобільному ряд має `overflow-x-auto` (в адміна 5 пунктів — можуть не влізти).

Стиль — лише дизайн-токени (`bg-glass`, `border-line`, `text-ink`, `text-burgundy`,
`shadow-paper`, шкала духу `duration-d*`/`ease-paper`); жодних hardcoded
кольорів/розмірів. Утиліта `cn` — з `@/shared/lib`. Жодних opacity-модифікаторів
на var-based токенах (`bg-foo/70` тихо ламається — відома вада проєкту).

**Визначення активного пункту:**

```ts
function isActive(pathname: string, item: RoleNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
```

`exact` потрібен для кореневого «Панель» (`/student`, `/admin`), бо інакше воно
було б активним на всіх вкладених маршрутах.

### 3. `src/widgets/role-section-shell/role-section-shell.tsx` (зміна)

- Рендерить `<RoleHeader role={role} />` першим елементом усередині `<main>`,
  над `<Container>`.
- Прибирає інлайн-лейбл `<p>▌ {role...}</p>` — він тепер надлишковий: ідентичність
  ролі несе хедер, а екрани вже мають власний `<EditorialLabel>` (напр.
  `student-dashboard-screen.tsx` рендерить `<EditorialLabel>КАБІНЕТ УЧНЯ</EditorialLabel>`).

`index.ts` слайсу не змінюється — `RoleHeader` внутрішній, не експортується.

## Поза скоупом (YAGNI)

- **Кнопка logout / завершення сесії.** Запит — «вийти на сайт», тобто перехід на
  `/`, а не завершення сесії. `useAuth().logout` існує, але кабінетний logout —
  окрема задача.
- **Фіча повідомлень/нотифікацій.** В проєкті немає ні API-ендпоінта, ні дизайну.
- **Зміни публічного `Header`.**
- **Sliding-indicator** як у публічного `Nav` — для табів кабінету достатньо
  кольору + `aria-current`.

## Тестування

### RTL — `src/widgets/role-section-shell/role-header.test.tsx`

- `role="student"` → у документі пункти «Панель», «Мої роботи», «Фінанси»;
  немає «Модерація».
- `role="admin"` → пункти «Модерація», «Виплати», «Звіти», «2FA».
- Посилання `← На сайт` має `href="/"`.
- Лого-посилання має `href="/"`.
- При `pathname === "/student/products"` пункт «Мої роботи» має `aria-current="page"`,
  а «Панель» — ні (перевірка `exact`).

`usePathname` мокається через `vi.mock("next/navigation", ...)` — патерн уже
застосовується в тестах проєкту.

### Ручна перевірка

`pnpm dev` + Playwright headed: зайти в `/student` та `/admin`, переконатися що
хедер видно, таби ведуть куди треба, активний таб підсвічено, `← На сайт`
повертає на головну.

### Verification gate (перед «готово»)

`pnpm verify` — композит: `typecheck && lint && test && scan-images && build &&
e2e --grep @smoke`. `scan-images` не зачіпається (лого через `next/image`, не
`<ImageSlot>`).

## Файли

| Файл | Дія |
|---|---|
| `src/widgets/role-section-shell/role-nav-config.ts` | новий |
| `src/widgets/role-section-shell/role-header.tsx` | новий |
| `src/widgets/role-section-shell/role-header.test.tsx` | новий |
| `src/widgets/role-section-shell/role-section-shell.tsx` | зміна |
