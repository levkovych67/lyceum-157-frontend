# Workflow A — Regen `api.json` + Migrate to Orval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stale `api.json` with a fresh swagger snapshot from BE branch `feat/delivery-nova-poshta-backend`, regenerate orval clients, and migrate all 14 consumer files from handwritten `src/shared/api/modules/*` to orval-generated React Query hooks. Delete the `modules/` directory at the end.

**Architecture:** orval generates `src/shared/api/generated/<tag>/<tag>.ts` (one file per OpenAPI tag) with React Query hooks + models. The existing mutator `src/shared/api/orval-mutator.ts` delegates to `client.ts`. We update the barrel `src/shared/api/index.ts` to re-export the generated hooks under canonical names, then replace `authApi.x` / `ordersApi.x` / `kycApi.x` / `studentApi.x` / `adminApi.x` / `catalogApi.x` call-sites one domain at a time. `Page<T>` adapter type is kept; manual `Role` / `OrderStatus` / `PayoutStatus` literal unions stay until BE annotates them.

**Tech Stack:** orval 6 (react-query mode, tags-split), TanStack Query v5, Next.js 14 App Router, Vitest, Playwright. Verification: `pnpm verify` (composite: typecheck + lint + test + scan-images + build + e2e --grep @smoke).

**Spec:** `docs/superpowers/specs/2026-05-15-fe-be-contract-sync-design.md` §2.

---

## File map

**Modify:**
- `lyceum-157-frontend/api.json` — regen from BE swagger.
- `lyceum-157-frontend/src/shared/api/generated/**` — regen by orval (do not hand-edit).
- `lyceum-157-frontend/src/shared/api/index.ts` — barrel: re-export from generated/.
- `lyceum-157-frontend/src/shared/api/types.ts` — keep `Page<T>`, `ProblemDetail`, `Role`, `TokenSnapshot`.
- `lyceum-157-frontend/src/shared/api/orval-mutator.ts` — add Idempotency-Key + credentials handling parity with `client.ts`.
- `lyceum-157-frontend/src/features/auth/model/use-login.ts`
- `lyceum-157-frontend/src/features/auth/model/use-register.ts`
- `lyceum-157-frontend/src/_app/providers/auth-provider.tsx`
- `lyceum-157-frontend/src/features/checkout/model/cart-revalidator.ts`
- `lyceum-157-frontend/src/features/checkout/model/use-create-order.ts`
- `lyceum-157-frontend/src/features/kyc-submit/model/use-submit-kyc.ts`
- `lyceum-157-frontend/src/features/kyc-card-update/ui/kyc-card-update-form.tsx`
- `lyceum-157-frontend/src/views/parent-kyc/ui/parent-kyc-screen.tsx`
- `lyceum-157-frontend/src/features/product-create/model/use-create-product.ts`
- `lyceum-157-frontend/src/features/product-image-upload/model/use-upload-product-image.ts`
- `lyceum-157-frontend/src/features/admin-order-refund/model/use-refund.ts`
- `lyceum-157-frontend/src/features/admin-payout-execute/model/use-execute.ts`
- `lyceum-157-frontend/src/features/admin-product-reject/model/use-reject.ts`
- `lyceum-157-frontend/src/views/admin-tax-report/ui/admin-tax-report-screen.tsx`

**Delete:**
- `lyceum-157-frontend/src/shared/api/modules/auth.ts`
- `lyceum-157-frontend/src/shared/api/modules/catalog.ts`
- `lyceum-157-frontend/src/shared/api/modules/orders.ts`
- `lyceum-157-frontend/src/shared/api/modules/kyc.ts`
- `lyceum-157-frontend/src/shared/api/modules/student.ts`
- `lyceum-157-frontend/src/shared/api/modules/admin.ts`
- `lyceum-157-frontend/src/shared/api/modules/users.ts`
- `lyceum-157-frontend/src/shared/api/modules/` (the directory itself)

**Branch:** `feat/contract-sync-orval-migration` off `main`.

---

## Task 1: Create branch and pre-flight check

**Files:** none (git only)

- [ ] **Step 1: Verify clean working tree on `main`**

Run from `lyceum-157-frontend/`:
```bash
git status
git log -1 --format="%H %s"
```
Expected: clean working tree, latest commit is `7c898cd docs(specs): FE↔BE contract sync sprint design` (or later).

If `public/*.docx` / `public/*.pptx` are deleted unstaged → stash them:
```bash
git stash push -m "WIP: dirty public/ to be handled in PR #3" -- public/
```

- [ ] **Step 2: Create the branch**
```bash
git checkout -b feat/contract-sync-orval-migration
```

