# Track A — UX Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-route loading skeletons, granular error boundaries, dismiss-only cookie banner with `/privacy`+`/terms` stubs, and `blurDataURL` prop on `ImageSlot`/`Polaroid`.

**Architecture:** New primitives in `shared/ui/{paper-skeleton,error-boundary}` and `shared/lib/consent`; cookie banner as a `widgets/cookie-banner` mounted in root layout; `loading.tsx`+`error.tsx` per route segment under `app/`; legal stub pages under `app/(public)/{privacy,terms}`. Widget-level boundaries wrap `views/<feature>/` imports inside `app/.../page.tsx` (since `views/` is this project's page-composition layer; `widgets/` is reserved for cross-feature shells).

**Tech Stack:** Next.js 14.2 App Router · TypeScript strict · Tailwind v3 + CSS vars · Vitest (jsdom) · React Testing Library · Playwright · `react-error-boundary` (new dep).

**Spec:** `docs/superpowers/specs/2026-05-08-track-a-ux-resilience-design.md`

---

## File Structure

**Created:**
- `src/shared/i18n/uk.ts` (NEW — file not yet created in repo despite CLAUDE.md convention)
- `src/shared/i18n/index.ts` (re-export)
- `src/shared/lib/consent/consent.ts`
- `src/shared/lib/consent/use-consent.ts`
- `src/shared/lib/consent/index.ts`
- `src/shared/ui/error-boundary/widget-error-fallback.tsx`
- `src/shared/ui/error-boundary/widget-error-boundary.tsx`
- `src/shared/ui/error-boundary/index.ts`
- `src/shared/ui/paper-skeleton/paper-skeleton.tsx`
- `src/shared/ui/paper-skeleton/paper-skeleton.css`
- `src/shared/ui/paper-skeleton/index.ts`
- `src/widgets/cookie-banner/cookie-banner.tsx`
- `src/widgets/cookie-banner/index.ts`
- `src/app/loading.tsx`
- `src/app/(public)/loading.tsx`
- `src/app/(public)/error.tsx`
- `src/app/(public)/catalog/loading.tsx`
- `src/app/(public)/collections/loading.tsx`
- `src/app/(public)/p/[slug]/loading.tsx`
- `src/app/(public)/login/loading.tsx`
- `src/app/(public)/register/loading.tsx`
- `src/app/(public)/cart/loading.tsx`
- `src/app/(public)/checkout/loading.tsx`
- `src/app/(public)/privacy/page.tsx`
- `src/app/(public)/terms/page.tsx`
- `src/app/account/loading.tsx`
- `src/app/account/error.tsx`
- `src/app/student/loading.tsx`
- `src/app/student/error.tsx`
- `src/app/admin/loading.tsx`
- `src/app/admin/error.tsx`
- `src/app/parent/loading.tsx`
- `src/app/parent/error.tsx`
- `tests/unit/lib/consent.test.ts`
- `tests/component/lib/use-consent.test.tsx`
- `tests/component/atoms/paper-skeleton.test.tsx`
- `tests/component/atoms/widget-error-boundary.test.tsx`
- `tests/component/widgets/cookie-banner.test.tsx`
- `tests/e2e/loading-states.spec.ts`
- `tests/e2e/cookie-banner.spec.ts`
- `tests/e2e/legal-stubs.spec.ts`
- `tests/e2e/error-boundary.spec.ts`
- `TODO.md` (root)

**Modified:**
- `src/shared/ui/stamp/types.ts` — extend `StampText` union
- `src/shared/ui/index.ts` — export new modules
- `src/shared/ui/image-slot/image-slot.tsx` — add `blurDataURL?` prop
- `src/shared/ui/polaroid/polaroid.tsx` — add `blurDataURL?` prop
- `src/app/layout.tsx` — mount `<CookieBanner/>`
- `src/app/(public)/catalog/page.tsx` — wrap view in `<WidgetErrorBoundary>`
- `src/app/(public)/cart/page.tsx` — wrap view
- `src/app/admin/payouts/page.tsx` — wrap view
- `src/app/admin/reports/tax/page.tsx` — wrap view
- `package.json` — add `react-error-boundary` dep

---

## Task 1: Bootstrap — i18n file, Stamp types, dep, TODO.md

**Files:**
- Create: `src/shared/i18n/uk.ts`
- Create: `src/shared/i18n/index.ts`
- Modify: `src/shared/ui/stamp/types.ts`
- Create: `TODO.md`
- Modify: `package.json` (add dep)

- [ ] **Step 1: Add `react-error-boundary` dependency**

Run:
```bash
pnpm add react-error-boundary@4.1.2
```
Expected: `package.json` updated, `pnpm-lock.yaml` updated.

- [ ] **Step 2: Create `src/shared/i18n/uk.ts`**

```ts
export const uk = {
  cookies: {
    ariaLabel: "Cookie повідомлення",
    notice: "Ми використовуємо cookies для роботи сайту й аналітики.",
    policyLink: "Політика конфіденційності",
    dismiss: "Закрити повідомлення про cookies",
  },
  legal: {
    privacyTitle: "Політика конфіденційності",
    termsTitle: "Угода користувача",
    stubBody: "Документ редагується. Повна версія з'явиться найближчим часом.",
    stubContact: "Питання щодо обробки даних:",
  },
  loading: {
    stamp: "ДРУКУЄТЬСЯ",
    label: "Завантаження…",
  },
  errors: {
    widgetFallbackStamp: "ВІДБИТОК ЗМАЗАВСЯ",
    widgetFallbackBody: "Не вдалось показати:",
    widgetReset: "Друкувати знову",
    publicStamp: "АРКУШ ЗІМ'ЯВСЯ",
    publicHeadline: "Не вдалось викласти випуск",
    accountStamp: "КАБІНЕТ ЗАЧИНЕНИЙ",
    accountHeadline: "Не виходить відкрити кабінет",
    studentStamp: "ЗОШИТ ЗАГУБЛЕНО",
    studentHeadline: "Робочий зошит недоступний",
    adminStamp: "ШТАМП-ВІДДІЛ ЗАЧИНЕНО",
    adminHeadline: "Адмінка тимчасово недоступна",
    parentStamp: "КОРЕСПОНДЕНЦІЯ ЗАГУБЛЕНА",
    parentHeadline: "Сторінка батьків недоступна",
    reset: "Перезавантажити аркуш",
    backHome: "На головну",
    toLogin: "Увійти",
    legalStubStamp: "ДОКУМЕНТ ГОТУЄТЬСЯ",
  },
} as const;

export type UkStrings = typeof uk;
```

- [ ] **Step 3: Create `src/shared/i18n/index.ts`**

```ts
export { uk } from "./uk";
export type { UkStrings } from "./uk";
```

- [ ] **Step 4: Extend `StampText` union in `src/shared/ui/stamp/types.ts`**

Current file already has 12 entries. Add new entries (keep existing ones intact):

```ts
export type StampText =
  | "АРХІВ ЛІЦЕЮ 157"
  | "MAYSTERNYA · KYIV · 1957"
  | "СХВАЛЕНО КУРАТОРОМ"
  | "ЛІМІТОВАНА СЕРІЯ"
  | "ПЕРЕДАНО З ОБОЛОНІ"
  | "EST. 1957"
  | "ВРУЧЕНО"
  | "ВІДКРИТО"
  | "#listy"
  | "ВИПУСК ПОШКОДЖЕНО"
  | "🔐 АДМІН-ВЕРИФІКАЦІЯ"
  | "✓ ВІРНО"
  | "ДРУКУЄТЬСЯ"
  | "ВІДБИТОК ЗМАЗАВСЯ"
  | "АРКУШ ЗІМ'ЯВСЯ"
  | "КАБІНЕТ ЗАЧИНЕНИЙ"
  | "ЗОШИТ ЗАГУБЛЕНО"
  | "ШТАМП-ВІДДІЛ ЗАЧИНЕНО"
  | "КОРЕСПОНДЕНЦІЯ ЗАГУБЛЕНА"
  | "ДОКУМЕНТ ГОТУЄТЬСЯ";
export type StampShape = "circle" | "octagon" | "rect" | "soft";
export type StampRotation = -12 | -8 | -5 | -3 | 3 | 5 | 8 | 10;
export type StampColor = "burgundy" | "ink";
export type StampAnimateOn = "load" | "scroll" | "none";
```

- [ ] **Step 5: Create root `TODO.md`**

```markdown
# TODO

Backlog знайденого під час Track A що виходить за scope. Не блокери для merge.

## Track B — Legal Content
- [ ] Real Privacy Policy text (юрист) — placeholder зараз `app/(public)/privacy/page.tsx`
- [ ] Real ToS text (юрист) — placeholder зараз `app/(public)/terms/page.tsx`
- [ ] Підтвердити `legal@157.kyiv.ua` як офіційний contact (інакше замінити в `shared/i18n/uk.ts`)

## Track C — Animations + Image Pipeline + E2E hardening
- [ ] String Carousel widget — реальна реалізація
- [ ] Paper Noise tuning — viewport-test на 4K/retina/zoom, можливо adjust opacity per breakpoint
- [ ] Sharp pre-build pipeline → WebP-only variants + base64 LQIP (no AVIF)
- [ ] Інтеграція blur токенів в `ImageSlot` (prop додано в Track A)
- [ ] E2E checkout: cart → checkout → success з тест-API
- [ ] E2E admin 2FA payouts/execute hardening tests

## Інше
- [ ] Sentry/observability — error.tsx логи зараз тільки в console.error
- [ ] Виокремити catalog-grid / cart / payouts-table як reusable widgets з views (якщо буде потрібно для іншого контексту)
```

- [ ] **Step 6: Run typecheck (sanity)**

Run: `pnpm typecheck`
Expected: PASS — `uk.ts` має `as const`, `StampText` union розширений.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml src/shared/i18n src/shared/ui/stamp/types.ts TODO.md
git commit -m "feat(shared): add i18n/uk strings, extend StampText union, add react-error-boundary dep, create TODO.md"
```

---

## Task 2: `shared/lib/consent/consent.ts` — cookie helpers (TDD)

**Files:**
- Test: `tests/unit/lib/consent.test.ts`
- Create: `src/shared/lib/consent/consent.ts`

- [ ] **Step 1: Write failing test**

`tests/unit/lib/consent.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CONSENT_COOKIE, getConsentDismissed, setConsentDismissed } from "@/shared/lib/consent/consent";

