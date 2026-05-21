# Навігація хедерів: рольові кабінети + ідентичність користувача

**Дата:** 2026-05-21
**Гілка:** main (нову гілку не створюємо — узгоджено з користувачем)

## Проблема

Три прогалини в навігації/хедерах:

1. **Кабінети без хедера.** Розділи `/student/*` та `/admin/*` рендеряться через
   віджет `RoleSectionShell` (`src/widgets/role-section-shell/role-section-shell.tsx`)
   — голий `<main>` з `<Container>` та крихітним інлайн-лейблом `▌ Кабінет учня`.
   Немає ні навігації між підсторінками кабінету, ні повернення на публічний сайт.

2. **Публічний хедер: іконка користувача однакова завжди.** У `header.tsx`
   (рядки 99–105) `<User>`-іконка (lucide) у `<Link href="/account">` не відображає,
   що користувач залогінений.

3. **Мобільний drawer без доступу до кабінету.** `mobile-drawer.tsx` містить лише
   публічні розділи (Каталог/Автори/Колекції/Про проєкт/Контакти). Десктопна
   `<User>`-іконка має `hidden sm:block`, тож на мобільному (`< sm`) акаунт
   недосяжний узагалі.

## Обмеження FSD (впливає на рішення)

`.eslintrc.cjs` → `boundaries/element-types`: `widgets` дозволено імпортувати лише
`features / entities / shared`. Отже віджет хедера **не може** імпортувати
`useAuth` (живе в шарі `_app`) — ESLint це відхилить.

**Рішення:** читати токен-снепшот напряму з `shared/api` через
`useSyncExternalStore(subscribe, getSnapshot, () => null)`. Це той самий external
store, який використовує сам `AuthProvider` (`src/_app/providers/auth-provider.tsx:35`).
`subscribe` і `getSnapshot` ре-експортуються з `@/shared/api` (їх уже звідти імпортує
auth-provider). Імпорт `widget → shared` — у межах правил.

## Частина 1 — Рольовий хедер кабінету

Слім хедер як **внутрішній модуль віджета `role-section-shell`** — не окремий
віджет (FSD забороняє widget→widget). Підключення — same-directory relative import
(`./role-header`); relative-parent (`../`) заборонено, same-dir дозволено.

### 1.1 `src/widgets/role-section-shell/role-nav-config.ts` (новий)

Чистий модуль даних, без `"use client"`.

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

Хардкод nav-лейблів узгоджено з публічним `Nav` (`widgets/header/nav.tsx`), де
`items` теж містять інлайн-лейбли. Правило `shared/i18n/uk.ts` стосується
error-messages, не nav-лейблів.

### 1.2 `src/widgets/role-section-shell/role-header.tsx` (новий)

`"use client"` (потребує `usePathname`). Props: `{ role: "student" | "admin" }`.

`sticky top-0 z-30` хедер на всю ширину; всередині `<Container>`. Два рядки на
всіх розмірах екрана:

```
┌──────────────────────────────────────────────┐
│ [лого] Кабінет учня              ← На сайт    │  рядок 1: бренд
├──────────────────────────────────────────────┤
│ Панель   Мої роботи   Фінанси                 │  рядок 2: таби
└──────────────────────────────────────────────┘
```

**Рядок 1 (бренд):** ліворуч — `<Link href="/">` з лого (`next/image`, `/logo.webp`)
+ текст `roleTitle[role]`; праворуч — `<Link href="/">` з текстом `← На сайт`.

**Рядок 2 (навігація):** `<nav aria-label="Розділи кабінету">` зі списком
`roleNav[role]`. Кожен пункт — `<Link>`. Активний: `text-burgundy` + `aria-current="page"`;
неактивний — `text-ink` з `hover:text-burgundy`. На мобільному ряд має
`overflow-x-auto` (в адміна 5 пунктів).