- [ ] **Step 3: Verify Node + pnpm + jq + curl available**
```bash
node --version    # expect v20.x or v22.x
pnpm --version    # expect 9.x
jq --version      # expect 1.6+
curl --version    # any
```

If `jq` missing on Windows → `choco install jq` or download from https://jqlang.org/download.

---

## Task 2: Start BE locally and verify swagger is reachable

**Files:** none (terminal session only)

- [ ] **Step 1: Open a second terminal, switch to BE repo and the delivery branch**
```bash
cd ../lyceum-157-backend
git fetch origin
git checkout feat/delivery-nova-poshta-backend
git log -1 --format="%H %s"
```
Expected HEAD: `ac4b4fd docs(readiness): close P0-14, P0-16, P0-17, P0-18 + checkin plan` or later.

- [ ] **Step 2: Bring up infra**
```bash
make up
docker ps --format 'table {{.Names}}\t{{.Status}}' | head -10
```
Expected: containers `postgres`, `redis`, `minio`, `mailhog` (at minimum) running.

- [ ] **Step 3: Start the BE app**
```bash
# In the same terminal:
export APP_AES_SECRET="$(openssl rand -base64 32)"   # 32 bytes → 44 chars
./mvnw spring-boot:run
```
Wait for log line `Started HubApplication in N seconds`.

- [ ] **Step 4: From the FE terminal, sanity-check swagger reachable**
```bash
curl -fsS http://localhost:8080/v3/api-docs | jq '.openapi'
```
Expected: `"3.0.1"` (or `"3.1.0"`, depending on springdoc version).

- [ ] **Step 5: Confirm delivery endpoints exist in swagger**
```bash
curl -fsS http://localhost:8080/v3/api-docs | jq '.paths | keys[] | select(test("delivery"))'
```
Expected output:
```
"/api/v1/delivery/methods"
"/api/v1/delivery/nova-poshta/cities"
"/api/v1/delivery/nova-poshta/cities/{cityRef}/branches"
```

If empty → wrong BE branch. Stop, fix, retry.

---

## Task 3: Regenerate `api.json`

**Files:**
- Modify: `lyceum-157-frontend/api.json`

- [ ] **Step 1: Fetch swagger and save with stable key order**

Run from `lyceum-157-frontend/`:
```bash
curl -fsS http://localhost:8080/v3/api-docs | jq -S . > api.json
```

- [ ] **Step 2: Sanity-check new paths**
```bash
jq '.paths | keys[]' api.json | wc -l
jq '.paths | keys[] | select(test("delivery|student/orders|admin/payouts$|admin/orders$"))' api.json
```
Expected: line count ≥ 32 (was ~30 stale).
Expected paths in second command:
```
"/api/v1/admin/orders"
"/api/v1/admin/orders/{orderId}"
"/api/v1/admin/payouts"
"/api/v1/admin/payouts/{payoutId}/approve"
"/api/v1/admin/payouts/{payoutId}/reject"
"/api/v1/delivery/methods"
"/api/v1/delivery/nova-poshta/cities"
"/api/v1/delivery/nova-poshta/cities/{cityRef}/branches"
"/api/v1/student/orders"
```

- [ ] **Step 3: Sanity-check that `recaptchaToken` and `delivery` are in `CreateOrderRequest`**
```bash
jq '.components.schemas.CreateOrderRequest.properties | keys' api.json
```
Expected to include `"delivery"`, `"recaptchaToken"`, `"items"`, `"buyerEmail"`, `"buyerName"`, `"buyerPhone"`.

- [ ] **Step 4: Commit**
```bash
git add api.json
git commit -m "chore(api): regen api.json from feat/delivery-nova-poshta-backend swagger"
```

---

## Task 4: Regenerate orval clients

**Files:**
- Modify: `lyceum-157-frontend/src/shared/api/generated/**` (auto)

- [ ] **Step 1: Run orval**
```bash
pnpm orval
```
Expected: `🎉 lyceumApi - Your OpenAPI spec has been converted...`. No errors.

- [ ] **Step 2: Inspect newly generated dirs**
```bash
ls src/shared/api/generated/
```
Expected to include new dirs: `delivery/`, and either `student-orders/` (own tag) or extension of `student-finance/`. Confirm by:
```bash
find src/shared/api/generated -name '*.ts' | xargs grep -l 'delivery'
find src/shared/api/generated -name '*.ts' | xargs grep -l 'student/orders\|student-orders'
```
Expected: both find at least one file.

- [ ] **Step 3: Confirm new models exist**
```bash
ls src/shared/api/generated/models | grep -iE 'delivery|novaposhta'
ls src/shared/api/generated/models | grep -iE 'studentOrder'
```
Expected: files like `deliveryRequest.ts`, `novaPoshtaCityDto.ts`, `novaPoshtaBranchDto.ts`, `novaPoshtaDetailsRequest.ts`, `studentOrderItemDto.ts` (or similar).

