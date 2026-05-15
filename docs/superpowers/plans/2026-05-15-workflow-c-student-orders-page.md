# Workflow C — Student "Мої продажі" Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/student/orders` page (Server Component shell + client-rendered `views/student-orders`) that lists the authenticated student's sold order items via `GET /api/v1/student/orders`, with multi-select status chips, sort dropdown, pagination, empty/error states.

**Architecture:** FSD slice — new `views/student-orders` with `model/use-orders-query.ts` (URL-state-synced filters), `ui/orders-page.tsx` (composition), `ui/orders-table.tsx`, `ui/status-filter-chips.tsx`, `ui/empty-state.tsx`. Route at `app/student/orders/page.tsx` (dynamic). Edge middleware already gates `/student/*`.

**Tech Stack:** Next.js 14 App Router, TanStack Query v5, orval-generated `useListStudentOrders` hook (from Workflow A), Vitest + RTL, Playwright.

**Spec:** `docs/superpowers/specs/2026-05-15-fe-be-contract-sync-design.md` §6.

**Branch:** `feat/student-orders-page` off Workflow A's tip.

---

## Prerequisites

- Workflow A merged (orval-generated `useListStudentOrdersQuery` and `StudentOrderItemDto` available).
- Confirm by:
```bash
grep -nE "^export (function|const) " src/shared/api/generated/student-orders/student-orders.ts | head
ls src/shared/api/generated/models | grep -i studentOrder
```

---

## File map

**Create:**
- `lyceum-157-frontend/src/views/student-orders/index.ts`
- `lyceum-157-frontend/src/views/student-orders/model/use-orders-query.ts`
- `lyceum-157-frontend/src/views/student-orders/model/url-state.ts`
- `lyceum-157-frontend/src/views/student-orders/ui/orders-page.tsx`
- `lyceum-157-frontend/src/views/student-orders/ui/orders-table.tsx`
- `lyceum-157-frontend/src/views/student-orders/ui/status-filter-chips.tsx`
- `lyceum-157-frontend/src/views/student-orders/ui/sort-select.tsx`
- `lyceum-157-frontend/src/views/student-orders/ui/empty-state.tsx`
- `lyceum-157-frontend/src/views/student-orders/ui/__tests__/orders-table.test.tsx`
- `lyceum-157-frontend/src/views/student-orders/ui/__tests__/status-filter-chips.test.tsx`
- `lyceum-157-frontend/src/views/student-orders/model/__tests__/url-state.test.ts`
- `lyceum-157-frontend/src/app/student/orders/page.tsx`
- `lyceum-157-frontend/src/app/student/orders/loading.tsx`
- `lyceum-157-frontend/tests/e2e/student-orders.spec.ts`

**Modify:**
- `lyceum-157-frontend/src/views/student-dashboard/ui/<dashboard>.tsx` — add a "Мої продажі" link/card pointing to `/student/orders`.

---

## Task 1: Branch + scaffold dir

**Files:** none (git)

- [ ] **Step 1: Branch**
```bash
git checkout main && git pull
git checkout -b feat/student-orders-page
```

- [ ] **Step 2: Confirm `useListStudentOrders` hook exists**
```bash
grep -nE "useListStudent|listStudent" src/shared/api/generated/student-orders/student-orders.ts | head
```
Expected: at least one `useListStudentOrders*` export. If not, the generated function may be `useGet*` or under a different file — find it:
```bash
grep -rn "student/orders" src/shared/api/generated/ | head
```

---

## Task 2: URL-state helpers (pure module)

**Files:**
- Create: `lyceum-157-frontend/src/views/student-orders/model/url-state.ts`
- Create: `lyceum-157-frontend/src/views/student-orders/model/__tests__/url-state.test.ts`

- [ ] **Step 1: Write tests first**