Стиль — лише дизайн-токени (`bg-glass`, `border-line`, `text-ink`, `text-burgundy`,
`shadow-paper`, `duration-d*`/`ease-paper`). `cn` — з `@/shared/lib`. Жодних
opacity-модифікаторів на var-based токенах (`bg-foo/70` тихо ламається — відома
вада проєкту).

**Активний пункт:**

```ts
function isActive(pathname: string, item: RoleNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
```

`exact` — для кореневого «Панель» (`/student`, `/admin`), інакше воно активне на
всіх вкладених маршрутах.

### 1.3 `src/widgets/role-section-shell/role-section-shell.tsx` (зміна)

- Рендерить `<RoleHeader role={role} />` першим елементом усередині `<main>`,
  над `<Container>`.
- Прибирає інлайн-лейбл `<p>▌ {role...}</p>` — надлишковий: ідентичність ролі
  несе хедер, екрани вже мають власний `<EditorialLabel>` (напр.
  `student-dashboard-screen.tsx`).

`index.ts` слайсу не змінюється — `RoleHeader` внутрішній, не експортується.

## Частина 2 — Спільна логіка ідентичності користувача

Токен-сесія (`TokenSnapshot`) містить лише `accessToken / userId / role / expiresAt`
— **імені немає**. Ім'я (`firstName`) приходить з `GET /me` (`MeDto`).

### 2.1 `src/widgets/header/use-account-identity.ts` (новий)

`"use client"`. Хук, що поєднує токен-снепшот + `GET /me`:

```ts
"use client";
import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribe, getSnapshot } from "@/shared/api";
import { getMe } from "@/shared/api/generated/user-account/user-account";

export type AccountIdentity = {
  isAuthenticated: boolean;
  /** Перша літера імені (фолбек — email), uppercase; null поки не завантажено. */
  initial: string | null;
  /** Ім'я для показу (firstName ‖ email); null поки не завантажено. */
  displayName: string | null;
  role: "STUDENT" | "PARENT" | "ADMIN" | null;
};

export function useAccountIdentity(): AccountIdentity {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const isAuthenticated = !!snap;
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
  const firstName = me.data?.firstName?.trim() || undefined;
  const email = me.data?.email?.trim() || undefined;
  const initial = (firstName?.[0] ?? email?.[0])?.toUpperCase() ?? null;
  return {
    isAuthenticated,
    initial,
    displayName: firstName ?? email ?? null,
    role: snap?.role ?? null,
  };
}
```

Server-снепшот `useSyncExternalStore` = `null` → SSR/перший клієнтський рендер
показують незалогінений стан; після bootstrap-у `AuthProvider` (refresh за
cookie) стан оновлюється. `header.tsx` уже `"use client"`, тож це узгоджено.
`useQuery` потребує `QueryClient` — він є у `_app/providers`, хедер рендериться
в його межах.

### 2.2 `src/widgets/header/account-monogram.tsx` (новий)

Презентаційний компонент круглої монограми. Props: `{ initial: string; className?: string }`.
Рендерить коло з літерою; розмір/тон/фон задає викликач через `className`. Лише
дизайн-токени. Спільний для десктопного контролу і мобільного drawer.

## Частина 3 — Публічний хедер: контрол акаунта (десктоп)

### 3.1 `src/widgets/header/account-control.tsx` (новий)

`"use client"`. Props: `{ dark: boolean }`. Замінює `<User>`-іконку (видима з `sm`):

- `useAccountIdentity()`.
- `isAuthenticated && initial` → `<Link href="/account">` з `<AccountMonogram>`.
  Тон: світлий — `bg-burgundy` + кремовий текст; темний — кремовий фон + `text-ink`.
- Інакше (не залогінений **або** `/me` ще вантажиться / без імені) → поточна
  поведінка: `<Link href="/account">` з `<User>`-іконкою (без миготіння «?»).
- `aria-label="Кабінет"` зберігається.