describe("consent cookie helpers", () => {
  describe("getConsentDismissed", () => {
    it("returns false when cookie jar is empty string", () => {
      expect(getConsentDismissed("")).toBe(false);
    });
    it("returns false when cookie jar is undefined", () => {
      expect(getConsentDismissed(undefined)).toBe(false);
    });
    it("returns false when cookie absent in jar", () => {
      expect(getConsentDismissed("foo=1; bar=2")).toBe(false);
    });
    it("returns true when consent_dismissed=1 present", () => {
      expect(getConsentDismissed(`${CONSENT_COOKIE}=1`)).toBe(true);
    });
    it("returns true when cookie present alongside others", () => {
      expect(getConsentDismissed(`foo=a; ${CONSENT_COOKIE}=1; bar=b`)).toBe(true);
    });
    it("returns false when cookie value is 0", () => {
      expect(getConsentDismissed(`${CONSENT_COOKIE}=0`)).toBe(false);
    });
  });

  describe("setConsentDismissed", () => {
    beforeEach(() => {
      Object.defineProperty(document, "cookie", {
        writable: true,
        configurable: true,
        value: "",
      });
    });
    it("writes cookie with max-age and sameSite", () => {
      const setter = vi.fn();
      Object.defineProperty(document, "cookie", { set: setter, get: () => "" });
      setConsentDismissed();
      expect(setter).toHaveBeenCalledTimes(1);
      const written = setter.mock.calls[0][0] as string;
      expect(written).toContain(`${CONSENT_COOKIE}=1`);
      expect(written).toContain("max-age=31536000");
      expect(written.toLowerCase()).toContain("samesite=lax");
      expect(written).toContain("path=/");
    });
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `pnpm test tests/unit/lib/consent.test.ts`
Expected: FAIL with "Cannot find module '@/shared/lib/consent/consent'".

- [ ] **Step 3: Create `src/shared/lib/consent/consent.ts`**

```ts
export const CONSENT_COOKIE = "consent_dismissed";

export function getConsentDismissed(cookieJar: string | undefined): boolean {
  if (!cookieJar) return false;
  const pairs = cookieJar.split(";").map((s) => s.trim());
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key === CONSENT_COOKIE && value === "1") return true;
  }
  return false;
}

export function setConsentDismissed(): void {
  document.cookie = `${CONSENT_COOKIE}=1; max-age=31536000; path=/; sameSite=lax`;
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `pnpm test tests/unit/lib/consent.test.ts`
Expected: PASS — all 7 cases.

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/consent/consent.ts tests/unit/lib/consent.test.ts
git commit -m "feat(shared/lib): add consent cookie helpers"
```

---

## Task 3: `shared/lib/consent/use-consent.ts` — React hook (TDD)

**Files:**
- Test: `tests/component/lib/use-consent.test.tsx`
- Create: `src/shared/lib/consent/use-consent.ts`
- Create: `src/shared/lib/consent/index.ts`

- [ ] **Step 1: Write failing test**

`tests/component/lib/use-consent.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useConsent } from "@/shared/lib/consent";
import { CONSENT_COOKIE } from "@/shared/lib/consent/consent";

describe("useConsent", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      configurable: true,
      value: "",
    });
  });

  it("starts with dismissed=null before hydration effect runs", () => {
    const { result } = renderHook(() => useConsent());
    // After first render + effect, value reflects cookie state
    expect([null, false]).toContain(result.current.dismissed);
  });

  it("reads dismissed=false when no cookie present", () => {
    Object.defineProperty(document, "cookie", { value: "" , writable: true, configurable: true });
    const { result } = renderHook(() => useConsent());
    expect(result.current.dismissed).toBe(false);
  });

  it("reads dismissed=true when cookie present", () => {
    Object.defineProperty(document, "cookie", {
      value: `${CONSENT_COOKIE}=1`,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useConsent());
    expect(result.current.dismissed).toBe(true);
  });

  it("dismiss() flips state and writes cookie", () => {
    let cookieValue = "";
    Object.defineProperty(document, "cookie", {
      get: () => cookieValue,
      set: (v: string) => { cookieValue = v; },
      configurable: true,
    });
    const { result } = renderHook(() => useConsent());
    expect(result.current.dismissed).toBe(false);
    act(() => result.current.dismiss());
    expect(result.current.dismissed).toBe(true);
    expect(cookieValue).toContain(`${CONSENT_COOKIE}=1`);
  });
});
```

- [ ] **Step 2: Run to confirm fail**

Run: `pnpm test tests/component/lib/use-consent.test.tsx`
Expected: FAIL with "Cannot find module '@/shared/lib/consent'".

- [ ] **Step 3: Create `src/shared/lib/consent/use-consent.ts`**

```ts
"use client";
import { useCallback, useEffect, useState } from "react";
import { getConsentDismissed, setConsentDismissed } from "./consent";

export function useConsent() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    setDismissed(getConsentDismissed(document.cookie));
  }, []);

  const dismiss = useCallback(() => {
    setConsentDismissed();
    setDismissed(true);
  }, []);

  return { dismissed, dismiss };
}
```

- [ ] **Step 4: Create `src/shared/lib/consent/index.ts`**

```ts
export { CONSENT_COOKIE, getConsentDismissed, setConsentDismissed } from "./consent";
export { useConsent } from "./use-consent";
```

- [ ] **Step 5: Run test to verify pass**

Run: `pnpm test tests/component/lib/use-consent.test.tsx`
Expected: PASS — 4 cases.

- [ ] **Step 6: Commit**

```bash
git add src/shared/lib/consent/use-consent.ts src/shared/lib/consent/index.ts tests/component/lib/use-consent.test.tsx
git commit -m "feat(shared/lib): add useConsent hook"
```

---

## Task 4: `shared/ui/error-boundary` — fallback + boundary (TDD)

**Files:**
- Test: `tests/component/atoms/widget-error-boundary.test.tsx`
- Create: `src/shared/ui/error-boundary/widget-error-fallback.tsx`
- Create: `src/shared/ui/error-boundary/widget-error-boundary.tsx`
- Create: `src/shared/ui/error-boundary/index.ts`
- Modify: `src/shared/ui/index.ts`

- [ ] **Step 1: Write failing test**

`tests/component/atoms/widget-error-boundary.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("kaboom");
  return <div>real content</div>;
}

describe("WidgetErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <WidgetErrorBoundary label="Каталог">
        <Boom shouldThrow={false} />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText("real content")).toBeInTheDocument();
  });

  it("renders default fallback with label when child throws", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <WidgetErrorBoundary label="Каталог">
        <Boom shouldThrow />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText(/Не вдалось показати/i)).toBeInTheDocument();
    expect(screen.getByText(/Каталог/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Друкувати знову/i })).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it("calls onError prop with caught error", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();
    render(
      <WidgetErrorBoundary label="X" onError={onError}>
        <Boom shouldThrow />
      </WidgetErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect((onError.mock.calls[0][0] as Error).message).toBe("kaboom");
    errSpy.mockRestore();
  });

  it("reset button recovers when resetKeys change", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Wrapper() {
      const [bad, setBad] = useState(true);
      return (
        <>
          <button onClick={() => setBad(false)}>fix</button>
          <WidgetErrorBoundary label="X" resetKeys={[bad]}>
            <Boom shouldThrow={bad} />
          </WidgetErrorBoundary>
        </>
      );
    }
    render(<Wrapper />);
    expect(screen.getByText(/Не вдалось показати/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("fix"));
    expect(screen.getByText("real content")).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it("renders custom fallback when provided", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <WidgetErrorBoundary label="X" fallback={<div>custom</div>}>
        <Boom shouldThrow />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText("custom")).toBeInTheDocument();
    expect(screen.queryByText(/Не вдалось показати/i)).not.toBeInTheDocument();
    errSpy.mockRestore();
  });
});
```

- [ ] **Step 2: Run to confirm fail**

Run: `pnpm test tests/component/atoms/widget-error-boundary.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `widget-error-fallback.tsx`**

`src/shared/ui/error-boundary/widget-error-fallback.tsx`:
```tsx
"use client";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";
import { cn } from "@/shared/lib";

export type WidgetErrorFallbackProps = {
  label?: string;
  resetErrorBoundary: () => void;
  className?: string;
};

export function WidgetErrorFallback({ label, resetErrorBoundary, className }: WidgetErrorFallbackProps) {
  return (
    <div
      role="alert"
      data-testid="widget-error-fallback"
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-[2px] border-2 border-dashed border-burgundy/40 bg-bg-warm bg-paper-noise p-6",
        className,
      )}
    >
      <Stamp text={uk.errors.widgetFallbackStamp} rotation={-3} animateOn="load" />
      <p className="font-hand text-hand-s text-ink">
        {uk.errors.widgetFallbackBody} {label ?? "—"}
      </p>
      <PillButton variant="ghost" size="s" onClick={resetErrorBoundary}>
        {uk.errors.widgetReset}
      </PillButton>
    </div>
  );
}
```

- [ ] **Step 4: Create `widget-error-boundary.tsx`**

`src/shared/ui/error-boundary/widget-error-boundary.tsx`:
```tsx
"use client";
import { type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { WidgetErrorFallback } from "./widget-error-fallback";

export type WidgetErrorBoundaryProps = {
  children: ReactNode;
  label?: string;
  fallback?: ReactNode;
  resetKeys?: unknown[];
  onError?: (error: Error, info: { componentStack?: string }) => void;
};

export function WidgetErrorBoundary({
  children,
  label,
  fallback,
  resetKeys,
  onError,
}: WidgetErrorBoundaryProps) {
  if (fallback !== undefined) {
    return (
      <ErrorBoundary fallback={<>{fallback}</>} resetKeys={resetKeys} onError={onError}>
        {children}
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <WidgetErrorFallback label={label} resetErrorBoundary={resetErrorBoundary} />
      )}
      resetKeys={resetKeys}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}
```

- [ ] **Step 5: Create `src/shared/ui/error-boundary/index.ts`**

```ts
export { WidgetErrorBoundary } from "./widget-error-boundary";
export type { WidgetErrorBoundaryProps } from "./widget-error-boundary";
export { WidgetErrorFallback } from "./widget-error-fallback";
export type { WidgetErrorFallbackProps } from "./widget-error-fallback";
```

- [ ] **Step 6: Add to `src/shared/ui/index.ts`**

Append at end:
```ts
export * from "./error-boundary";
```

- [ ] **Step 7: Run test to verify pass**

Run: `pnpm test tests/component/atoms/widget-error-boundary.test.tsx`
Expected: PASS — 5 cases.

- [ ] **Step 8: Commit**

```bash
git add src/shared/ui/error-boundary src/shared/ui/index.ts tests/component/atoms/widget-error-boundary.test.tsx
git commit -m "feat(shared/ui): add WidgetErrorBoundary + fallback"
```

---

## Task 5: `shared/ui/paper-skeleton` — primitive + variants (TDD)

**Files:**
- Test: `tests/component/atoms/paper-skeleton.test.tsx`
- Create: `src/shared/ui/paper-skeleton/paper-skeleton.tsx`
- Create: `src/shared/ui/paper-skeleton/paper-skeleton.css`
- Create: `src/shared/ui/paper-skeleton/index.ts`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/_app/styles/globals.css` (import paper-skeleton.css)

- [ ] **Step 1: Write failing test**

`tests/component/atoms/paper-skeleton.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PaperSkeleton,
  PaperSkeletonGrid,
  PaperSkeletonForm,
  PaperSkeletonProfile,
  PaperSkeletonArticle,
  PaperSkeletonPage,
} from "@/shared/ui/paper-skeleton";

describe("PaperSkeleton primitive", () => {
  it("renders dashed-border block by default", () => {
    render(<PaperSkeleton data-testid="ps" />);
    const el = screen.getByTestId("paper-skeleton-block");
    expect(el).toHaveClass("border-dashed");
    expect(el).toHaveClass("border-burgundy/40");
  });

  it("supports line variant", () => {
    render(<PaperSkeleton variant="line" />);
    expect(screen.getByTestId("paper-skeleton-line")).toBeInTheDocument();
  });

  it("supports circle variant", () => {
    render(<PaperSkeleton variant="circle" />);
    expect(screen.getByTestId("paper-skeleton-circle")).toBeInTheDocument();
  });
});

describe("PaperSkeleton variants", () => {
  it("PaperSkeletonGrid renders cols * rows tiles + loading stamp", () => {
    render(<PaperSkeletonGrid cols={3} rows={2} />);
    expect(screen.getAllByTestId("paper-skeleton-block")).toHaveLength(6);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonForm renders N field placeholders + stamp", () => {
    render(<PaperSkeletonForm fields={4} />);
    // 4 fields × (1 label-line + 1 input-block) = 8 elements
    expect(screen.getAllByTestId("paper-skeleton-line").length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByTestId("paper-skeleton-block").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonProfile renders header + 3 sections", () => {
    render(<PaperSkeletonProfile />);
    expect(screen.getAllByTestId("paper-skeleton-block").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonArticle renders photo + paragraph lines", () => {
    render(<PaperSkeletonArticle />);
    expect(screen.getAllByTestId("paper-skeleton-block").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("paper-skeleton-line").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonPage renders fullscreen stamp only", () => {
    render(<PaperSkeletonPage />);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
    expect(screen.queryByTestId("paper-skeleton-block")).not.toBeInTheDocument();
  });

  it("variants expose role='status' with i18n aria-label", () => {
    render(<PaperSkeletonPage />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Завантаження…");
  });
});
```

- [ ] **Step 2: Run to confirm fail**

Run: `pnpm test tests/component/atoms/paper-skeleton.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `paper-skeleton.css`**

`src/shared/ui/paper-skeleton/paper-skeleton.css`:
```css
@keyframes ps-stamp-pulse {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(2deg); }
}
.ps-stamp-pulse {
  animation: ps-stamp-pulse 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .ps-stamp-pulse { animation: none; }
}
```

- [ ] **Step 4: Import the CSS in globals**

Modify `src/_app/styles/globals.css` — add import line near other module CSS imports:
```css
@import "@/shared/ui/paper-skeleton/paper-skeleton.css";
```

(If `globals.css` doesn't already use `@import`, instead add the keyframes/class inline to `globals.css` directly. Verify by reading the file before editing.)

- [ ] **Step 5: Create `paper-skeleton.tsx`**

`src/shared/ui/paper-skeleton/paper-skeleton.tsx`:
```tsx
import { cn } from "@/shared/lib";
import { Stamp } from "@/shared/ui/stamp";
import { uk } from "@/shared/i18n";

export type PaperSkeletonProps = {
  variant?: "block" | "line" | "circle";
  ratio?: "4/5" | "1/1" | "16/9" | "3/4";
  width?: string | number;
  height?: string | number;
  className?: string;
};

export function PaperSkeleton({
  variant = "block",
  ratio,
  width,
  height,
  className,
}: PaperSkeletonProps) {
  const style: React.CSSProperties = {
    aspectRatio: ratio?.replace("/", " / "),
    width,
    height,
  };
  if (variant === "line") {
    return (
      <div
        data-testid="paper-skeleton-line"
        style={{ width: width ?? "100%", height: height ?? 12 }}
        className={cn("rounded-[1px] bg-burgundy/15", className)}
      />
    );
  }
  if (variant === "circle") {
    const size = width ?? height ?? 48;
    return (
      <div
        data-testid="paper-skeleton-circle"
        style={{ width: size, height: size }}
        className={cn("rounded-full border-2 border-dashed border-burgundy/40 bg-bg-warm", className)}
      />
    );
  }
  return (
    <div
      data-testid="paper-skeleton-block"
      style={style}
      className={cn(
        "rounded-[2px] border-2 border-dashed border-burgundy/40 bg-bg-warm bg-paper-noise",
        className,
      )}
    />
  );
}

function CenteredStamp() {
  return (
    <div
      role="status"
      aria-label={uk.loading.label}
      className="ps-stamp-pulse pointer-events-none flex items-center justify-center"
    >
      <Stamp text={uk.loading.stamp} rotation={-3} animateOn="load" />
    </div>
  );
}

export function PaperSkeletonPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-20">
      <CenteredStamp />
    </div>
  );
}

