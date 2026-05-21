# Cabinet Header Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Дати кабінетам учня/адміна власний хедер з навігацією + виходом на сайт, а публічному хедеру — монограму залогіненого користувача (десктоп + мобільний drawer).

**Architecture:** Рольовий хедер — внутрішній модуль віджета `role-section-shell`. Ідентичність користувача читається з токен-стору `shared/api` (`useSyncExternalStore`) + `GET /me`, бо віджети за FSD не можуть імпортувати `useAuth` (шар `_app`). Спільний хук `useAccountIdentity` + презентаційний `AccountMonogram` обслуговують і десктопний контрол, і мобільний блок.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind v3 (CSS-var токени), TanStack Query v5, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-05-21-role-cabinet-header-design.md`

---

## File Structure

| Файл | Відповідальність |
|---|---|
| `src/widgets/role-section-shell/role-nav-config.ts` | дані: пункти навігації + назви за роллю (новий) |
| `src/widgets/role-section-shell/role-header.tsx` | рольовий хедер кабінету: бренд-рядок + таби (новий) |
| `src/widgets/role-section-shell/role-section-shell.tsx` | монтує `RoleHeader` над контентом (зміна) |
| `src/widgets/header/account-monogram.tsx` | презентаційне коло з літерою (новий) |
| `src/widgets/header/use-account-identity.ts` | хук: токен-снепшот + `GET /me` → ідентичність (новий) |
| `src/widgets/header/account-control.tsx` | десктопний контрол акаунта: монограма ‖ `<User>` (новий) |
| `src/widgets/header/drawer-account.tsx` | блок акаунта для мобільного drawer (новий) |
| `src/widgets/header/header.tsx` | використовує `AccountControl` замість `<User>` (зміна) |
| `src/widgets/header/mobile-drawer.tsx` | рендерить `DrawerAccount` (зміна) |
| `tests/component/widgets/role-header.test.tsx` | тест `RoleHeader` (новий) |
| `tests/component/widgets/role-section-shell.test.tsx` | тест монтування (новий) |
| `tests/component/widgets/account-monogram.test.tsx` | тест монограми (новий) |
| `tests/component/widgets/account-control.test.tsx` | тест контролу акаунта (новий) |
| `tests/component/widgets/drawer-account.test.tsx` | тест блоку drawer (новий) |

**Note on test location:** vitest `include` — `tests/component/**/*.test.tsx`. Тести НЕ кладуться поряд із кодом. Spec помилково вказував `src/.../*.test.tsx` — цей план виправляє: усі тести в `tests/component/widgets/`.

---

## Task 1: Рольовий хедер кабінету (config + RoleHeader)

**Files:**
- Create: `src/widgets/role-section-shell/role-nav-config.ts`
- Create: `src/widgets/role-section-shell/role-header.tsx`
- Test: `tests/component/widgets/role-header.test.tsx`

- [ ] **Step 1: Написати тест, що падає**

Файл `tests/component/widgets/role-header.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { RoleHeader } from "@/widgets/role-section-shell/role-header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

describe("RoleHeader", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/student");
  });

  it("рендерить пункти навігації учня", () => {
    render(<RoleHeader role="student" />);
    for (const label of ["Панель", "Мої роботи", "Фінанси"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.queryByRole("link", { name: "Модерація" })).toBeNull();
  });

  it("рендерить пункти навігації адміна", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<RoleHeader role="admin" />);
    for (const label of ["Модерація", "Виплати", "Звіти", "2FA"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("посилання «На сайт» веде на головну", () => {
    render(<RoleHeader role="student" />);
    expect(screen.getByRole("link", { name: /На сайт/ })).toHaveAttribute("href", "/");
  });

  it("позначає активний підрозділ через aria-current, але не корінь", () => {
    vi.mocked(usePathname).mockReturnValue("/student/products");
    render(<RoleHeader role="student" />);
    expect(screen.getByRole("link", { name: "Мої роботи" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Панель" })).not.toHaveAttribute("aria-current");
  });
});
```

- [ ] **Step 2: Запустити тест — переконатись, що падає**

Run: `pnpm test tests/component/widgets/role-header.test.tsx`
Expected: FAIL — `Failed to resolve import "@/widgets/role-section-shell/role-header"`.

- [ ] **Step 3: Створити конфіг навігації**

Файл `src/widgets/role-section-shell/role-nav-config.ts`:

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

- [ ] **Step 4: Створити компонент RoleHeader**

Файл `src/widgets/role-section-shell/role-header.tsx`:

```tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { roleNav, roleTitle, type RoleNavItem } from "./role-nav-config";

function isActive(pathname: string, item: RoleNavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function RoleHeader({ role }: { role: "student" | "admin" }) {
  const pathname = usePathname() ?? "/";
  const items = roleNav[role];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-glass shadow-paper backdrop-blur-md">
      <Container>
        {/* рядок 1 — бренд + вихід на сайт */}
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-ink transition-colors duration-d2 ease-paper hover:text-burgundy"
          >
            <Image
              src="/logo.webp"
              alt="Майстерня 157"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-lead italic">{roleTitle[role]}</span>
          </Link>
          <Link
            href="/"
            className="text-small font-bold uppercase tracking-[0.1em] text-ink transition-colors duration-d2 ease-paper hover:text-burgundy"
          >
            ← На сайт
          </Link>
        </div>
        {/* рядок 2 — навігація розділів кабінету */}
        <nav aria-label="Розділи кабінету" className="border-t border-line">
          <ul className="flex gap-1 overflow-x-auto">
            {items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block whitespace-nowrap border-b-2 px-3 py-2.5",
                      "text-small font-bold uppercase tracking-[0.1em]",
                      "transition-colors duration-d2 ease-paper",
                      active
                        ? "border-burgundy text-burgundy"
                        : "border-transparent text-ink hover:text-burgundy",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
```

- [ ] **Step 5: Запустити тест — переконатись, що проходить**

Run: `pnpm test tests/component/widgets/role-header.test.tsx`
Expected: PASS — 4 tests.

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: без помилок.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/role-section-shell/role-nav-config.ts src/widgets/role-section-shell/role-header.tsx tests/component/widgets/role-header.test.tsx
git commit -m "feat(student): role cabinet header — nav config + RoleHeader

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Змонтувати RoleHeader у RoleSectionShell

**Files:**
- Modify: `src/widgets/role-section-shell/role-section-shell.tsx`
- Test: `tests/component/widgets/role-section-shell.test.tsx`

- [ ] **Step 1: Написати тест, що падає**

Файл `tests/component/widgets/role-section-shell.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { RoleSectionShell } from "@/widgets/role-section-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/student" }));