`src/views/student-orders/model/__tests__/url-state.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseQuery, serializeQuery, type OrdersFilters } from "../url-state";

describe("parseQuery", () => {
  it("returns defaults on empty input", () => {
    expect(parseQuery(new URLSearchParams())).toEqual({
      status: [],
      sort: "paidAt,desc",
      page: 0,
      size: 20,
    });
  });

  it("splits comma-separated status", () => {
    const out = parseQuery(new URLSearchParams("status=PAID,DELIVERED&page=2"));
    expect(out.status).toEqual(["PAID", "DELIVERED"]);
    expect(out.page).toBe(2);
  });

  it("clamps invalid page/size to defaults", () => {
    const out = parseQuery(new URLSearchParams("page=-1&size=999"));
    expect(out.page).toBe(0);
    expect(out.size).toBe(20);
  });

  it("rejects unknown status values silently", () => {
    const out = parseQuery(new URLSearchParams("status=PAID,FOO,REFUNDED"));
    expect(out.status).toEqual(["PAID", "REFUNDED"]);
  });
});

describe("serializeQuery", () => {
  it("omits defaults", () => {
    const params = serializeQuery({ status: [], sort: "paidAt,desc", page: 0, size: 20 } as OrdersFilters);
    expect(params.toString()).toBe("");
  });

  it("serializes status and sort", () => {
    const params = serializeQuery({
      status: ["PAID", "DELIVERED"],
      sort: "createdAt,desc",
      page: 1,
      size: 20,
    } as OrdersFilters);
    expect(params.get("status")).toBe("PAID,DELIVERED");
    expect(params.get("sort")).toBe("createdAt,desc");
    expect(params.get("page")).toBe("1");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**
```bash
pnpm test src/views/student-orders/model/__tests__/url-state.test.ts
```
Expected: module-not-found failure.

- [ ] **Step 3: Implement**

`src/views/student-orders/model/url-state.ts`:
```ts
import type { OrderStatus } from "@/shared/api";

const ALLOWED_STATUS: OrderStatus[] = [
  "PAID",
  "FULFILLED",
  "DELIVERED",
  "REFUNDED",
  "DISPUTED",
];
const ALLOWED_SORT = ["paidAt,desc", "createdAt,desc"] as const;
export type Sort = (typeof ALLOWED_SORT)[number];

export type OrdersFilters = {
  status: OrderStatus[];
  sort: Sort;
  page: number;
  size: number;
};

const DEFAULTS: OrdersFilters = { status: [], sort: "paidAt,desc", page: 0, size: 20 };

export function parseQuery(sp: URLSearchParams): OrdersFilters {
  const rawStatus = sp.get("status");
  const status = rawStatus
    ? rawStatus.split(",").filter((s): s is OrderStatus => (ALLOWED_STATUS as string[]).includes(s))
    : [];

  const rawSort = sp.get("sort");
  const sort: Sort = (ALLOWED_SORT as readonly string[]).includes(rawSort ?? "")
    ? (rawSort as Sort)
    : DEFAULTS.sort;

  const rawPage = parseInt(sp.get("page") ?? "", 10);
  const page = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : DEFAULTS.page;

  const rawSize = parseInt(sp.get("size") ?? "", 10);
  const size = Number.isFinite(rawSize) && rawSize > 0 && rawSize <= 50 ? rawSize : DEFAULTS.size;

  return { status, sort, page, size };
}

export function serializeQuery(f: OrdersFilters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.status.length > 0) sp.set("status", f.status.join(","));
  if (f.sort !== DEFAULTS.sort) sp.set("sort", f.sort);
  if (f.page !== DEFAULTS.page) sp.set("page", String(f.page));
  if (f.size !== DEFAULTS.size) sp.set("size", String(f.size));
  return sp;
}
```

- [ ] **Step 4: Run tests, expect PASS**
```bash
pnpm test src/views/student-orders/model/__tests__/url-state.test.ts
```
Expected: 6/6 pass.

- [ ] **Step 5: Commit**
```bash
git add src/views/student-orders/model
git commit -m "feat(student-orders): url-state parse/serialize with whitelist"
```

---

## Task 3: Query hook

**Files:**
- Create: `lyceum-157-frontend/src/views/student-orders/model/use-orders-query.ts`

- [ ] **Step 1: Write the hook**

`src/views/student-orders/model/use-orders-query.ts`:
```ts
"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useListStudentOrders } from "@/shared/api/generated/student-orders/student-orders"; // adjust to actual export
import { parseQuery, serializeQuery, type OrdersFilters } from "./url-state";

