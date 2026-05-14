# API Contract — Lyceum 157 Hub (FE-perspective)

> **Source of truth (BE):** `../../../../lyceum-157-backend/docs/superpowers/specs/API_CONTRACT.md`.
> Цей файл — FE-perspective: які endpoints FE **зараз споживає**, які **повинен**, mapping до features/views, що **застаріло** в `api.json`.

**Дата audit:** 2026-05-13.
**Базовий URL:** `${NEXT_PUBLIC_API_BASE}` (default `http://localhost:8080`).

---

## 🔥 Status overview

| Категорія | BE expose | FE api.json знає | FE consumer існує |
|---|---|---|---|
| Public (auth/catalog/orders) | 7 | 7 ✅ | 7 ✅ |
| Parent KYC | 3 | 3 ✅ | 1-2 (UI stubs) ⚠️ |
| Student profile | 2 | 1 (GET) ⚠️ | 1 |
| Student products | 13 | 8 ⚠️ | 5 (рештa — у P0-1 stub) |
| Student orders | 1 | 0 ❌ | 0 ❌ (BACKEND-CHANGES.md A.5) |
| Student finance | 1 | 1 ✅ | 1 ✅ |
| Admin products | 3 | 3 ✅ | mostly stubs |
| Admin orders | 3 | 1 (refund) ⚠️ | 0 (stub) |
| Admin payouts | 4 | 2 (execute, export) ⚠️ | 0 (stub) |
| Admin 2FA | 3 | 3 ✅ | partial |
| Webhooks | 2 | 0 (irrelevant for FE) | 0 |

**Висновок:** 11 endpoints у BE, яких **немає в FE `api.json`**. Це блокер для feature P0-1 (edit screen), admin UI, GDPR account delete.

---

## Missing in FE `api.json` (повний список)

| # | Endpoint | Який FE feature blocks |
|---|---|---|
| 1 | `GET /api/v1/student/orders` | Student "My Sales" screen (BACKEND-CHANGES.md A.5) |
| 2 | `POST /api/v1/student/products/{id}/resubmit` | Edit-screen resubmit after REJECTED |
| 3 | `PUT /api/v1/student/products/{id}/images/reorder` | Image gallery reorder + set primary (P0-1 FE) |
| 4 | `DELETE /api/v1/student/products/{id}/images/{imageId}` | Image gallery delete (P0-1 FE) |
| 5 | `DELETE /api/v1/users/me` | GDPR account deletion screen |
| 6 | `GET /api/v1/admin/orders` | Admin orders list |
| 7 | `GET /api/v1/admin/orders/{orderId}` | Admin order detail (for refund UI) |
| 8 | `GET /api/v1/admin/payouts` | Admin payouts list |
| 9 | `POST /api/v1/admin/payouts/{id}/approve` | Admin approve (TOTP) |
| 10 | `POST /api/v1/admin/payouts/{id}/reject` | Admin reject (TOTP) |
| 11 | `POST /api/v1/student/products/{id}/hide` and `/unhide` | Student visibility toggle |

---

## Endpoint → FE consumer mapping

### Public

| Endpoint | FE module |
|---|---|
| `POST /auth/register` | `src/features/auth/register/api/register.ts` |
| `POST /auth/login` | `src/features/auth/login/api/login.ts` |
| `POST /auth/refresh` | `src/shared/api/refresh.ts` |
| `POST /auth/logout` | `src/features/auth/logout/api/logout.ts` |
| `GET /products` | `src/views/catalog/api/list-products.ts` (RSC + ISR `tag: 'catalog'`) |
| `GET /products/{slug}` | `src/views/product-detail/api/get-product.ts` (RSC + ISR `tag: 'product:{slug}'`) |
| `POST /orders` | `src/features/checkout/api/create-order.ts` |

### Parent KYC

| Endpoint | FE module |
|---|---|
| `GET /kyc/session/{token}` | `src/views/parent/kyc/api/get-session.ts` *(stub)* |
| `POST /kyc/parents/submit` | `src/features/kyc-submit/api/submit-kyc.ts` *(stub)* |
| `POST /kyc/parents/update-card` | `src/features/kyc-card-update/api/update-card.ts` *(not built)* |