describe("RoleSectionShell", () => {
  it("монтує рольовий хедер над контентом і не лишає старого інлайн-лейбла", () => {
    render(
      <RoleSectionShell role="student">
        <p>дочірній вміст</p>
      </RoleSectionShell>,
    );
    // хедер: назва кабінету + посилання на сайт
    expect(screen.getByRole("link", { name: /На сайт/ })).toBeInTheDocument();
    expect(screen.getByText("Кабінет учня")).toBeInTheDocument();
    // контент
    expect(screen.getByText("дочірній вміст")).toBeInTheDocument();
    // старий лейбл «▌ Кабінет учня» прибрано
    expect(screen.queryByText(/▌/)).toBeNull();
  });
});
```

- [ ] **Step 2: Запустити тест — переконатись, що падає**

Run: `pnpm test tests/component/widgets/role-section-shell.test.tsx`
Expected: FAIL — знайдено текст `▌ Кабінет учня` (старий лейбл ще на місці), `queryByText(/▌/)` не null.

- [ ] **Step 3: Оновити RoleSectionShell**

Замінити весь вміст `src/widgets/role-section-shell/role-section-shell.tsx` на:

```tsx
"use client";
import type { ReactNode } from "react";
import { Container } from "@/shared/ui";
import { RoleHeader } from "./role-header";