- [ ] **Step 4: Confirm `recaptchaToken` in createOrderRequest model**
```bash
grep -n "recaptchaToken\|delivery" src/shared/api/generated/models/createOrderRequest.ts
```
Expected: both keywords present.

- [ ] **Step 5: Run typecheck to see baseline downstream breakage**
```bash
pnpm typecheck 2>&1 | tee /tmp/typecheck-before.txt | tail -30
```
This will fail in many places (consumers still expect handwritten module types). Save the count:
```bash
grep -c "error TS" /tmp/typecheck-before.txt
```
Note this number — it should drop to 0 after Tasks 6–11.

- [ ] **Step 6: Commit**
```bash
git add src/shared/api/generated/
git commit -m "chore(api): regen orval clients (delivery, student-orders, admin lists)"
```

---

## Task 5: Update `orval-mutator.ts` and barrel

**Files:**
- Modify: `lyceum-157-frontend/src/shared/api/orval-mutator.ts`
- Modify: `lyceum-157-frontend/src/shared/api/index.ts`

The mutator currently forwards `method`/`headers`/`body`/`signal` to `client.api`. It does **not** propagate `Idempotency-Key` or TOTP, because orval-generated hooks don't pass them through options. We add a third-argument escape hatch.

- [ ] **Step 1: Write a vitest unit for the mutator**

Create `lyceum-157-frontend/src/shared/api/__tests__/orval-mutator.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const apiMock = vi.fn(async () => ({ ok: true }));
vi.mock("@/shared/api/client", () => ({ api: (...args: unknown[]) => apiMock(...args) }));

import { customFetch } from "@/shared/api/orval-mutator";

describe("customFetch", () => {
  beforeEach(() => apiMock.mockClear());

  it("forwards method, headers, body, signal", async () => {
    const ac = new AbortController();
    await customFetch<{ ok: true }>("/x", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"a":1}',
      signal: ac.signal,
    });
    expect(apiMock).toHaveBeenCalledOnce();
    const [path, opts] = apiMock.mock.calls[0]!;
    expect(path).toBe("/x");
    expect(opts.method).toBe("POST");
    expect(opts.signal).toBe(ac.signal);
  });

  it("propagates idemKey and totp via an extras argument", async () => {
    await customFetch<{ ok: true }>(
      "/x",
      { method: "POST", body: "{}" },
      { idemKey: "abc-123", totp: "999000" },
    );
    const [, opts] = apiMock.mock.calls[0]!;
    expect(opts.idemKey).toBe("abc-123");
    expect(opts.totp).toBe("999000");
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL**
```bash
pnpm test src/shared/api/__tests__/orval-mutator.test.ts
```
Expected: "propagates idemKey and totp via an extras argument" fails (current signature is 2-arg).

- [ ] **Step 3: Update the mutator to accept extras**

Replace `lyceum-157-frontend/src/shared/api/orval-mutator.ts` with:
```ts
import { api, type ApiOptions } from "@/shared/api/client";

export type CustomFetchExtras = Pick<ApiOptions, "idemKey" | "totp" | "auth">;

export const customFetch = <T>(
  url: string,
  init?: RequestInit,
  extras?: CustomFetchExtras,
): Promise<T> => {
  const opts: ApiOptions = {
    method: init?.method,
    headers: init?.headers as ApiOptions["headers"],
    body: init?.body as ApiOptions["body"],
    signal: init?.signal ?? undefined,
    ...(extras ?? {}),
  };
  return api<T>(url, opts);
};

export default customFetch;
```

- [ ] **Step 4: Run the test, expect PASS**
```bash
pnpm test src/shared/api/__tests__/orval-mutator.test.ts
```
Expected: 2/2 pass.

- [ ] **Step 5: Rewrite `src/shared/api/index.ts` to re-export from generated**

Replace with:
```ts
export * from "./constants";
export * from "./types";
export {
  ProductStatus,
  type ProductStatusValue,
  ProductType,
  type ProductTypeValue,
  KycStatus,
  type KycStatusValue,
  type OrderStatus,
  type PayoutStatus,
} from "./enums";
export * from "./errors";
export * from "./error-messages";
export * from "./api-error-to-form";
export * from "./auth-token";
export * from "./refresh";
export * from "./idempotency";
export * from "./client";
export * from "./dispatch-problem";
export * from "./upload-s3";
export * from "./revalidate";