export function useOrdersQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filters = useMemo(() => parseQuery(new URLSearchParams(sp.toString())), [sp]);

  const setFilters = useCallback(
    (next: Partial<OrdersFilters>) => {
      const merged = { ...filters, ...next, page: next.page ?? 0 };
      const nextSp = serializeQuery(merged).toString();
      router.replace(`${pathname}${nextSp ? `?${nextSp}` : ""}`);
    },
    [filters, pathname, router],
  );

  const query = useListStudentOrders({
    status: filters.status.length ? filters.status : undefined,
    page: filters.page,
    size: filters.size,
    sort: filters.sort,
  });

  return { filters, setFilters, query };
}
```

> **Hook signature note:** orval typically generates `useListStudentOrders(params, options)`. Confirm by `grep -A5 "useListStudentOrders" src/shared/api/generated/student-orders/student-orders.ts`. Adjust the parameter shape accordingly.

- [ ] **Step 2: Typecheck**
```bash
pnpm typecheck 2>&1 | grep "use-orders-query"
```
Expected: 0 lines.

- [ ] **Step 3: Commit**
```bash
git add src/views/student-orders/model/use-orders-query.ts
git commit -m "feat(student-orders): use-orders-query wrapping orval hook with URL state"
```

---

## Task 4: `status-filter-chips` component

**Files:**
- Create: `lyceum-157-frontend/src/views/student-orders/ui/status-filter-chips.tsx`
- Create: `lyceum-157-frontend/src/views/student-orders/ui/__tests__/status-filter-chips.test.tsx`

- [ ] **Step 1: Write failing test**

`src/views/student-orders/ui/__tests__/status-filter-chips.test.tsx`:
```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StatusFilterChips } from "../status-filter-chips";
import type { OrderStatus } from "@/shared/api";