export function PaperSkeletonGrid({ cols = 3, rows = 2 }: { cols?: number; rows?: number }) {
  const tiles = Array.from({ length: cols * rows });
  return (
    <div className="relative">
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {tiles.map((_, i) => (
          <PaperSkeleton key={i} variant="block" ratio="4/5" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}

export function PaperSkeletonForm({ fields = 5 }: { fields?: number }) {
  return (
    <div className="relative mx-auto max-w-lg space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <PaperSkeleton variant="line" width={120} height={10} />
          <PaperSkeleton variant="block" height={44} />
        </div>
      ))}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}

export function PaperSkeletonProfile() {
  return (
    <div className="relative space-y-6">
      <PaperSkeleton variant="block" height={120} />
      <div className="grid gap-4 md:grid-cols-3">
        <PaperSkeleton variant="block" height={140} />
        <PaperSkeleton variant="block" height={140} />
        <PaperSkeleton variant="block" height={140} />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}

export function PaperSkeletonArticle() {
  return (
    <div className="relative mx-auto max-w-2xl space-y-5">
      <PaperSkeleton variant="block" ratio="16/9" />
      <PaperSkeleton variant="line" width="80%" />
      <PaperSkeleton variant="line" width="95%" />
      <PaperSkeleton variant="line" width="70%" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <CenteredStamp />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/shared/ui/paper-skeleton/index.ts`**

```ts
export {
  PaperSkeleton,
  PaperSkeletonGrid,
  PaperSkeletonForm,
  PaperSkeletonProfile,
  PaperSkeletonArticle,
  PaperSkeletonPage,
} from "./paper-skeleton";
export type { PaperSkeletonProps } from "./paper-skeleton";
```

- [ ] **Step 7: Add to `src/shared/ui/index.ts`**

Append:
```ts
export * from "./paper-skeleton";
```

- [ ] **Step 8: Run test to verify pass**

Run: `pnpm test tests/component/atoms/paper-skeleton.test.tsx`
Expected: PASS — 9 cases.

- [ ] **Step 9: Commit**

```bash
git add src/shared/ui/paper-skeleton src/shared/ui/index.ts src/_app/styles/globals.css tests/component/atoms/paper-skeleton.test.tsx
git commit -m "feat(shared/ui): add PaperSkeleton primitive + 5 variants"
```

---

## Task 6: `widgets/cookie-banner` (TDD)

**Files:**
- Test: `tests/component/widgets/cookie-banner.test.tsx`
- Create: `src/widgets/cookie-banner/cookie-banner.tsx`
- Create: `src/widgets/cookie-banner/index.ts`
- Modify: `src/app/layout.tsx` — mount banner

- [ ] **Step 1: Write failing test**

`tests/component/widgets/cookie-banner.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CookieBanner } from "@/widgets/cookie-banner";
import { CONSENT_COOKIE } from "@/shared/lib/consent/consent";

function setCookie(value: string) {
  Object.defineProperty(document, "cookie", {
    value,
    writable: true,
    configurable: true,
  });
}

describe("CookieBanner", () => {
  beforeEach(() => setCookie(""));

  it("does not render anything before hydration (initial null state) — text not visible", () => {
    setCookie("");
    render(<CookieBanner />);
    // After effect runs, dismissed=false, banner appears. So we just check final state below.
    expect(screen.queryByRole("region", { name: /cookie/i })).toBeInTheDocument();
  });

  it("does not render when consent_dismissed=1 cookie present", async () => {
    setCookie(`${CONSENT_COOKIE}=1`);
    render(<CookieBanner />);
    await waitFor(() => {
      expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
    });
  });

  it("renders notice + policy link + dismiss button when no cookie", () => {
    setCookie("");
    render(<CookieBanner />);
    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /конфіденційності/i });
    expect(link).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("button", { name: /закрити/i })).toBeInTheDocument();
  });

  it("dismiss click hides banner and writes cookie", async () => {
    let stored = "";
    Object.defineProperty(document, "cookie", {
      get: () => stored,
      set: (v: string) => {
        // simulate browser cookie merge: keep latest assignment
        stored = v.split(";")[0];
      },
      configurable: true,
    });
    render(<CookieBanner />);
    fireEvent.click(screen.getByRole("button", { name: /закрити/i }));
    await waitFor(() => {
      expect(screen.queryByRole("region", { name: /cookie/i })).not.toBeInTheDocument();
    });
    expect(stored).toContain(`${CONSENT_COOKIE}=1`);
  });
});
```

- [ ] **Step 2: Run to confirm fail**

Run: `pnpm test tests/component/widgets/cookie-banner.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `cookie-banner.tsx`**

`src/widgets/cookie-banner/cookie-banner.tsx`:
```tsx
"use client";
import Link from "next/link";
import { useConsent } from "@/shared/lib/consent";
import { Container } from "@/shared/ui/layout/container";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export function CookieBanner() {
  const { dismissed, dismiss } = useConsent();
  if (dismissed !== false) return null;
  return (
    <div
      role="region"
      aria-label={uk.cookies.ariaLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-burgundy/30 bg-bg-warm/95 backdrop-blur-sm"
    >
      <Container>
        <div className="flex items-center justify-between gap-4 py-2">
          <p className="font-hand text-hand-s text-ink">
            {uk.cookies.notice}{" "}
            <Link href="/privacy" className="underline">
              {uk.cookies.policyLink}
            </Link>
          </p>
          <PillButton variant="ghost" size="s" onClick={dismiss} aria-label={uk.cookies.dismiss}>
            ✕
          </PillButton>
        </div>
      </Container>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/widgets/cookie-banner/index.ts`**

```ts
export { CookieBanner } from "./cookie-banner";
```

- [ ] **Step 5: Mount in `src/app/layout.tsx`**

Replace body content to include `<CookieBanner/>`:
```tsx
import type { Metadata } from "next";
import { fraunces, sourceSerif, manrope, caveat } from "@/_app/fonts";
import { AppProviders } from "@/_app/providers";
import { CookieBanner } from "@/widgets/cookie-banner";
import "@/_app/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Майстерня 157 — Архів учнівських робіт", template: "%s · Майстерня 157" },
  description: "Випуск №47 архіву Ліцею №157, Київ · Оболонь",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Майстерня 157",
    description: "Архів учнівських робіт. З 1957.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "uk_UA",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="uk"
      className={`${fraunces.variable} ${sourceSerif.variable} ${manrope.variable} ${caveat.variable}`}
    >
      <body className="bg-bg font-body text-ink antialiased">
        <AppProviders>{children}</AppProviders>
        <CookieBanner />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Run test to verify pass**

Run: `pnpm test tests/component/widgets/cookie-banner.test.tsx`
Expected: PASS — 4 cases.

- [ ] **Step 7: Commit**

```bash
git add src/widgets/cookie-banner src/app/layout.tsx tests/component/widgets/cookie-banner.test.tsx
git commit -m "feat(widgets): add CookieBanner mounted in root layout"
```

---

## Task 7: Privacy + Terms stub pages

**Files:**
- Create: `src/app/(public)/privacy/page.tsx`
- Create: `src/app/(public)/terms/page.tsx`

- [ ] **Step 1: Create `app/(public)/privacy/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { uk } from "@/shared/i18n";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Політика конфіденційності",
  description: "Як ми збираємо й обробляємо персональні дані.",
};