### 3.2 `src/widgets/header/header.tsx` (зміна)

Блок `<Link href="/account">…<User/></Link>` (рядки 99–105) замінюється на
`<AccountControl dark={dark} />`. `dark` уже обчислюється в `Header`.

## Частина 4 — Мобільний drawer: блок акаунта

### 4.1 `src/widgets/header/mobile-drawer.tsx` (зміна)

Новий блок акаунта — окремою секцією **під шапкою «зміст випуску», над `<nav>`**
з індексом. Стиль узгоджений з drawer (dashed-бордери, burgundy, editorial).
Використовує `useAccountIdentity()`:

- **Залогінений:** `<Link href="/account" onClick={onClose}>` — рядок з
  `<AccountMonogram>` + `displayName` + дрібний лейбл ролі
  (`STUDENT → «Кабінет учня»`, `ADMIN → «Адміністрування»`, `PARENT → «Батьківський кабінет»`).
- **Не залогінений:** `<Link href="/account" onClick={onClose}>` — `<User>`-іконка
  + текст «Увійти в кабінет».

Анімація входу рядків drawer (stagger) не порушується — блок поза списком `navItems`.

## Поза скоупом (YAGNI)

- **Кнопка logout / завершення сесії.** Запит — «вийти на сайт» = перехід на `/`.
- **Фіча повідомлень/нотифікацій** — немає ні API, ні дизайну.
- **Монограма в рольовому хедері кабінету** — його призначення навігаційне;
  ідентичність несе `roleTitle`.
- **Аватар-зображення** — лише літерна монограма (`MeDto` не має avatar-URL).
- **Sliding-indicator** як у публічного `Nav` — для табів кабінету достатньо
  кольору + `aria-current`.

## Тестування

### RTL

**`src/widgets/role-section-shell/role-header.test.tsx`**
- `role="student"` → пункти «Панель», «Мої роботи», «Фінанси»; немає «Модерація».
- `role="admin"` → «Модерація», «Виплати», «Звіти», «2FA».
- `← На сайт` та лого-посилання мають `href="/"`.
- `pathname === "/student/products"` → «Мої роботи» має `aria-current="page"`,
  «Панель» — ні (перевірка `exact`).
- `usePathname` мокається через `vi.mock("next/navigation", …)`.

**`src/widgets/header/account-control.test.tsx`**
- Не залогінений → у документі `<User>`-іконка (`aria-label="Кабінет"`), монограми немає.
- Залогінений, `getMe` повертає `firstName="Олег"` → показано «О».
- Мок токен-стору (`subscribe`/`getSnapshot`) + `getMe`; рендер у `QueryClientProvider`.

### Ручна перевірка

`pnpm dev` + Playwright headed: `/student` та `/admin` — хедер видно, таби ведуть
куди треба, активний підсвічено, `← На сайт` повертає на `/`. Публічний хедер
залогіненим — монограма; мобільний drawer — блок акаунта.

### Verification gate (перед «готово»)

`pnpm verify` — `typecheck && lint && test && scan-images && build && e2e --grep @smoke`.
`scan-images` не зачіпається (лого/іконки через `next/image`/lucide, не `<ImageSlot>`).

## Файли

| Файл | Дія |
|---|---|
| `src/widgets/role-section-shell/role-nav-config.ts` | новий |
| `src/widgets/role-section-shell/role-header.tsx` | новий |
| `src/widgets/role-section-shell/role-header.test.tsx` | новий |
| `src/widgets/role-section-shell/role-section-shell.tsx` | зміна |
| `src/widgets/header/use-account-identity.ts` | новий |
| `src/widgets/header/account-monogram.tsx` | новий |
| `src/widgets/header/account-control.tsx` | новий |
| `src/widgets/header/account-control.test.tsx` | новий |
| `src/widgets/header/header.tsx` | зміна |
| `src/widgets/header/mobile-drawer.tsx` | зміна |
