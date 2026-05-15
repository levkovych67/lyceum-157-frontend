# Workflow D — Bugfix Batch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four small independent fixes in one PR: (1) replace WayForPay copy with LiqPay in checkout button, (2) surface `parentEmailMasked` on register success UI, (3) render `delivery` echo block on checkout success page, (4) commit the deletion of unused `.docx`/`.pptx` files in `public/`.

**Architecture:** Straight FE edits, no new abstractions. Two view-tests for the new UI branches (Vitest + RTL). No backend changes.

**Tech Stack:** Next.js 14, React 18, Vitest + RTL.

**Spec:** `docs/superpowers/specs/2026-05-15-fe-be-contract-sync-design.md` §4.

**Branch:** `fix/bugfix-batch-liqpay-copy-and-echoes` off **PR #1 head** (Workflow A) — depends on regenerated `OrderCreationResponse.delivery` and `RegisterResponse.parentEmailMasked` being present in the orval models.

---

## Prerequisites

- Workflow A (orval regen) merged to `main` OR rebased onto its branch tip.
- `pnpm verify` passes on the base commit.

---

## File map

**Modify:**
- `lyceum-157-frontend/src/features/checkout/ui/checkout-form.tsx` (will be at `widgets/checkout-form/...` after Workflow B; pre-B path is correct for this PR if D merges before B)
- `lyceum-157-frontend/src/views/checkout-success/ui/*` (locate the success-screen component)
- `lyceum-157-frontend/src/views/register/ui/*` (locate the register-success component)

**Test (new):**
- `lyceum-157-frontend/src/views/register/ui/__tests__/register-screen.test.tsx`
- `lyceum-157-frontend/src/views/checkout-success/ui/__tests__/checkout-success-screen.test.tsx`

**Delete (from working tree, commit the deletion):**
- `lyceum-157-frontend/public/Лабораторна робота 1.docx`
- `lyceum-157-frontend/public/Платформа на колесах.pptx`

---

## Task 1: Branch + locate register-success and checkout-success components

**Files:** none (exploration)