export function RoleSectionShell({
  role,
  children,
}: {
  role: "student" | "admin";
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <RoleHeader role={role} />
      <Container>{children}</Container>
    </main>
  );
}
```

- [ ] **Step 4: Запустити тест — переконатись, що проходить**

Run: `pnpm test tests/component/widgets/role-section-shell.test.tsx`
Expected: PASS — 1 test.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: без помилок.

- [ ] **Step 6: Commit**

```bash
git add src/widgets/role-section-shell/role-section-shell.tsx tests/component/widgets/role-section-shell.test.tsx
git commit -m "feat(student): mount RoleHeader in RoleSectionShell

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: AccountMonogram — презентаційне коло з літерою

**Files:**
- Create: `src/widgets/header/account-monogram.tsx`
- Test: `tests/component/widgets/account-monogram.test.tsx`

- [ ] **Step 1: Написати тест, що падає**

Файл `tests/component/widgets/account-monogram.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountMonogram } from "@/widgets/header/account-monogram";

describe("AccountMonogram", () => {
  it("рендерить передану літеру", () => {
    render(<AccountMonogram initial="О" />);
    expect(screen.getByText("О")).toBeInTheDocument();
  });

  it("застосовує className викликача", () => {
    render(<AccountMonogram initial="О" className="h-8 w-8" />);
    expect(screen.getByText("О").className).toMatch(/h-8/);
  });
});
```

- [ ] **Step 2: Запустити тест — переконатись, що падає**

Run: `pnpm test tests/component/widgets/account-monogram.test.tsx`
Expected: FAIL — `Failed to resolve import "@/widgets/header/account-monogram"`.

- [ ] **Step 3: Створити компонент**

Файл `src/widgets/header/account-monogram.tsx`:

```tsx
import { cn } from "@/shared/lib";

/**
 * Кругла монограма з першою літерою імені.
 * Розмір, фон і розмір тексту задає викликач через `className` —
 * компонент володіє лише версткою кола й сімейством шрифту.
 */
export function AccountMonogram({
  initial,
  className,
}: {
  initial: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-bold leading-none",
        className,
      )}
    >
      {initial}
    </span>
  );
}
```

- [ ] **Step 4: Запустити тест — переконатись, що проходить**

Run: `pnpm test tests/component/widgets/account-monogram.test.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 5: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: без помилок.

- [ ] **Step 6: Commit**

```bash
git add src/widgets/header/account-monogram.tsx tests/component/widgets/account-monogram.test.tsx
git commit -m "feat(header): account monogram presentational component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: useAccountIdentity + AccountControl + вмонтувати в Header

**Files:**
- Create: `src/widgets/header/use-account-identity.ts`
- Create: `src/widgets/header/account-control.tsx`
- Modify: `src/widgets/header/header.tsx:5` (import), `src/widgets/header/header.tsx:99-105` (рендер)
- Test: `tests/component/widgets/account-control.test.tsx`

- [ ] **Step 1: Написати тест, що падає**

Файл `tests/component/widgets/account-control.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setSnapshot } from "@/shared/api/auth-token";
import { getMe } from "@/shared/api/generated/user-account/user-account";
import { AccountControl } from "@/widgets/header/account-control";

vi.mock("@/shared/api/generated/user-account/user-account", () => ({
  getMe: vi.fn(),
}));

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("AccountControl", () => {
  beforeEach(() => {
    setSnapshot(null);
    vi.mocked(getMe).mockReset();
  });

  it("незалогінений → іконка-посилання на кабінет, без монограми", () => {
    wrap(<AccountControl dark={false} />);
    expect(screen.getByRole("link", { name: "Кабінет" })).toBeInTheDocument();
    expect(screen.queryByText("О")).toBeNull();
  });

  it("залогінений → монограма з першою літерою імені", async () => {
    setSnapshot({
      accessToken: "t",
      userId: "u",
      role: "STUDENT",
      expiresAt: Date.now() + 1_000_000,
    });
    vi.mocked(getMe).mockResolvedValue({ firstName: "Олег" });
    wrap(<AccountControl dark={false} />);
    expect(await screen.findByText("О")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Запустити тест — переконатись, що падає**

Run: `pnpm test tests/component/widgets/account-control.test.tsx`
Expected: FAIL — `Failed to resolve import "@/widgets/header/account-control"`.

- [ ] **Step 3: Створити хук useAccountIdentity**

Файл `src/widgets/header/use-account-identity.ts`:

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

/**
 * Ідентичність користувача для хедера. Токен-снепшот читається напряму з
 * `shared/api` (той самий external store, що його юзає AuthProvider) — бо віджети
 * за FSD не можуть імпортувати `useAuth` із шару `_app`. Ім'я тягнеться з `GET /me`.
 */
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

- [ ] **Step 4: Створити компонент AccountControl**

Файл `src/widgets/header/account-control.tsx`:

```tsx
"use client";
import Link from "next/link";
import { User } from "lucide-react";
import { cn } from "@/shared/lib";
import { AccountMonogram } from "./account-monogram";
import { useAccountIdentity } from "./use-account-identity";