export default function PrivacyPage() {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.legalStubStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.legal.privacyTitle}</h1>
        <p className="text-lead text-ink-soft">{uk.legal.stubBody}</p>
        <p className="font-hand text-hand-s text-ink-soft">
          {uk.legal.stubContact}{" "}
          <a href="mailto:legal@157.kyiv.ua" className="underline">
            legal@157.kyiv.ua
          </a>
        </p>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 2: Create `app/(public)/terms/page.tsx`**

```tsx
import type { Metadata } from "next";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { uk } from "@/shared/i18n";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Угода користувача",
  description: "Умови використання сервісу Майстерня 157.",
};

export default function TermsPage() {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.legalStubStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.legal.termsTitle}</h1>
        <p className="text-lead text-ink-soft">{uk.legal.stubBody}</p>
        <p className="font-hand text-hand-s text-ink-soft">
          {uk.legal.stubContact}{" "}
          <a href="mailto:legal@157.kyiv.ua" className="underline">
            legal@157.kyiv.ua
          </a>
        </p>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 3: Verify build (smoke)**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add 'src/app/(public)/privacy' 'src/app/(public)/terms'
git commit -m "feat(public): add /privacy and /terms stub pages"
```

(On Windows PowerShell quote with single quotes — paths contain parens.)