// Re-export selected generated models under canonical type names.
// Hooks stay imported directly from generated/* at call sites.
export type { CreateOrderRequest, OrderCreationResponse } from "./generated/models";
export type { RegisterRequest, RegisterResponse, LoginRequest, TokenResponse } from "./generated/models";
export type { KycSessionResponse, KycSubmitRequest, KycSubmitResponse } from "./generated/models";
export type {
  CreateProductRequest,
  EditProductRequest,
  ConfirmImageRequest,
  FinanceSummaryDto,
  PresignedUploadDto,
  ProductCardDto,
  ProductDetailDto,
  AuthorDto,
  AdminProductDto,
  TotpEnrollResponse,
  PayoutBatchRequest,
  PayoutBatchResponse,
  DeliveryRequest,
  NovaPoshtaDetailsRequest,
  NovaPoshtaCityDto,
  NovaPoshtaBranchDto,
  StudentOrderItemDto,
} from "./generated/models";

// Catalog `Sort` was a handwritten literal union; preserve here until BE annotates.
export type Sort = "newest" | "price_asc" | "price_desc" | "popular";
```

- [ ] **Step 6: Run typecheck**
```bash
pnpm typecheck 2>&1 | grep -c "error TS"
```
Note: will still fail on call-sites — that's expected, we migrate them in Tasks 6–11.

- [ ] **Step 7: Commit**
```bash
git add src/shared/api/orval-mutator.ts src/shared/api/__tests__/orval-mutator.test.ts src/shared/api/index.ts
git commit -m "feat(api): mutator extras (idemKey, totp); barrel re-exports from generated"
```

---

## Task 6: Migrate `auth` domain (3 files)

**Files:**
- Modify: `lyceum-157-frontend/src/features/auth/model/use-login.ts`
- Modify: `lyceum-157-frontend/src/features/auth/model/use-register.ts`
- Modify: `lyceum-157-frontend/src/_app/providers/auth-provider.tsx`

**Premise:** the generated `auth/auth.ts` file exposes hooks like `useLogin`, `useRegister`, `useLogout`, plus underlying `login()`, `register()`, `logout()` plain async functions. Names depend on orval's tag-to-function naming — verify in Step 1 below before editing.

- [ ] **Step 1: Inspect generated auth client**
```bash
grep -nE "^export (function|const) " src/shared/api/generated/auth/auth.ts | head -20
```
Identify the exact exported names. Below this plan assumes `login`, `useLoginHook` or `useLogin`. If actual names differ, swap them in the edits below.

- [ ] **Step 2: Replace `use-login.ts`**

`lyceum-157-frontend/src/features/auth/model/use-login.ts`:
```ts
import { useMutation } from "@tanstack/react-query";
import { login } from "@/shared/api/generated/auth/auth";
import { setSnapshot } from "@/shared/api";

export function useLogin() {
  return useMutation({
    mutationFn: (b: { email: string; password: string }) => login(b),
    onSuccess: (data) => {
      setSnapshot({
        accessToken: data.accessToken,
        userId: data.userId,
        role: data.role,
        expiresAt: Date.now() + data.expiresIn * 1000,
      });
    },
  });
}
```

- [ ] **Step 3: Replace `use-register.ts`**

`lyceum-157-frontend/src/features/auth/model/use-register.ts`:
```ts
import { useMutation } from "@tanstack/react-query";
import { register } from "@/shared/api/generated/auth/auth";
import type { RegisterRequest } from "@/shared/api";

export function useRegister() {
  return useMutation({ mutationFn: (b: RegisterRequest) => register(b) });
}
```

- [ ] **Step 4: Patch `auth-provider.tsx`**

Open `lyceum-157-frontend/src/_app/providers/auth-provider.tsx` and replace any `authApi.logout()` call with the generated `logout()` import:
```ts
// at top:
import { logout as apiLogout } from "@/shared/api/generated/auth/auth";

// in the body, replace:
//   await authApi.logout().catch(() => {});
// with:
await apiLogout().catch(() => {});
```
Also remove the `authApi` from the import list at the top of the file.

- [ ] **Step 5: Typecheck just the 3 files**
```bash
pnpm typecheck 2>&1 | grep -E "use-login|use-register|auth-provider"
```
Expected: 0 lines (no errors in these files).

- [ ] **Step 6: Run any auth tests**
```bash
pnpm test src/features/auth
```
Expected: pass (or skip if no tests exist).

- [ ] **Step 7: Commit**
```bash
git add src/features/auth src/_app/providers/auth-provider.tsx
git commit -m "refactor(auth): migrate to orval-generated client"
```

---

## Task 7: Migrate `catalog` domain (1 file)

**Files:**
- Modify: `lyceum-157-frontend/src/features/checkout/model/cart-revalidator.ts`

- [ ] **Step 1: Inspect generated catalog client**
```bash
grep -nE "^export (function|const) " src/shared/api/generated/catalog/catalog.ts | head -10
```
Identify the function for `GET /api/v1/products/{slug}` (likely `getProductBySlug` or `getBySlug`).

- [ ] **Step 2: Replace `cart-revalidator.ts`**

`lyceum-157-frontend/src/features/checkout/model/cart-revalidator.ts`:
```ts
import { getProductBySlug } from "@/shared/api/generated/catalog/catalog"; // adjust function name to match generated
import { ApiError } from "@/shared/api";
import type { CartItem } from "@/entities/cart";