/**
 * Контрол акаунта в публічному хедері (видимий із `sm`).
 * Залогінений із завантаженим іменем → монограма; інакше → іконка `<User>`.
 */
export function AccountControl({ dark }: { dark: boolean }) {
  const { isAuthenticated, initial } = useAccountIdentity();

  if (isAuthenticated && initial) {
    return (
      <Link
        href="/account"
        aria-label="Кабінет"
        className="hidden transition-transform duration-d1 ease-paper hover:-translate-y-0.5 active:scale-90 sm:block"
      >
        <AccountMonogram
          initial={initial}
          className={cn("h-8 w-8 text-small", dark ? "bg-bg-warm text-ink" : "bg-burgundy text-bg-warm")}
        />
      </Link>
    );
  }

  return (
    <Link
      href="/account"
      aria-label="Кабінет"
      className="hidden transition-[color,transform] duration-d1 ease-paper hover:-translate-y-0.5 hover:text-burgundy active:scale-90 sm:block"
    >
      <User size={20} strokeWidth={1.5} />
    </Link>
  );
}
```

- [ ] **Step 5: Запустити тест — переконатись, що проходить**

Run: `pnpm test tests/component/widgets/account-control.test.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 6: Вмонтувати AccountControl у Header**

У `src/widgets/header/header.tsx`:

1. Рядок 5 — прибрати `User` з імпорту lucide (більше не використовується в цьому файлі):

```tsx
import { Search, Menu } from "lucide-react";
```

2. Додати імпорт після рядка 10 (`import { useHeaderState } ...`):

```tsx
import { AccountControl } from "./account-control";
```

3. Замінити блок (поточні рядки 99–105):

```tsx
            <Link
              href="/account"
              className="hidden transition-[color,transform] duration-d1 ease-paper hover:-translate-y-0.5 hover:text-burgundy active:scale-90 sm:block"
              aria-label="Кабінет"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
```

на:

```tsx
            <AccountControl dark={dark} />
```

- [ ] **Step 7: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: без помилок (`User` більше не імпортується «вхолосту»).

- [ ] **Step 8: Build — переконатись, що RSC/CSR межі цілі**

Run: `pnpm build`
Expected: успішна збірка.

- [ ] **Step 9: Commit**

```bash
git add src/widgets/header/use-account-identity.ts src/widgets/header/account-control.tsx src/widgets/header/header.tsx tests/component/widgets/account-control.test.tsx
git commit -m "feat(header): account control — monogram when authenticated

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: DrawerAccount + вмонтувати в MobileDrawer

**Files:**
- Create: `src/widgets/header/drawer-account.tsx`
- Modify: `src/widgets/header/mobile-drawer.tsx:6` (import), `mobile-drawer.tsx:111-112` (рендер між шапкою і `<nav>`)
- Test: `tests/component/widgets/drawer-account.test.tsx`

- [ ] **Step 1: Написати тест, що падає**

Файл `tests/component/widgets/drawer-account.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setSnapshot } from "@/shared/api/auth-token";
import { getMe } from "@/shared/api/generated/user-account/user-account";
import { DrawerAccount } from "@/widgets/header/drawer-account";