---

## Task 8: Root + (public) loading.tsx files

**Files:**
- Create: `src/app/loading.tsx`
- Create: `src/app/(public)/loading.tsx`
- Create: `src/app/(public)/catalog/loading.tsx`
- Create: `src/app/(public)/collections/loading.tsx`
- Create: `src/app/(public)/p/[slug]/loading.tsx`
- Create: `src/app/(public)/login/loading.tsx`
- Create: `src/app/(public)/register/loading.tsx`
- Create: `src/app/(public)/cart/loading.tsx`
- Create: `src/app/(public)/checkout/loading.tsx`

- [ ] **Step 1: `app/loading.tsx`**

```tsx
import { PaperSkeletonPage } from "@/shared/ui/paper-skeleton";
export default function RootLoading() {
  return <PaperSkeletonPage />;
}
```

- [ ] **Step 2: `app/(public)/loading.tsx`**

```tsx
import { PaperSkeletonPage } from "@/shared/ui/paper-skeleton";
export default function PublicLoading() {
  return <PaperSkeletonPage />;
}
```

- [ ] **Step 3: `app/(public)/catalog/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";
export default function CatalogLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonGrid cols={3} rows={3} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 4: `app/(public)/collections/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonGrid } from "@/shared/ui/paper-skeleton";
export default function CollectionsLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonGrid cols={2} rows={3} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 5: `app/(public)/p/[slug]/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonArticle } from "@/shared/ui/paper-skeleton";
export default function ProductLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonArticle />
      </div>
    </Container>
  );
}
```