### Student

| Endpoint | FE module / status |
|---|---|
| `GET /users/me` | `src/_app/providers/auth-provider.tsx` consumer |
| `DELETE /users/me` | ❌ FE module не існує (P0+ задача) |
| `GET /student/products` | `src/views/student/products-list/api/list.ts` *(stub)* |
| `GET /student/products/{id}` | ❌ FE module не існує (P0-1 FE) |
| `POST /student/products` | `src/features/product-create/api/create.ts` |
| `PUT /student/products/{id}` | ❌ FE module не існує (P0-1 FE) |
| `POST /student/products/{id}/submit` | ❌ FE module не існує (P0-1 FE) |
| `POST /student/products/{id}/resubmit` | ❌ FE module не існує (P0-1 FE) |
| `POST /student/products/{id}/hide` | ❌ FE module не існує |
| `POST /student/products/{id}/unhide` | ❌ FE module не існує |
| `DELETE /student/products/{id}` | ❌ FE module не існує |
| `POST /.../images/upload-url` | ❌ FE module не існує (P0-1 FE) |
| `DELETE /.../images/{imageId}` | ❌ FE module не існує (P0-1 FE) |
| `PUT /.../images/reorder` | ❌ FE module не існує (P0-1 FE) |
| `POST /.../images/confirm` | ❌ FE module не існує (P0-1 FE) |
| `GET /student/orders` | ❌ FE module не існує (BACKEND-CHANGES.md A.5) |
| `GET /student/finance/summary` | `src/views/student/dashboard/api/finance.ts` |

### Admin

| Endpoint | FE module / status |
|---|---|
| `GET /admin/products` | `src/views/admin/products-queue/api/list.ts` *(partial)* |
| `POST /admin/products/{id}/approve` | `src/features/product-approve/api/approve.ts` *(stub)* |
| `POST /admin/products/{id}/reject` | `src/features/product-reject/api/reject.ts` *(stub)* |
| `GET /admin/orders` | ❌ FE module не існує |
| `GET /admin/orders/{id}` | ❌ FE module не існує |
| `POST /admin/orders/{id}/refund` | ❌ FE module не існує |
| `GET /admin/payouts` | ❌ FE module не існує |
| `POST /admin/payouts/{id}/approve` | ❌ FE module не існує |
| `POST /admin/payouts/{id}/reject` | ❌ FE module не існує |
| `POST /admin/payouts/execute` | `src/features/payout-execute/api/execute.ts` *(stub)* |
| `GET /admin/payouts/export/tax-report` | `src/features/tax-report/api/download.ts` |
| `POST /admin/2fa/enroll` | `src/features/admin-2fa/api/enroll.ts` |
| `POST /admin/2fa/confirm` | `src/features/admin-2fa/api/confirm.ts` |
| `POST /admin/2fa/verify` | `src/features/admin-2fa/api/verify.ts` |

---

## Headers / cookies FE має слати

### Authentication
```typescript
fetch(url, {
  headers: { 'Authorization': `Bearer ${accessToken}` },
  credentials: 'include',  // ТІЛЬКИ для /auth/* — refresh_token cookie
})
```

### Mutating order
```typescript
fetch('/api/v1/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Idempotency-Key': crypto.randomUUID(),
    'Authorization': accessToken ? `Bearer ${accessToken}` : undefined,
  },
  body: JSON.stringify(createOrderRequest),
})
```

### Admin TOTP-gated
```typescript
fetch('/api/v1/admin/payouts/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'X-TOTP-Code': totpCode,  // 6-digit string
  },
  body: JSON.stringify(payoutBatchRequest),
})
```

---

## Error handling pattern

```typescript
// src/shared/api/errors.ts
type ProblemDetail = {
  type: string;        // urn:l157:*
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  extensions?: Record<string, unknown>;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const problem = await res.json() as ProblemDetail;
    throw new ApiError(problem);
  }
  return res.json();
}

// FE behaviour by problem-type:
const errorHandlers = {
  'urn:l157:auth/email-not-verified': () => router.push('/verify-email'),
  'urn:l157:product/kyc-required': () => router.push('/student/dashboard?kycRequired=1'),
  'urn:l157:checkout/insufficient-stock': () => invalidateQueries(['catalog']),
  'urn:l157:resource/concurrent-modification': () => toast('Хтось щойно це змінив'),
  'urn:l157:idem/conflict': () => toast('Повторна відправка з іншими даними'),
};
```