export type CartRevalidationIssue = { productId: string; reason: "GONE" | "STOCK" | "PRICE" };

export async function revalidateCart(items: CartItem[]): Promise<CartRevalidationIssue[]> {
  const issues: CartRevalidationIssue[] = [];
  for (const it of items) {
    try {
      const p = await getProductBySlug(it.slug);
      if (p.stockQty < it.qty) issues.push({ productId: it.productId, reason: "STOCK" });
      if (String(p.priceUah) !== String(it.priceUah)) issues.push({ productId: it.productId, reason: "PRICE" });
    } catch (e) {
      if (e instanceof ApiError && e.problem.status === 404) {
        issues.push({ productId: it.productId, reason: "GONE" });
      } else {
        throw e;
      }
    }
  }
  return issues;
}
```

- [ ] **Step 3: Typecheck**
```bash
pnpm typecheck 2>&1 | grep "cart-revalidator"
```
Expected: 0 lines.

- [ ] **Step 4: Run checkout tests**
```bash
pnpm test src/features/checkout
```
Expected: pass.

- [ ] **Step 5: Commit**
```bash
git add src/features/checkout/model/cart-revalidator.ts
git commit -m "refactor(checkout): cart-revalidator uses orval catalog client"
```

---

## Task 8: Migrate `orders` domain (1 file)

**Files:**
- Modify: `lyceum-157-frontend/src/features/checkout/model/use-create-order.ts`

**Note:** This task wires the **shape** to the new contract (delivery + recaptchaToken). The actual UI for delivery/recaptcha is built in Workflow B; for now we pass `delivery: undefined` and `recaptchaToken: null`. With `app.captcha.enabled=false` and digital-only carts, this works. Physical carts will start failing — that's expected and unblocks Workflow B.

- [ ] **Step 1: Inspect generated orders client**
```bash
grep -nE "^export (function|const) " src/shared/api/generated/orders/orders.ts
```
Find the create-order function (likely `createOrder`) and `useCreateOrder` hook.

- [ ] **Step 2: Replace `use-create-order.ts`**

`lyceum-157-frontend/src/features/checkout/model/use-create-order.ts`:
```ts
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/shared/api/generated/orders/orders";
import { ApiError, fallbackProblem } from "@/shared/api";
import type { CreateOrderRequest, OrderCreationResponse, DeliveryRequest } from "@/shared/api";

type Input = Omit<CreateOrderRequest, "recaptchaToken" | "delivery"> & {
  delivery?: DeliveryRequest;
  recaptchaToken?: string | null;
};

export function useCreateOrder() {
  return useMutation<OrderCreationResponse, ApiError, Input>({
    mutationFn: async (input) => {
      const body: CreateOrderRequest = {
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        buyerPhone: input.buyerPhone,
        items: input.items,
        delivery: input.delivery,
        recaptchaToken: input.recaptchaToken ?? null,
      };
      const initialKey = crypto.randomUUID();
      try {
        return await createOrder(body, undefined, { idemKey: initialKey });
      } catch (e) {
        if (e instanceof ApiError && e.problem.status === 409 && e.problem.type === "urn:l157:idempotency/key-conflict") {
          return createOrder(body, undefined, { idemKey: crypto.randomUUID() });
        }
        throw e;
      }
    },
  });
}
```

> **Note on `createOrder` signature:** orval typically emits `(body, params?, options?)`. Verify by `grep -A3 "export const createOrder" src/shared/api/generated/orders/orders.ts`. If the third argument is `AxiosRequestConfig`-shaped, replace `{ idemKey: initialKey }` with whatever the mutator expects (see Task 5 — our mutator accepts `CustomFetchExtras`). If orval emits hooks-only (no plain function), use `useMutation` from orval directly + pass extras via `mutation.mutate(body, { onSuccess: ..., meta: { idemKey } })` and read `meta` in the mutator.

- [ ] **Step 3: Typecheck**
```bash
pnpm typecheck 2>&1 | grep "use-create-order"
```
Expected: 0 lines.

- [ ] **Step 4: Run tests**
```bash
pnpm test src/features/checkout
```
Expected: pass (existing tests don't exercise delivery yet).

- [ ] **Step 5: Commit**
```bash
git add src/features/checkout/model/use-create-order.ts
git commit -m "refactor(checkout): use-create-order on orval client; delivery+recaptcha pass-through"
```

---

## Task 9: Migrate `kyc` domain (3 files)

**Files:**
- Modify: `lyceum-157-frontend/src/features/kyc-submit/model/use-submit-kyc.ts`
- Modify: `lyceum-157-frontend/src/features/kyc-card-update/ui/kyc-card-update-form.tsx`
- Modify: `lyceum-157-frontend/src/views/parent-kyc/ui/parent-kyc-screen.tsx`

- [ ] **Step 1: Inspect generated kyc-parent client**
```bash
grep -nE "^export (function|const) " src/shared/api/generated/kyc-parent/kyc-parent.ts
```
Identify functions for: `GET /kyc/session/{token}` (likely `getKycSession`), `POST /kyc/parents/submit` (likely `submit`/`submitKyc`), `POST /kyc/parents/update-card` (likely `updateCard`).

- [ ] **Step 2: Replace `use-submit-kyc.ts`**

`lyceum-157-frontend/src/features/kyc-submit/model/use-submit-kyc.ts`:
```ts
import { useMutation } from "@tanstack/react-query";
import { submit as submitKyc } from "@/shared/api/generated/kyc-parent/kyc-parent"; // adjust to actual name
import type { KycSubmitRequest } from "@/shared/api";