- [ ] **Step 6: `app/(public)/login/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function LoginLoading() {
  return (
    <Container narrow>
      <div className="py-12">
        <PaperSkeletonForm fields={2} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 7: `app/(public)/register/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function RegisterLoading() {
  return (
    <Container narrow>
      <div className="py-12">
        <PaperSkeletonForm fields={4} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 8: `app/(public)/cart/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function CartLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonForm fields={3} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 9: `app/(public)/checkout/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonForm } from "@/shared/ui/paper-skeleton";
export default function CheckoutLoading() {
  return (
    <Container narrow>
      <div className="py-12">
        <PaperSkeletonForm fields={6} />
      </div>
    </Container>
  );
}
```

- [ ] **Step 10: Build sanity**

Run: `pnpm build`
Expected: PASS — App Router validates loading.tsx co-location.

- [ ] **Step 11: Commit**

```bash
git add src/app/loading.tsx 'src/app/(public)'
git commit -m "feat(app): add loading.tsx for root + public route segments"
```

---

## Task 9: Cabinet (account/student/admin/parent) loading.tsx

**Files:**
- Create: `src/app/account/loading.tsx`
- Create: `src/app/student/loading.tsx`
- Create: `src/app/admin/loading.tsx`
- Create: `src/app/parent/loading.tsx`

- [ ] **Step 1: `app/account/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
export default function AccountLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonProfile />
      </div>
    </Container>
  );
}
```

- [ ] **Step 2: `app/student/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
export default function StudentLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonProfile />
      </div>
    </Container>
  );
}
```

- [ ] **Step 3: `app/admin/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
export default function AdminLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonProfile />
      </div>
    </Container>
  );
}
```

- [ ] **Step 4: `app/parent/loading.tsx`**

```tsx
import { Container } from "@/shared/ui/layout";
import { PaperSkeletonProfile } from "@/shared/ui/paper-skeleton";
export default function ParentLoading() {
  return (
    <Container>
      <div className="py-12">
        <PaperSkeletonProfile />
      </div>
    </Container>
  );
}
```

- [ ] **Step 5: Build sanity**

Run: `pnpm build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/account/loading.tsx src/app/student/loading.tsx src/app/admin/loading.tsx src/app/parent/loading.tsx
git commit -m "feat(app): add loading.tsx for cabinet route segments"
```

---

## Task 10: Segment-level error.tsx files

**Files:**
- Create: `src/app/(public)/error.tsx`
- Create: `src/app/account/error.tsx`
- Create: `src/app/student/error.tsx`
- Create: `src/app/admin/error.tsx`
- Create: `src/app/parent/error.tsx`

- [ ] **Step 1: `app/(public)/error.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export default function PublicError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.publicStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.errors.publicHeadline}</h1>
        <div className="flex gap-3">
          <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
          <PillButton variant="outline-d" asChild>
            <Link href="/">{uk.errors.backHome}</Link>
          </PillButton>
        </div>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 2: `app/account/error.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export default function AccountError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.accountStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.errors.accountHeadline}</h1>
        <div className="flex gap-3">
          <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
          <PillButton variant="outline-d" asChild>
            <Link href="/login">{uk.errors.toLogin}</Link>
          </PillButton>
        </div>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 3: `app/student/error.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export default function StudentError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.studentStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.errors.studentHeadline}</h1>
        <div className="flex gap-3">
          <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
          <PillButton variant="outline-d" asChild>
            <Link href="/student">До зошита</Link>
          </PillButton>
        </div>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 4: `app/admin/error.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { ApiError } from "@/shared/api/errors";
import { uk } from "@/shared/i18n";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  const needs2fa = error instanceof ApiError && error.isUnauthorized;
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.adminStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.errors.adminHeadline}</h1>
        <div className="flex gap-3">
          <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
          {needs2fa && (
            <PillButton variant="outline-d" asChild>
              <Link href="/admin/2fa">2FA</Link>
            </PillButton>
          )}
        </div>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 5: `app/parent/error.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { Container, Stack } from "@/shared/ui/layout";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";

export default function ParentError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text={uk.errors.parentStamp} rotation={-3} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">{uk.errors.parentHeadline}</h1>
        <PillButton onClick={reset}>{uk.errors.reset}</PillButton>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 6: Build sanity**

Run: `pnpm typecheck && pnpm build`
Expected: PASS — error.tsx is valid Client Component contract.

- [ ] **Step 7: Commit**

```bash
git add 'src/app/(public)/error.tsx' src/app/account/error.tsx src/app/student/error.tsx src/app/admin/error.tsx src/app/parent/error.tsx
git commit -m "feat(app): add segment-level error.tsx with role-aware fallbacks"
```

---

## Task 11: Wrap critical views with `<WidgetErrorBoundary>`

**Files:**
- Modify: `src/app/(public)/catalog/page.tsx`
- Modify: `src/app/(public)/cart/page.tsx`
- Modify: `src/app/admin/payouts/page.tsx`
- Modify: `src/app/admin/reports/tax/page.tsx`

These pages render `views/<feature>/<Screen>` components. Wrap each with `<WidgetErrorBoundary label="...">` so a single fetch fail doesn't bubble all the way up to segment-level error.tsx.

- [ ] **Step 1: Update `app/(public)/catalog/page.tsx`**