---

## Enum mapping BE ↔ FE

⚠️ **Name skew risk.** Звірити кожен enum:

| BE enum | BE values | FE expects | Action |
|---|---|---|---|
| `OrderStatus` | `PENDING_PAYMENT, PAID, FULFILLED, DELIVERED, REFUNDED, EXPIRED, FAILED, CANCELLED, DISPUTED` | TBD | Перевірити `src/shared/api/types/order.ts` |
| `ProductStatus` | `DRAFT, PENDING_REVIEW, ACTIVE, HIDDEN, REJECTED, SOLD_OUT` | TBD | Перевірити `src/shared/api/types/product.ts` |
| `PayoutStatus` | `HOLD, APPROVED, PAID_OUT, REFUNDED, REJECTED` | TBD | Перевірити mapper |
| `ConsentStatus` | `PENDING, SIGNED, REVOKED, REJECTED` | `AWAITING_DETAILS, PENDING_SIGNATURE, APPROVED, REJECTED` | **MISMATCH** — BACKEND-CHANGES.md A.6 caller-side mapping required. |
| `ProductType` | `PHYSICAL, DIGITAL` | TBD | Звірити |

---

## How to consume

### Initial sync (one-time)
```bash
cd lyceum-157-frontend

# 1. Pull fresh OpenAPI from running BE
pnpm sync-api  # = curl ${API_BASE}/v3/api-docs > api.json

# 2. Generate types
pnpm gen-types  # = orval --config orval.config.ts

# 3. Verify
pnpm typecheck
```

### Daily workflow
1. BE robить change, додає Swagger annotations.
2. BE CI exports `target/api.json` artifact на кожен commit.
3. Bot opens FE PR (or developer runs `pnpm sync-api` locally) → updated `api.json` + regenerated types.
4. FE PR review surface-ить diff у types — easier than reading manual changes.
5. Merge BE PR + FE PR coordinated.

### CI drift check (FE side)
```yaml
# .github/workflows/ci.yml step
- name: API contract drift check
  run: |
    pnpm sync-api
    git diff --exit-code api.json || (echo "::error::api.json is out of sync with BE. Run 'pnpm sync-api' locally and commit." && exit 1)
```

---

## Що зробити СЬОГОДНІ (immediate actions)

1. **BE side:** додати `springdoc-openapi-starter-webmvc-ui` залежність (вже є — генерує `/v3/api-docs`). Додати Maven step `generate-api-spec`.
2. **FE side:**
   - Додати `pnpm sync-api` script у `package.json` (`"sync-api": "curl -s ${API_BASE:-http://localhost:8080}/v3/api-docs > api.json"`).
   - Додати `orval` як dev-dep: `pnpm add -D orval`.
   - Створити `orval.config.ts` з input `./api.json`, output `./src/shared/api/types/generated.ts` + `./src/shared/api/clients/`.
   - Запустити `pnpm sync-api && pnpm gen-types`.
   - Замінити ручні types у `src/shared/api/types/*.ts` на generated.
   - Додати CI drift check (yaml above).
3. **BACKEND-CHANGES.md:** зачистити implemented sections (~A.1-A.4 closed; A.5/A.6 BE-side done, FE-side todo); відкриті залишити з status badges.
4. **`enums.ts`:** створити explicit mapping для `ConsentStatus` BE↔FE name skew (single source of truth: BE).

---

## Links

- BE контракт: `../../../../lyceum-157-backend/docs/superpowers/specs/API_CONTRACT.md`
- BACKEND-CHANGES.md: `../../../../lyceum-157-backend/BACKEND-CHANGES.md`
- Live Swagger: `${API_BASE}/swagger-ui.html`
- Live OpenAPI JSON: `${API_BASE}/v3/api-docs`