export function useSubmitKyc(token: string) {
  return useMutation({ mutationFn: (b: KycSubmitRequest) => submitKyc(token, b) });
}
```

- [ ] **Step 3: Replace `kyc-card-update-form.tsx`**

Open file, replace:
```ts
// before:
import { kycApi } from "@/shared/api";
const m = useMutation({ mutationFn: (card: string) => kycApi.updateCard(token, card) });
// after:
import { updateCard } from "@/shared/api/generated/kyc-parent/kyc-parent"; // adjust
const m = useMutation({ mutationFn: (card: string) => updateCard(token, { card }) });
```
(`updateCard` request shape — check the generated `cardUpdateRequest.ts` model. If it's `{ card: string }`, the call is `updateCard(token, { card })`. If it's `{ panLast4: string }` or similar, adapt.)

- [ ] **Step 4: Replace `parent-kyc-screen.tsx`**

In `parent-kyc-screen.tsx`, replace:
```ts
import { kycApi } from "@/shared/api";
// queryFn: () => kycApi.peek(token),
```
with:
```ts
import { useGetKycSession } from "@/shared/api/generated/kyc-parent/kyc-parent"; // verify name
const { data, isPending, error } = useGetKycSession(token);
```
Delete the `useQuery({ queryKey:[...], queryFn:... })` boilerplate; orval-generated `useGetKycSession` handles it.

- [ ] **Step 5: Typecheck**
```bash
pnpm typecheck 2>&1 | grep -E "kyc-submit|kyc-card-update|parent-kyc"
```
Expected: 0 lines.

- [ ] **Step 6: Run kyc tests**
```bash
pnpm test src/features/kyc-submit src/features/kyc-card-update src/views/parent-kyc
```
Expected: pass.

- [ ] **Step 7: Commit**
```bash
git add src/features/kyc-submit src/features/kyc-card-update src/views/parent-kyc
git commit -m "refactor(kyc): migrate to orval-generated kyc-parent client"
```

---

## Task 10: Migrate `student` domain (2 files)

**Files:**
- Modify: `lyceum-157-frontend/src/features/product-create/model/use-create-product.ts`
- Modify: `lyceum-157-frontend/src/features/product-image-upload/model/use-upload-product-image.ts`

- [ ] **Step 1: Inspect generated student-products client**
```bash
grep -nE "^export (function|const) " src/shared/api/generated/student-products/student-products.ts | head -20
```
Identify: `create` (POST `/student/products`), `uploadUrl` (POST `/student/products/{id}/images/upload-url`), `confirmImg` (POST `/student/products/{id}/images/confirm`).

- [ ] **Step 2: Replace `use-create-product.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { create as createProduct } from "@/shared/api/generated/student-products/student-products"; // adjust
import type { CreateProductRequest } from "@/shared/api";

export function useCreateProduct() {
  return useMutation({ mutationFn: (b: CreateProductRequest) => createProduct(b) });
}
```

- [ ] **Step 3: Replace `use-upload-product-image.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import {
  uploadUrl as getUploadUrl,
  confirmImg as confirmProductImage,
} from "@/shared/api/generated/student-products/student-products"; // adjust names
import { uploadToS3 } from "@/shared/api";