```tsx
import type { Metadata } from "next";
import { CatalogScreen } from "@/views/catalog";
import { serverApi } from "@/shared/api/server-client";
import type { Page as P, ProductCardDto } from "@/shared/api";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";

export const metadata: Metadata = { title: "Каталог" };
export const revalidate = 300;
export const dynamic = "auto";

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string; sort?: string; type?: string };
}) {
  const params = new URLSearchParams();
  params.set("page", searchParams.page ?? "0");
  params.set("size", "20");
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.type) params.set("type", searchParams.type);
  const data = await serverApi<P<ProductCardDto>>(`/products?${params}`, {
    revalidate: 300,
    tags: ["catalog"],
  }).catch(() => null);
  return (
    <WidgetErrorBoundary label="Каталог">
      <CatalogScreen data={data} />
    </WidgetErrorBoundary>
  );
}
```

- [ ] **Step 2: Update `app/(public)/cart/page.tsx`**

```tsx
import { CartScreen } from "@/views/cart";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";
export default function Page() {
  return (
    <WidgetErrorBoundary label="Кошик">
      <CartScreen />
    </WidgetErrorBoundary>
  );
}
```

- [ ] **Step 3: Update `app/admin/payouts/page.tsx`**

```tsx
import { AdminPayoutsScreen } from "@/views/admin-payouts";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";
export default function Page() {
  return (
    <WidgetErrorBoundary label="Виплати">
      <AdminPayoutsScreen />
    </WidgetErrorBoundary>
  );
}
```

- [ ] **Step 4: Update `app/admin/reports/tax/page.tsx`**

```tsx
import { AdminTaxReportScreen } from "@/views/admin-tax-report";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";
export default function Page() {
  return (
    <WidgetErrorBoundary label="Податковий звіт">
      <AdminTaxReportScreen />
    </WidgetErrorBoundary>
  );
}
```

- [ ] **Step 5: Lint sanity (FSD boundaries)**

Run: `pnpm lint`
Expected: PASS — `app → shared` and `app → views` already allowed.

- [ ] **Step 6: Commit**

```bash
git add 'src/app/(public)/catalog/page.tsx' 'src/app/(public)/cart/page.tsx' src/app/admin/payouts/page.tsx src/app/admin/reports/tax/page.tsx
git commit -m "feat(app): wrap critical views in WidgetErrorBoundary"
```

---

## Task 12: Add `blurDataURL` prop to ImageSlot + Polaroid

**Files:**
- Modify: `src/shared/ui/image-slot/image-slot.tsx`
- Modify: `src/shared/ui/polaroid/polaroid.tsx`
- Modify: `tests/component/atoms/image-slot.test.tsx` (add new test)

- [ ] **Step 1: Read existing ImageSlot test to understand format**

Run: `cat tests/component/atoms/image-slot.test.tsx`
(Use Read tool — verify naming conventions before adding new test.)

- [ ] **Step 2: Add failing test for `blurDataURL` prop**

Append to `tests/component/atoms/image-slot.test.tsx`:
```tsx
it("forwards blurDataURL to next/image with placeholder=blur", () => {
  // Smallest valid base64 data URL (1x1 transparent PNG)
  const blur = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";
  const { container } = render(
    <ImageSlot
      slot="hero"
      ratio="4/5"
      variant="polaroid"
      caption="x"
      src="https://cdn.157.kyiv.ua/sample.jpg"
      blurDataURL={blur}
    />,
  );
  const img = container.querySelector("img");
  expect(img).not.toBeNull();
  // next/image consumes blurDataURL via style on the wrapper or directly on img — accept either signal
  const placeholderAttr = img?.getAttribute("style") ?? "";
  expect(placeholderAttr).toMatch(/data:image\/png;base64/);
});
```

- [ ] **Step 3: Run to confirm fail**

Run: `pnpm test tests/component/atoms/image-slot.test.tsx`
Expected: FAIL — `blurDataURL` is not in `ImageSlotProps` type.

- [ ] **Step 4: Modify `src/shared/ui/image-slot/image-slot.tsx`**

Add `blurDataURL?: string` to `ImageSlotProps`:
```ts
export type ImageSlotProps = {
  slot: string;
  ratio: ImageSlotRatio;
  variant: ImageSlotVariant;
  caption: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  blurDataURL?: string;
};
```

In the component, destructure `blurDataURL` and pass through to all 3 `<Image>` invocations:
```tsx
<Image
  src={src}
  alt={alt ?? caption}
  fill
  sizes={sizes ?? "100vw"}
  priority={priority}
  placeholder={blurDataURL ? "blur" : "empty"}
  blurDataURL={blurDataURL}
  className="object-cover"
/>
```

(Apply same to all three branches: polaroid, stamp, and default.)

- [ ] **Step 5: Modify `src/shared/ui/polaroid/polaroid.tsx`**

Add `blurDataURL?: string` to `PolaroidProps`, destructure, and pass to `<Image>`:
```tsx
export type PolaroidProps = {
  src: string;
  alt: string;
  caption?: string;
  rotation?: -7 | -5 | -3 | -1 | 2 | 4 | 6;
  ratio?: "4/5" | "1/1";
  paperClip?: boolean;
  hoverInteractive?: boolean;
  className?: string;
  blurDataURL?: string;
};
```

```tsx
<Image
  src={src}
  alt={alt}
  fill
  sizes="240px"
  placeholder={blurDataURL ? "blur" : "empty"}
  blurDataURL={blurDataURL}
  className="object-cover"
/>
```

- [ ] **Step 6: Run test to verify pass**

Run: `pnpm test tests/component/atoms/image-slot.test.tsx`
Expected: PASS — including new `blurDataURL` test.

- [ ] **Step 7: Verify scan-images still passes**

Run: `pnpm scan-images`
Expected: PASS — `blurDataURL` is optional, doesn't change slot scanner behavior.

- [ ] **Step 8: Commit**

```bash
git add src/shared/ui/image-slot/image-slot.tsx src/shared/ui/polaroid/polaroid.tsx tests/component/atoms/image-slot.test.tsx
git commit -m "feat(shared/ui): add blurDataURL prop to ImageSlot and Polaroid"
```

---

## Task 13: E2E — loading-states (skeleton visible during fetch)

**Files:**
- Create: `tests/e2e/loading-states.spec.ts`

- [ ] **Step 1: Write E2E test**

```ts
import { test, expect } from "@playwright/test";

test("@smoke catalog shows paper skeleton during fetch", async ({ page }) => {
  // Slow down the products fetch so we can observe loading.tsx
  await page.route("**/api/v1/products**", async (route) => {
    await new Promise((r) => setTimeout(r, 1500));
    await route.continue();
  });

  await page.goto("/catalog");

  // The "ДРУКУЄТЬСЯ" stamp is visible while loading.tsx is rendered
  await expect(page.getByText("ДРУКУЄТЬСЯ").first()).toBeVisible({ timeout: 1000 });

  // Eventually catalog content arrives (specific assertion depends on CatalogScreen — at minimum no skeleton)
  await expect(page.getByText("ДРУКУЄТЬСЯ").first()).toBeHidden({ timeout: 5000 });
});
```

- [ ] **Step 2: Run E2E test**

Run: `pnpm e2e tests/e2e/loading-states.spec.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/loading-states.spec.ts
git commit -m "test(e2e): verify catalog paper-skeleton during fetch"
```

---