vi.mock("@/shared/api/generated/user-account/user-account", () => ({
  getMe: vi.fn(),
}));

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("DrawerAccount", () => {
  beforeEach(() => {
    setSnapshot(null);
    vi.mocked(getMe).mockReset();
  });

  it("незалогінений → запрошення увійти в кабінет", () => {
    wrap(<DrawerAccount onNavigate={vi.fn()} />);
    expect(screen.getByRole("link", { name: /Увійти в кабінет/ })).toHaveAttribute(
      "href",
      "/account",
    );
  });

  it("залогінений учень → ім'я та лейбл ролі", async () => {
    setSnapshot({
      accessToken: "t",
      userId: "u",
      role: "STUDENT",
      expiresAt: Date.now() + 1_000_000,
    });
    vi.mocked(getMe).mockResolvedValue({ firstName: "Олег" });
    wrap(<DrawerAccount onNavigate={vi.fn()} />);
    expect(await screen.findByText("Олег")).toBeInTheDocument();
    expect(screen.getByText("Кабінет учня")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Запустити тест — переконатись, що падає**

Run: `pnpm test tests/component/widgets/drawer-account.test.tsx`
Expected: FAIL — `Failed to resolve import "@/widgets/header/drawer-account"`.

- [ ] **Step 3: Створити компонент DrawerAccount**

Файл `src/widgets/header/drawer-account.tsx`:

```tsx
"use client";
import Link from "next/link";
import { User } from "lucide-react";
import { AccountMonogram } from "./account-monogram";
import { useAccountIdentity } from "./use-account-identity";

const roleLabel: Record<"STUDENT" | "PARENT" | "ADMIN", string> = {
  STUDENT: "Кабінет учня",
  PARENT: "Батьківський кабінет",
  ADMIN: "Адміністрування",
};

/** Блок акаунта у мобільному drawer. `onNavigate` закриває шухляду при кліку. */
export function DrawerAccount({ onNavigate }: { onNavigate: () => void }) {
  const { isAuthenticated, initial, displayName, role } = useAccountIdentity();
  const rowClass =
    "group flex items-center gap-4 border-b-2 border-dashed border-line-strong px-6 py-5";
  const arrow = (
    <span className="font-body text-burgundy transition-transform duration-d2 ease-paper group-hover:translate-x-1">
      →
    </span>
  );

  if (isAuthenticated && initial && displayName) {
    return (
      <Link href="/account" onClick={onNavigate} className={rowClass}>
        <AccountMonogram
          initial={initial}
          className="h-11 w-11 shrink-0 bg-burgundy text-lead text-bg-warm"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-h3 italic text-burgundy">
            {displayName}
          </span>
          <span className="mt-0.5 block font-hand text-hand-s text-ink-soft">
            {role ? roleLabel[role] : "Мій кабінет"}
          </span>
        </span>
        {arrow}
      </Link>
    );
  }

  return (
    <Link href="/account" onClick={onNavigate} className={rowClass}>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink">
        <User size={20} strokeWidth={1.6} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-h3 italic text-burgundy">Увійти в кабінет</span>
        <span className="mt-0.5 block font-hand text-hand-s text-ink-soft">
          учень · батьки · адмін
        </span>
      </span>
      {arrow}
    </Link>
  );
}
```

- [ ] **Step 4: Запустити тест — переконатись, що проходить**

Run: `pnpm test tests/component/widgets/drawer-account.test.tsx`
Expected: PASS — 2 tests.

- [ ] **Step 5: Вмонтувати DrawerAccount у MobileDrawer**

У `src/widgets/header/mobile-drawer.tsx`:

1. Додати імпорт після рядка 7 (`import { cn } from "@/shared/lib";`):

```tsx
import { DrawerAccount } from "./drawer-account";
```

2. Вставити `<DrawerAccount />` між закриттям блоку шапки (`</div>` поточного рядка 111) і відкриттям `<nav>` (поточний рядок 114). Тобто одразу після коментаря-блоку шапки, перед `{/* Індекс архіву */}`:

```tsx
        </div>

        {/* Блок акаунта — над індексом розділів */}
        <DrawerAccount onNavigate={onClose} />

        {/* Індекс архіву */}
        <nav className="flex-1 px-6">
```

- [ ] **Step 6: Typecheck + lint**

Run: `pnpm typecheck && pnpm lint`
Expected: без помилок.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/header/drawer-account.tsx src/widgets/header/mobile-drawer.tsx tests/component/widgets/drawer-account.test.tsx
git commit -m "feat(header): account block in mobile drawer

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Повна верифікація

**Files:** немає змін коду — лише прогін перевірок.

- [ ] **Step 1: Повний composite-verify**

Run: `pnpm verify`
Expected: green — `typecheck && lint && test && scan-images && build && e2e --grep @smoke`.

Якщо `e2e` падає через невзяте середовище — мінімально прогнати решту: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`, а e2e окремо за наявності dev-стенду.

- [ ] **Step 2: Ручна перевірка в браузері**

Run: `pnpm dev`, далі Playwright headed або вручну:
- `/student` — видно рольовий хедер: лого, «Кабінет учня», таби «Панель/Мої роботи/Фінанси», «← На сайт». Активний таб підсвічено burgundy.
- Перехід на `/student/products` — активний таб переїхав на «Мої роботи».
- Клік «← На сайт» — перехід на `/`.
- `/admin` — таби «Панель/Модерація/Виплати/Звіти/2FA».
- Публічний хедер залогіненим учнем — замість іконки кругла монограма з літерою імені.
- Мобільна ширина (`< sm`) — відкрити drawer: під шапкою «зміст випуску» блок акаунта (монограма + ім'я + роль, або «Увійти в кабінет»).

- [ ] **Step 3: Фінальний коміт (за потреби)**

Якщо `scan-images`/`format` щось змінили — закомітити:

```bash
git add -A
git commit -m "chore(header): verification pass for cabinet navigation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

Якщо змін немає — кроку не потрібно.

---

## Self-Review

**Spec coverage:**
- Частина 1 (рольовий хедер) → Task 1 + Task 2. ✓
- Частина 2 (`useAccountIdentity` + `AccountMonogram`) → Task 3 (monogram) + Task 4 (hook). ✓
- Частина 3 (десктопний `AccountControl` + правка `header.tsx`) → Task 4. ✓
- Частина 4 (блок акаунта в drawer) → Task 5. ✓
- Verification gate → Task 6. ✓

**Type consistency:**
- `RoleNavItem` / `roleNav` / `roleTitle` — означені в Task 1, спожиті в `role-header.tsx` (Task 1). ✓
- `AccountIdentity` поля (`isAuthenticated`, `initial`, `displayName`, `role`) — означені в Task 4, спожиті `AccountControl` (Task 4: `isAuthenticated`, `initial`) і `DrawerAccount` (Task 5: усі чотири). ✓
- `AccountMonogram` props `{ initial, className }` — Task 3; виклики в Task 4 і Task 5 передають саме їх. ✓
- `role` у `AccountIdentity` має тип `"STUDENT" | "PARENT" | "ADMIN" | null`; `roleLabel` у Task 5 — `Record` саме цих трьох ключів, доступ під охороною `role ? roleLabel[role] : …`. ✓
- `DrawerAccount` props `{ onNavigate }` — Task 5; `mobile-drawer.tsx` передає `onNavigate={onClose}`. ✓
- `RoleHeader` props `{ role: "student" | "admin" }` — Task 1; `RoleSectionShell` передає `role` того ж типу. ✓

**Placeholder scan:** код повний у кожному кроці, без TBD/TODO. ✓

**Note:** `useAccountIdentity` використовує `queryKey: ["me"]` — окремий запис кешу від `studentKeys.me()` у student-dashboard. Це свідомо: дешевий ендпоінт, уникаємо зчеплення віджета з фабрикою ключів student-домену.