- [ ] **Step 1: Create branch** (off A's tip; assumes A is merged to main)
```bash
cd lyceum-157-frontend
git checkout main
git pull
git checkout -b fix/bugfix-batch-liqpay-copy-and-echoes
```

- [ ] **Step 2: Locate the register-success rendering**
```bash
ls src/views/register/ui/
grep -nE "RegisterResponse|parentEmailMasked|registered|реєстрація" src/views/register/ui/*.tsx
```
Record the file name (e.g., `register-screen.tsx` or `register-success.tsx`) for later edits.

- [ ] **Step 3: Locate the checkout-success rendering**
```bash
ls src/views/checkout-success/ui/
grep -nE "OrderCreationResponse|orderNumber|paymentUrl" src/views/checkout-success/ui/*.tsx
```
Record the file name.

---

## Task 2: Fix WayForPay copy

**Files:**
- Modify: `lyceum-157-frontend/src/features/checkout/ui/checkout-form.tsx`

- [ ] **Step 1: Apply the one-line edit**

In `checkout-form.tsx`:
```diff
- {m.isPending ? "Зʼєднання з WayForPay…" : `Сплатити ${totalUah} ₴`}
+ {m.isPending ? "Перенаправляємо на LiqPay…" : `Сплатити ${totalUah} ₴`}
```

- [ ] **Step 2: Verify no other WayForPay mentions exist**
```bash
grep -rn "WayForPay\|wayforpay" src
```
Expected: 0 lines. If any exist — fix them in this commit too.

- [ ] **Step 3: Run a quick test compile**
```bash
pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/features/checkout/ui/checkout-form.tsx
git commit -m "fix(checkout): replace WayForPay copy with LiqPay (payment provider)"
```

---

## Task 3: Surface `parentEmailMasked` on register success

**Files:**
- Modify: `lyceum-157-frontend/src/views/register/ui/<register-screen-file>.tsx`
- Create: `lyceum-157-frontend/src/views/register/ui/__tests__/register-screen.test.tsx`

- [ ] **Step 1: Write a failing test**

`src/views/register/ui/__tests__/register-screen.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RegisterSuccess } from "../register-screen"; // adjust import path/name to actual export

describe("<RegisterSuccess>", () => {
  it("renders masked parent email when present", () => {
    render(
      <RegisterSuccess
        response={{
          userId: "u-1",
          parentEmailMasked: "a***@gmail.com",
          message: "Лист зі згодою надіслано батькам на a***@gmail.com",
        }}
      />,
    );
    expect(screen.getByText(/a\*\*\*@gmail\.com/)).toBeInTheDocument();
    expect(screen.getByText(/надіслано батькам/i)).toBeInTheDocument();
  });

  it("falls back to message when parentEmailMasked is absent", () => {
    render(
      <RegisterSuccess
        response={{
          userId: "u-1",
          // parentEmailMasked: undefined
          message: "Реєстрація успішна.",
        }}
      />,
    );
    expect(screen.getByText("Реєстрація успішна.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**
```bash
pnpm test src/views/register/ui/__tests__/register-screen.test.tsx
```
Expected: 1+ failure (component doesn't expose `parentEmailMasked` slot yet, or shape doesn't accept it).

- [ ] **Step 3: Edit the register screen**

Open the file located in Task 1 Step 2. Locate where `response.message` is rendered. Replace with:
```tsx
{response.parentEmailMasked ? (
  <>
    <p className="text-lead">Реєстрація успішна!</p>
    <p>
      Лист зі згодою надіслано батькам на <strong>{response.parentEmailMasked}</strong>.
    </p>
    <p className="text-small text-ink-soft">{response.message}</p>
  </>
) : (
  <p>{response.message}</p>
)}
```
Ensure the component's `props.response` type uses `RegisterResponse` from `@/shared/api` (orval-generated).

- [ ] **Step 4: Run test, expect PASS**
```bash
pnpm test src/views/register/ui/__tests__/register-screen.test.tsx
```
Expected: 2/2 pass.

- [ ] **Step 5: Commit**
```bash
git add src/views/register
git commit -m "feat(register): surface parentEmailMasked on success screen"
```

---

## Task 4: Render `delivery` echo on checkout-success

**Files:**
- Modify: `lyceum-157-frontend/src/views/checkout-success/ui/<success-file>.tsx`
- Create: `lyceum-157-frontend/src/views/checkout-success/ui/__tests__/checkout-success-screen.test.tsx`

- [ ] **Step 1: Write a failing test**

`src/views/checkout-success/ui/__tests__/checkout-success-screen.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CheckoutSuccess } from "../checkout-success-screen"; // adjust to actual export
import type { OrderCreationResponse } from "@/shared/api";

const base: OrderCreationResponse = {
  orderId: "o-1",
  orderNumber: "L157-2026-001234",
  totalAmount: "850.00",
  status: "PENDING_PAYMENT",
  paymentUrl: "https://liqpay/x",
  delivery: null as any, // narrowed below
};