export function useUploadProductImage(productId: string) {
  return useMutation({
    mutationFn: async (input: { file: File; primary: boolean }) => {
      const ct = input.file.type as "image/jpeg" | "image/png" | "image/webp";
      const presigned = await getUploadUrl(productId, { contentType: ct });
      await uploadToS3(presigned, input.file);
      await confirmProductImage(productId, {
        s3Key: presigned.s3Key,
        declaredMimeType: ct,
        primary: input.primary,
      });
    },
  });
}
```
(Exact field names of `PresignedUploadDto` and the upload-url request body match the model files in `src/shared/api/generated/models/`. Adjust accordingly.)

- [ ] **Step 4: Typecheck**
```bash
pnpm typecheck 2>&1 | grep -E "use-create-product|use-upload-product-image"
```
Expected: 0 lines.

- [ ] **Step 5: Run tests**
```bash
pnpm test src/features/product-create src/features/product-image-upload
```
Expected: pass.

- [ ] **Step 6: Commit**
```bash
git add src/features/product-create src/features/product-image-upload
git commit -m "refactor(student): product-create/image-upload on orval client"
```

---

## Task 11: Migrate `admin` domain (4 files)

**Files:**
- Modify: `lyceum-157-frontend/src/features/admin-order-refund/model/use-refund.ts`
- Modify: `lyceum-157-frontend/src/features/admin-payout-execute/model/use-execute.ts`
- Modify: `lyceum-157-frontend/src/features/admin-product-reject/model/use-reject.ts`
- Modify: `lyceum-157-frontend/src/views/admin-tax-report/ui/admin-tax-report-screen.tsx`

- [ ] **Step 1: Inspect generated admin clients**
```bash
grep -nE "^export (function|const) " src/shared/api/generated/admin-orders/admin-orders.ts | head
grep -nE "^export (function|const) " src/shared/api/generated/admin-payouts/admin-payouts.ts | head
grep -nE "^export (function|const) " src/shared/api/generated/admin-products/admin-products.ts | head
grep -nE "^export (function|const) " src/shared/api/generated/admin-tax-report/admin-tax-report.ts | head
```

- [ ] **Step 2: Replace `use-refund.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { refund as refundOrder } from "@/shared/api/generated/admin-orders/admin-orders"; // adjust
import { ApiError } from "@/shared/api";

export function useRefund(orderId: string) {
  return useMutation<void, ApiError, string>({
    mutationFn: (reason) => refundOrder(orderId, { reason }),
  });
}
```

- [ ] **Step 3: Replace `use-execute.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { execute as executePayouts } from "@/shared/api/generated/admin-payouts/admin-payouts"; // adjust
import { ApiError } from "@/shared/api";
import type { PayoutBatchResponse } from "@/shared/api";

export function useExecutePayouts() {
  return useMutation<PayoutBatchResponse, ApiError, { payoutIds: string[]; code: string }>({
    mutationFn: ({ payoutIds, code }) =>
      executePayouts({ payoutIds }, undefined, { totp: code }),
  });
}
```

- [ ] **Step 4: Replace `use-reject.ts`**

```ts
import { useMutation } from "@tanstack/react-query";
import { reject as rejectProduct } from "@/shared/api/generated/admin-products/admin-products"; // adjust
import { ApiError, revalidateOnClient } from "@/shared/api";

export function useReject(id: string) {
  return useMutation<void, ApiError, string>({
    mutationFn: async (reason) => {
      await rejectProduct(id, { reason });
      revalidateOnClient(["catalog", `product:${id}`]);
    },
  });
}
```

- [ ] **Step 5: Replace `admin-tax-report-screen.tsx`**

Open the file and find `downloadTaxReport(from, to, accessToken)`. Replace with the generated client function (likely `getTaxReport(from, to)` from `admin-tax-report/admin-tax-report.ts`) — orval handles auth via the shared mutator (which reads `Bearer` from `auth-token.ts`). After fetching, trigger blob download in the screen component:
```ts
import { getTaxReport } from "@/shared/api/generated/admin-tax-report/admin-tax-report"; // adjust