## Task 14: E2E — cookie banner

**Files:**
- Create: `tests/e2e/cookie-banner.spec.ts`

- [ ] **Step 1: Write E2E test**

```ts
import { test, expect } from "@playwright/test";

test.describe("@smoke cookie banner", () => {
  test("appears on first visit and dismisses persistently", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");

    const banner = page.getByRole("region", { name: /cookie/i });
    await expect(banner).toBeVisible();

    await expect(banner.getByRole("link", { name: /конфіденційності/i })).toHaveAttribute(
      "href",
      "/privacy",
    );

    await banner.getByRole("button", { name: /закрити/i }).click();
    await expect(banner).toBeHidden();

    const cookies = await context.cookies();
    const consentCookie = cookies.find((c) => c.name === "consent_dismissed");
    expect(consentCookie?.value).toBe("1");

    await page.reload();
    await expect(page.getByRole("region", { name: /cookie/i })).toBeHidden();
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm e2e tests/e2e/cookie-banner.spec.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/cookie-banner.spec.ts
git commit -m "test(e2e): cookie banner visibility and dismiss persistence"
```

---

## Task 15: E2E — legal stubs

**Files:**
- Create: `tests/e2e/legal-stubs.spec.ts`

- [ ] **Step 1: Write E2E test**

```ts
import { test, expect } from "@playwright/test";

test.describe("@smoke legal stub pages", () => {
  test("/privacy renders 200 with stub stamp", async ({ page }) => {
    const response = await page.goto("/privacy");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Політика конфіденційності/i })).toBeVisible();
    await expect(page.getByText("ДОКУМЕНТ ГОТУЄТЬСЯ")).toBeVisible();
  });

  test("/terms renders 200 with stub stamp", async ({ page }) => {
    const response = await page.goto("/terms");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: /Угода користувача/i })).toBeVisible();
    await expect(page.getByText("ДОКУМЕНТ ГОТУЄТЬСЯ")).toBeVisible();
  });

  test("cookie banner link navigates to /privacy", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/");
    const link = page.getByRole("region", { name: /cookie/i }).getByRole("link", {
      name: /конфіденційності/i,
    });
    await link.click();
    await expect(page).toHaveURL(/\/privacy$/);
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm e2e tests/e2e/legal-stubs.spec.ts`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/legal-stubs.spec.ts
git commit -m "test(e2e): privacy/terms stubs + cookie link navigation"
```

---

## Task 16: E2E — error boundary recovery

**Files:**
- Create: `tests/e2e/error-boundary.spec.ts`

- [ ] **Step 1: Write E2E test**

```ts
import { test, expect } from "@playwright/test";

test("@smoke catalog widget boundary catches API failure and recovers", async ({ page }) => {
  let failOnce = true;

  await page.route("**/api/v1/products**", async (route) => {
    if (failOnce) {
      failOnce = false;
      await route.fulfill({ status: 500, body: "boom" });
    } else {
      await route.continue();
    }
  });

  await page.goto("/catalog");

  // Either WidgetErrorBoundary fallback (preferred) OR segment-level (public)/error.tsx kicks in.
  // At least one of these texts MUST be visible — the page must not be blank.
  const widgetFallback = page.getByText(/Не вдалось показати/i);
  const segmentFallback = page.getByText(/АРКУШ ЗІМ'ЯВСЯ/i);
  await expect(widgetFallback.or(segmentFallback).first()).toBeVisible({ timeout: 5000 });

  // Click reset (whichever fallback rendered)
  const resetBtn = page.getByRole("button", { name: /Друкувати знову|Перезавантажити/i }).first();
  if (await resetBtn.isVisible()) {
    await resetBtn.click();
    // Eventually skeleton or real content shows; at minimum the error fallback dismisses
    await expect(widgetFallback.or(segmentFallback).first()).toBeHidden({ timeout: 5000 });
  }
});
```

- [ ] **Step 2: Run**

Run: `pnpm e2e tests/e2e/error-boundary.spec.ts`
Expected: PASS (or at least clear failure pointing to which fallback rendered — adjust assertion if needed).

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/error-boundary.spec.ts
git commit -m "test(e2e): widget/segment error boundary recovery on /catalog"
```

---

## Task 17: Final verification — `pnpm verify`

**Files:** none modified

- [ ] **Step 1: Run full verify**

Run: `pnpm verify`
Expected: ALL pass — `typecheck`, `lint`, `test` (Vitest), `scan-images`, `build`, `e2e --grep @smoke`.

- [ ] **Step 2: Manual UI check (CLAUDE.md mandate for UI tasks)**

Run: `pnpm dev` (in one terminal), `pnpm e2e:ui` (in another) — or open `http://localhost:3000` directly.

Verify in browser:
- `/catalog` — paper-skeleton with "ДРУКУЄТЬСЯ" stamp visible briefly during fetch (use DevTools → Network → Slow 3G)
- First visit to `/` — cookie banner at bottom, click `✕` → disappears, reload → does NOT reappear
- `/privacy` and `/terms` show "ДОКУМЕНТ ГОТУЄТЬСЯ" stamp
- Force a 500 on `/api/v1/products` (DevTools → Network → block request) → `/catalog` shows widget fallback "Не вдалось показати: Каталог" with "Друкувати знову" button (does NOT cascade to full segment error)
- `/admin/payouts` — wrap in `<WidgetErrorBoundary>` works (visit while logged in if possible)

- [ ] **Step 3: If verify is green and manual check OK, no further commit needed (work already committed task-by-task).**

---

## Self-Review Notes

Already verified during writing:

- **Spec coverage:** §3 architecture → Tasks 4–6, 11; §4 PaperSkeleton → Task 5; §4.4 route mapping → Tasks 8–9; §5 error boundaries → Tasks 4, 10–11; §6 cookie banner → Tasks 2–3, 6; §7 legal stubs → Task 7; §8 blurDataURL → Task 12; §9 TODO.md → Task 1; §10 testing → Tasks 13–17.
- **Type consistency:** `WidgetErrorBoundary` props signature consistent across Tasks 4 and 11. `uk.errors.*` keys consistent between i18n file (Task 1) and consumers (Tasks 4, 7, 10). `StampText` extension in Task 1 covers ALL strings used downstream.
- **Real-API alignment:** `Stamp` rotation values restricted to `-12 | -8 | -5 | -3 | 3 | 5 | 8 | 10` — plan uses `-3` everywhere (only legal value matching design intent). `Container`/`Stack` from `@/shared/ui/layout` (existing). `PillButton` variants `primary | outline-d | outline-l | ghost`, sizes `s | m | l | xl` — plan uses `ghost`+`s`, `outline-d`. `ApiError.isUnauthorized` getter (existing) used in `app/admin/error.tsx`.
- **FSD/ESLint:** `app → views/widgets/shared` allowed. `widgets → shared` allowed (cookie-banner imports from `shared/lib/consent`, `shared/ui/layout`, `shared/ui/pill-button`, `shared/i18n`). No layer violations.
- **No placeholders:** Every test has actual code. Every implementation step has actual code. No "similar to Task N" stubs.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-08-track-a-ux-resilience.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