describe("<CheckoutSuccess>", () => {
  it("renders delivery block when delivery is present", () => {
    render(
      <CheckoutSuccess
        response={{
          ...base,
          delivery: {
            method: "NOVA_POSHTA",
            details: {
              cityRef: "city-ref",
              cityName: "Київ",
              branchRef: "branch-ref",
              branchNumber: "5",
              branchType: "BRANCH",
              branchAddress: "вул. Сагайдачного, 25",
            },
          },
        }}
      />,
    );
    expect(screen.getByText(/Нова Пошта/)).toBeInTheDocument();
    expect(screen.getByText(/Київ/)).toBeInTheDocument();
    expect(screen.getByText(/відділення №5/i)).toBeInTheDocument();
    expect(screen.getByText(/Сагайдачного, 25/)).toBeInTheDocument();
  });

  it("does not render delivery block when delivery is null", () => {
    render(<CheckoutSuccess response={{ ...base, delivery: null as any }} />);
    expect(screen.queryByText(/Нова Пошта/)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**
```bash
pnpm test src/views/checkout-success/ui/__tests__/checkout-success-screen.test.tsx
```
Expected: failures (delivery block not rendered).

- [ ] **Step 3: Edit the success-screen file**

Locate the order details block in the success-screen file. After the existing order number / total block, add:
```tsx
{response.delivery && (
  <section className="mt-6 border-t border-ink/20 pt-4">
    <h3 className="font-display text-h3 text-burgundy">Доставка</h3>
    <p className="text-lead">
      Нова Пошта · {response.delivery.details.cityName} · відділення №
      {response.delivery.details.branchNumber}
      {", "}
      {response.delivery.details.branchAddress}
    </p>
  </section>
)}
```
(Uses the `DeliveryRequest` shape echoed back by BE.)

- [ ] **Step 4: Run test, expect PASS**
```bash
pnpm test src/views/checkout-success/ui/__tests__/checkout-success-screen.test.tsx
```
Expected: 2/2 pass.

- [ ] **Step 5: Commit**
```bash
git add src/views/checkout-success
git commit -m "feat(checkout-success): render delivery echo block"
```

---

## Task 5: Clean up `public/` working tree

**Files:**
- Delete: `lyceum-157-frontend/public/Лабораторна робота 1.docx`
- Delete: `lyceum-157-frontend/public/Платформа на колесах.pptx`

- [ ] **Step 1: Confirm both files are stale and not referenced**
```bash
git log --all --oneline -- 'public/*.docx' 'public/*.pptx' | head -5
grep -rln "Лабораторна\|Платформа на колесах" src
```
First command shows the file history (sanity-check they were added accidentally). Second must return 0 — no code imports them.

- [ ] **Step 2: Stage the deletion**

If the deletions are already in your working tree from a prior session (per spec §4.4):
```bash
git status -s public/
```
If shown as `D public/...` — stage:
```bash
git add public/
```
Otherwise:
```bash
git rm -- "public/Лабораторна робота 1.docx" "public/Платформа на колесах.pptx"
```

- [ ] **Step 3: Commit**
```bash
git commit -m "chore(public): remove unused brand source assets (docx, pptx)"
```

---

## Task 6: Final verification

**Files:** none

- [ ] **Step 1: Verify pipeline**
```bash
pnpm verify
```
Expected: all green.

- [ ] **Step 2: Manual smoke** — start `pnpm dev`, register a new student → see masked parent email; complete a digital-only checkout → success page renders without delivery block (none echoed).

- [ ] **Step 3: Push and open PR**
```bash
git push -u origin fix/bugfix-batch-liqpay-copy-and-echoes
gh pr create --title "fix: LiqPay copy + parentEmailMasked + delivery echo + clean public/" --body "$(cat <<'EOF'
## Summary
- Replace WayForPay→LiqPay copy in checkout-form.tsx
- Render parentEmailMasked on register-success
- Render delivery echo block on checkout-success
- Commit deletion of unused public/*.docx, public/*.pptx

## Test plan
- [ ] pnpm verify green
- [ ] RegisterSuccess test: masked email rendered + fallback
- [ ] CheckoutSuccess test: delivery block when present / hidden when null
- [ ] Manual: digital checkout completes, register flow shows masked email

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Done criteria

- `grep -rn "WayForPay" src` → 0 hits.
- Register-success view renders `<strong>{parentEmailMasked}</strong>` when present.
- Checkout-success view renders the delivery block iff `response.delivery != null`.
- `public/` no longer contains the deleted `.docx` / `.pptx` files.
- `pnpm verify` green; PR open.