async function onDownload(from: string, to: string) {
  const blob = await getTaxReport({ from, to });
  const url = URL.createObjectURL(blob as Blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `4DF_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```
> **CSV content-type handling:** `client.ts:52` already returns the response body (stream) for `text/csv`. orval may type the response as `unknown` or `Blob` depending on schema. If the type is wrong, cast as above. Also verify the generated function returns `Blob` (configure orval `responseType: "blob"` for that endpoint if it returns `string`).

- [ ] **Step 6: Typecheck**
```bash
pnpm typecheck 2>&1 | grep -E "admin-order-refund|admin-payout-execute|admin-product-reject|admin-tax-report"
```
Expected: 0 lines.

- [ ] **Step 7: Run admin tests**
```bash
pnpm test src/features/admin-order-refund src/features/admin-payout-execute src/features/admin-product-reject src/views/admin-tax-report
```
Expected: pass.

- [ ] **Step 8: Commit**
```bash
git add src/features/admin-order-refund src/features/admin-payout-execute src/features/admin-product-reject src/views/admin-tax-report
git commit -m "refactor(admin): migrate refund/payout/reject/tax-report to orval client"
```

---

## Task 12: Delete `modules/` directory

**Files:**
- Delete: `lyceum-157-frontend/src/shared/api/modules/` (entire directory)

- [ ] **Step 1: Sanity check — no remaining imports**
```bash
grep -rn "from ['\"]@/shared/api/modules\|catalogApi\|ordersApi\|authApi\|kycApi\|usersApi\|studentApi\|adminApi\|downloadTaxReport" src --include='*.ts' --include='*.tsx' | grep -v "src/shared/api/modules"
```
Expected: 0 lines.

If any matches → migrate those files using the same pattern as Tasks 6–11 before proceeding.

- [ ] **Step 2: Delete the directory**
```bash
git rm -r src/shared/api/modules
```

- [ ] **Step 3: Run `pnpm typecheck`**
```bash
pnpm typecheck
```
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git commit -m "chore(api): remove handwritten modules/ (fully migrated to orval)"
```

---

## Task 13: Full verification

**Files:** none (build/test only)

- [ ] **Step 1: Lint**
```bash
pnpm lint
```
Expected: 0 errors. If `eslint-plugin-boundaries` complains about new imports — they should all stay within `shared` → consumer direction.

- [ ] **Step 2: Unit + integration tests**
```bash
pnpm test --run
```
Expected: full suite green.

- [ ] **Step 3: Build**
```bash
pnpm build
```
Expected: green (no SSR/RSC import-shape mismatch).

- [ ] **Step 4: Composite verify**
```bash
pnpm verify
```
Expected: composite (typecheck + lint + test + scan-images + build + e2e --grep @smoke) green. Physical-cart e2e may fail (delivery UI not built yet) — confirm it's not in the smoke set. If `@smoke` includes physical-cart, temporarily exclude it with a `test.skip` annotation and note in PR description (it gets re-enabled in Workflow B).

- [ ] **Step 5: Manual smoke (browser)**

In `lyceum-157-frontend/`:
```bash
pnpm dev
```
Open `http://localhost:3000`, confirm:
- Catalog renders.
- Login flow works (use any seeded student).
- Cart + checkout with **digital-only** product → redirected to LiqPay URL (success path).
- KYC parent flow renders.
- Admin dashboard loads.

If anything is red — open the failing module and adjust import names per the actual generated symbols.

- [ ] **Step 6: Final commit if any tweaks needed during smoke**

If you made fixes:
```bash
git commit -am "fix(api): post-migration tweaks discovered during manual smoke"
```

---

## Task 14: Push and open PR

**Files:** none (git only)

- [ ] **Step 1: Push branch**
```bash
git push -u origin feat/contract-sync-orval-migration
```

- [ ] **Step 2: Open PR via gh CLI** (or web)
```bash
gh pr create --title "feat(api): contract sync — regen api.json + migrate to orval" --body "$(cat <<'EOF'
## Summary
- Regenerate api.json from BE feat/delivery-nova-poshta-backend swagger.
- Migrate all 14 consumer files from handwritten src/shared/api/modules/* to orval-generated React Query hooks.
- Delete src/shared/api/modules/ entirely.
- Mutator accepts CustomFetchExtras (idemKey, totp).

## Test plan
- [ ] pnpm verify green locally
- [ ] Manual smoke: catalog, login, digital-cart checkout, KYC, admin dashboard
- [ ] Physical-cart e2e skipped (delivery UI lands in PR #4 / Workflow B)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Stop BE locally**

In the BE terminal: Ctrl+C the `mvnw spring-boot:run`, then:
```bash
cd ../lyceum-157-backend
make down
```

---

## Done criteria

- `lyceum-157-frontend/src/shared/api/modules/` does not exist.
- `grep -rn "modules/" src` → 0 hits.
- `pnpm verify` green.
- `api.json` includes `/api/v1/delivery/*`, `/api/v1/student/orders`, `/api/v1/admin/orders` list+detail, `/api/v1/admin/payouts` list + approve + reject.
- `CreateOrderRequest` model has both `delivery` and `recaptchaToken` fields.
- PR opened, CI green (modulo any unrelated environment flakes).