describe("<StatusFilterChips>", () => {
  it("renders all chips and highlights active", () => {
    render(<StatusFilterChips value={["PAID"] as OrderStatus[]} onChange={() => {}} />);
    const paid = screen.getByRole("button", { name: /PAID/i });
    expect(paid).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /REFUNDED/i })).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles a chip on click", () => {
    const onChange = vi.fn();
    render(<StatusFilterChips value={["PAID"] as OrderStatus[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /DELIVERED/i }));
    expect(onChange).toHaveBeenCalledWith(["PAID", "DELIVERED"]);
  });

  it("removes a chip on second click", () => {
    const onChange = vi.fn();
    render(<StatusFilterChips value={["PAID", "DELIVERED"] as OrderStatus[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /PAID/i }));
    expect(onChange).toHaveBeenCalledWith(["DELIVERED"]);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**
```bash
pnpm test src/views/student-orders/ui/__tests__/status-filter-chips.test.tsx
```

- [ ] **Step 3: Implement**

`src/views/student-orders/ui/status-filter-chips.tsx`:
```tsx
"use client";
import type { OrderStatus } from "@/shared/api";

const OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PAID", label: "Сплачено" },
  { value: "FULFILLED", label: "Виконано" },
  { value: "DELIVERED", label: "Доставлено" },
  { value: "REFUNDED", label: "Повернено" },
  { value: "DISPUTED", label: "Спір" },
];

type Props = {
  value: OrderStatus[];
  onChange: (next: OrderStatus[]) => void;
};

export function StatusFilterChips({ value, onChange }: Props) {
  const toggle = (s: OrderStatus) => {
    if (value.includes(s)) onChange(value.filter((v) => v !== s));
    else onChange([...value, s]);
  };
  return (
    <div role="group" aria-label="Фільтр за статусом" className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => {
        const active = value.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            aria-label={`${o.value} ${o.label}`}
            onClick={() => toggle(o.value)}
            className={`rounded-full border px-3 py-1 text-small ${
              active ? "bg-burgundy text-bg-warm border-burgundy" : "border-ink/30 text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run tests, expect PASS**
```bash
pnpm test src/views/student-orders/ui/__tests__/status-filter-chips.test.tsx
```
Expected: 3/3 pass.

- [ ] **Step 5: Commit**
```bash
git add src/views/student-orders/ui/status-filter-chips.tsx src/views/student-orders/ui/__tests__/status-filter-chips.test.tsx
git commit -m "feat(student-orders): StatusFilterChips component"
```

---

## Task 5: `sort-select` and `empty-state` components

**Files:**
- Create: `lyceum-157-frontend/src/views/student-orders/ui/sort-select.tsx`
- Create: `lyceum-157-frontend/src/views/student-orders/ui/empty-state.tsx`

- [ ] **Step 1: Implement `sort-select.tsx`**

```tsx
"use client";
import type { Sort } from "../model/url-state";

type Props = { value: Sort; onChange: (next: Sort) => void };

export function SortSelect({ value, onChange }: Props) {
  return (
    <label className="text-small text-ink-soft">
      Сортувати:{" "}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Sort)}
        className="border-b border-ink bg-transparent"
      >
        <option value="paidAt,desc">Дата оплати ↓</option>
        <option value="createdAt,desc">Дата створення ↓</option>
      </select>
    </label>
  );
}
```

- [ ] **Step 2: Implement `empty-state.tsx`**

```tsx
export function EmptyState() {
  return (
    <div className="py-24 text-center text-lead text-ink-soft">
      Поки що жодного продажу. Опубліковані товари з’являться тут після оплати покупцем.
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/views/student-orders/ui/sort-select.tsx src/views/student-orders/ui/empty-state.tsx
git commit -m "feat(student-orders): SortSelect + EmptyState"
```

---

## Task 6: `orders-table` component

**Files:**
- Create: `lyceum-157-frontend/src/views/student-orders/ui/orders-table.tsx`
- Create: `lyceum-157-frontend/src/views/student-orders/ui/__tests__/orders-table.test.tsx`

- [ ] **Step 1: Confirm `StudentOrderItemDto` shape**
```bash
cat src/shared/api/generated/models/studentOrderItemDto.ts
```
Note the actual field names (e.g., `orderNumber`, `productTitle`, `quantity`, `status`, `grossAmount`, `paidAt`, optionally `netAmount`).

- [ ] **Step 2: Write failing test**

`src/views/student-orders/ui/__tests__/orders-table.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { OrdersTable } from "../orders-table";
import type { StudentOrderItemDto } from "@/shared/api";

const rows: StudentOrderItemDto[] = [
  {
    orderNumber: "L157-2026-001234",
    productTitle: "Картина «Місто»",
    quantity: 1,
    status: "PAID",
    grossAmount: "850.00",
    paidAt: "2026-05-10T12:00:00Z",
  } as StudentOrderItemDto,
];

describe("<OrdersTable>", () => {
  it("renders one row per item", () => {
    render(<OrdersTable rows={rows} />);
    expect(screen.getByText("L157-2026-001234")).toBeInTheDocument();
    expect(screen.getByText("Картина «Місто»")).toBeInTheDocument();
    expect(screen.getByText("850.00 ₴")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run, expect FAIL**
```bash
pnpm test src/views/student-orders/ui/__tests__/orders-table.test.tsx
```

- [ ] **Step 4: Implement**

`src/views/student-orders/ui/orders-table.tsx`:
```tsx
import type { StudentOrderItemDto } from "@/shared/api";

type Props = { rows: StudentOrderItemDto[] };

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("uk-UA", { year: "numeric", month: "2-digit", day: "2-digit" }) : "—";

export function OrdersTable({ rows }: Props) {
  return (
    <table className="w-full border-collapse text-left">
      <thead className="border-b border-ink/30 text-small uppercase tracking-widest text-ink-soft">
        <tr>
          <th className="py-3 pr-4">Дата оплати</th>
          <th className="py-3 pr-4">№ замовлення</th>
          <th className="py-3 pr-4">Товар</th>
          <th className="py-3 pr-4">К-сть</th>
          <th className="py-3 pr-4">Статус</th>
          <th className="py-3 pr-4 text-right">Сума gross</th>
          {/* netAmount column conditionally rendered below if present on rows */}
          {rows.length > 0 && "netAmount" in (rows[0] as object) ? (
            <th className="py-3 text-right">До виплати NET</th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.orderNumber} className="border-b border-ink/10 align-top">
            <td className="py-3 pr-4">{fmtDate(r.paidAt)}</td>
            <td className="py-3 pr-4 font-mono">{r.orderNumber}</td>
            <td className="py-3 pr-4">{r.productTitle}</td>
            <td className="py-3 pr-4">{r.quantity}</td>
            <td className="py-3 pr-4">{r.status}</td>
            <td className="py-3 pr-4 text-right">{r.grossAmount} ₴</td>
            {"netAmount" in (r as object) ? (
              <td className="py-3 text-right">{(r as { netAmount: string }).netAmount} ₴</td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```
> **`netAmount` graceful handling:** column rendered iff field exists on rows. If `StudentOrderItemDto` (per Task 6 Step 1) lacks `netAmount` and the conditional clutter is annoying, drop the conditional and open a follow-up ticket "BE: surface netAmount on StudentOrderItemDto".

- [ ] **Step 5: Run test, expect PASS**
```bash
pnpm test src/views/student-orders/ui/__tests__/orders-table.test.tsx
```

- [ ] **Step 6: Commit**
```bash
git add src/views/student-orders/ui/orders-table.tsx src/views/student-orders/ui/__tests__/orders-table.test.tsx
git commit -m "feat(student-orders): OrdersTable component"
```

---

## Task 7: `orders-page` composition + index barrel

**Files:**
- Create: `lyceum-157-frontend/src/views/student-orders/ui/orders-page.tsx`
- Create: `lyceum-157-frontend/src/views/student-orders/index.ts`

- [ ] **Step 1: Implement `orders-page.tsx`**

```tsx
"use client";
import { useOrdersQuery } from "../model/use-orders-query";
import { StatusFilterChips } from "./status-filter-chips";
import { SortSelect } from "./sort-select";
import { OrdersTable } from "./orders-table";
import { EmptyState } from "./empty-state";
import { PillButton } from "@/shared/ui";

export function StudentOrdersPage() {
  const { filters, setFilters, query } = useOrdersQuery();

  if (query.isPending) {
    return <div className="py-24 text-center text-ink-soft">Завантаження…</div>;
  }
  if (query.isError) {
    return (
      <div className="py-24 text-center text-burgundy">
        Не вдалось завантажити. <button onClick={() => query.refetch()} className="underline">Спробувати ще</button>
      </div>
    );
  }

  const page = query.data;
  const rows = page?.content ?? [];

  return (
    <section className="space-y-8 py-8">
      <header className="space-y-4">
        <h1 className="font-display text-h1 text-burgundy">Мої продажі</h1>
        <div className="flex flex-wrap items-center gap-6">
          <StatusFilterChips value={filters.status} onChange={(s) => setFilters({ status: s })} />
          <SortSelect value={filters.sort} onChange={(s) => setFilters({ sort: s })} />
        </div>
      </header>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <OrdersTable rows={rows} />
          <footer className="flex items-center justify-between">
            <span className="text-small text-ink-soft">
              Сторінка {(page?.number ?? 0) + 1} з {page?.totalPages ?? 1}
            </span>
            <div className="flex gap-2">
              <PillButton
                disabled={(page?.number ?? 0) <= 0}
                onClick={() => setFilters({ page: Math.max(0, (page?.number ?? 0) - 1) })}
              >
                ← Попередня
              </PillButton>
              <PillButton
                disabled={page?.last ?? true}
                onClick={() => setFilters({ page: (page?.number ?? 0) + 1 })}
              >
                Наступна →
              </PillButton>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Write barrel**

`src/views/student-orders/index.ts`:
```ts
export { StudentOrdersPage } from "./ui/orders-page";
```

- [ ] **Step 3: Typecheck**
```bash
pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/views/student-orders/ui/orders-page.tsx src/views/student-orders/index.ts
git commit -m "feat(student-orders): page composition (filters + table + pagination)"
```

---

## Task 8: Wire Next route + loading skeleton

**Files:**
- Create: `lyceum-157-frontend/src/app/student/orders/page.tsx`
- Create: `lyceum-157-frontend/src/app/student/orders/loading.tsx`

- [ ] **Step 1: Implement `page.tsx`**

```tsx
import { StudentOrdersPage } from "@/views/student-orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Мої продажі — Lyceum 157 Hub" };

export default function Page() {
  return <StudentOrdersPage />;
}
```

- [ ] **Step 2: Implement `loading.tsx`**

```tsx
export default function Loading() {
  return (
    <div className="space-y-4 py-24">
      <div className="h-12 w-64 animate-pulse bg-ink/10" />
      <div className="h-12 w-full animate-pulse bg-ink/10" />
      <div className="h-12 w-full animate-pulse bg-ink/10" />
      <div className="h-12 w-full animate-pulse bg-ink/10" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/student/orders
git commit -m "feat(student-orders): Next route + loading skeleton"
```

---

## Task 9: Link from student-dashboard

**Files:**
- Modify: `lyceum-157-frontend/src/views/student-dashboard/ui/<dashboard>.tsx`

- [ ] **Step 1: Locate the dashboard**
```bash
ls src/views/student-dashboard/ui
```

- [ ] **Step 2: Add a card/link**

Inside the dashboard's grid of cards, add:
```tsx
<Link href="/student/orders" className="...existing card style classes...">
  <h3>Мої продажі</h3>
  <p>Список замовлень, де ти автор товару</p>
</Link>
```
Match the existing card styling for consistency.

- [ ] **Step 3: Commit**
```bash
git add src/views/student-dashboard
git commit -m "feat(student-dashboard): add link to /student/orders"
```

---

## Task 10: Playwright e2e smoke

**Files:**
- Create: `lyceum-157-frontend/tests/e2e/student-orders.spec.ts`

- [ ] **Step 1: Write a smoke test**

`tests/e2e/student-orders.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("@smoke student-orders", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/student/orders");
    await expect(page).toHaveURL(/\/login\?from=/);
  });

  test("loads the orders page when authenticated", async ({ page, context }) => {
    // Pre-seed a refresh_token cookie that matches your e2e test fixture for a STUDENT.
    // Use the existing helper from tests/e2e/_helpers if present; otherwise expand here.
    await context.addCookies([
      {
        name: "refresh_token",
        value: process.env.E2E_STUDENT_REFRESH_TOKEN ?? "FIXTURE",
        path: "/api/v1/auth",
        domain: new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000").hostname,
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      },
    ]);
    await page.goto("/student/orders");
    await expect(page.getByRole("heading", { name: /Мої продажі/i })).toBeVisible();
  });
});
```

> If e2e fixtures use a different seeding pattern (e.g., MSW or direct login through `/login`), follow the existing convention from `tests/e2e/_helpers/` or other `*.spec.ts` files. Inspect with `ls tests/e2e/` and adopt the same setup.

- [ ] **Step 2: Run smoke**
```bash
pnpm e2e tests/e2e/student-orders.spec.ts
```
Expected: 2/2 pass.

- [ ] **Step 3: Commit**
```bash
git add tests/e2e/student-orders.spec.ts
git commit -m "test(e2e): student-orders smoke (redirect when unauth + render when auth)"
```

---

## Task 11: Final verification and PR

**Files:** none

- [ ] **Step 1: Verify**
```bash
pnpm verify
```
Expected: all green.

- [ ] **Step 2: Manual smoke**

`pnpm dev`, log in as STUDENT (seeded), navigate to `/student/orders`, exercise chips + sort + pagination.

- [ ] **Step 3: Push + PR**
```bash
git push -u origin feat/student-orders-page
gh pr create --title "feat(student): \"Мої продажі\" page" --body "$(cat <<'EOF'
## Summary
- New /student/orders route, URL-state-synced filters (status chips, sort, page).
- Reuses orval-generated useListStudentOrders hook.
- Empty/loading/error states; pagination via Spring Page response.
- Link added from student-dashboard.

## Test plan
- [ ] pnpm verify green
- [ ] Unit: url-state, StatusFilterChips, OrdersTable
- [ ] E2E @smoke: unauth → /login; auth → page renders
- [ ] Manual: filter toggle, sort change, prev/next pagination

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Done criteria

- `/student/orders` renders for STUDENT users (verified via e2e + manual).
- Filter chips, sort dropdown, prev/next pagination operate via URL params.
- Unauth users redirected by edge middleware.
- `pnpm verify` green; PR open.
