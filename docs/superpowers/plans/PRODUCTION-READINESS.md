# Production Readiness Plan — lyceum-157-frontend

> Складено на основі аудиту 2026-05-13. Загальна готовність FE: **~50%**.
> Critical UI flows (student product create/edit) — stubs. Немає FE Sentry, немає FE CI, немає global security headers. API contract drift із BE.
> Бекенд-залежні фікси — у `../lyceum-157-backend/docs/superpowers/plans/PRODUCTION-READINESS.md`.

---

## P0 — БЛОКЕРИ ПРОД-РЕЛІЗУ

### P0-1. Student product edit screen — stub ❌🔥
`src/views/student/product-edit/ui/student-product-edit-screen.tsx:18` — placeholder. Створення товару з UI не доходить до галереї і submit. Бізнес-функція "студент створює і відправляє товар на модерацію" недоступна юзеру.

**Fix:**
1. `StudentProductEditScreen` як FSD view, `useStudentProductDetail(id)`.
2. Reuse `CreateProductForm` як `ProductForm` (mode: 'create' | 'edit').
3. `features/product-images/` — drag-drop upload (react-dropzone), presigned URL flow, reorder, set primary, delete.
4. Submit button → `POST /student/products/{id}/submit`. Якщо 409 `urn:l157:product/kyc-required` → KYC banner.
5. Status pill: DRAFT / PENDING_REVIEW / ACTIVE / REJECTED (із rejection reason у tooltip).

**Acceptance:**
- E2E `student-product-create-and-submit.spec.ts` — повний шлях з SIGNED KYC fixture.
- E2E `student-product-images.spec.ts` — upload → reorder → primary → delete.

---

### P0-2. KYC gate / canSubmitProducts banner ❌🔥
`features/product-create/ui/create-product-form.tsx` не перевіряє `canSubmitProducts`. Без banner / без redirect. Жодного consumer-а `canSubmitProducts` у `src/`.

**Fix:**
1. `<ParentConsentBanner />` у `views/student/dashboard/` — `useMe()` → if `parentKycStatus !== 'APPROVED'` показує messaging + кнопка "Надіслати ще раз".
2. `/student/products/new` redirect на `/student/dashboard?kycRequired=1` якщо `!canSubmitProducts`.
3. Submit-кнопка edit-screen disabled + tooltip "Необхідна згода батьків".

**Acceptance:** E2E student без SIGNED → /new → redirect із banner; parent signs → submit працює.

---

### P0-3. Global security headers ❌
`next.config.mjs` без global `headers()`. Тільки `/parent/*` має per-path.

**Fix:**
```js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'Content-Security-Policy', value: cspString },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }, /* preserve /parent/* */]
}
```

CSP strict: `default-src 'self'`, `img-src 'self' https://cdn.157.kyiv.ua data:`, `connect-src 'self' ${API_BASE}`, `frame-src https://www.liqpay.ua`, nonce-based scripts.

**Acceptance:** mozilla observatory ≥ A-. Report-only 1 тиждень → enforce.

---

### P0-4. FE CI workflow ❌
`.github/workflows/` для FE відсутній. `pnpm verify` тільки локально.

**Fix:** створити `lyceum-157-frontend/.github/workflows/ci.yml`:
```yaml
on: [pull_request, push]
jobs:
  verify:
    steps:
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm verify
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report }
```
Branch protection: `verify` required.

---

### P0-5. FE Sentry ❌
Немає `@sentry/nextjs`. Errors не покидають браузер.

**Fix:**
1. `pnpm add @sentry/nextjs` + wizard.
2. `sentry.client.config.ts` + `sentry.server.config.ts`. `tracesSampleRate: 0.1`, `replaysOnErrorSampleRate: 0.1`.
3. `beforeSend` strip URL query tokens, form fields `rnokpp`/`password`/`card`.
4. Source maps upload через build hook.

**Acceptance:** test-throw → Sentry із source map; PII не з'являється у payload; bundle +<60kb gzipped.

---

## P0+ — API CONTRACT FIX (FE side)

> **Source of truth (BE):** `docs/superpowers/specs/API_CONTRACT.md` + sister-doc у BE.
> 43 endpoints implemented у BE; FE `api.json` показує 29 → **drift на 11 endpoints + 3 admin**.

### P0-API-1. `api.json` sync + type generation ❌🔥

**Що зробити (step-by-step):**

**Step 1: Add sync script** у `package.json`:
```json
{
  "scripts": {
    "sync-api": "curl -s ${API_BASE:-http://localhost:8080}/v3/api-docs | jq '.' > api.json",
    "gen-types": "orval --config orval.config.ts",
    "sync": "pnpm sync-api && pnpm gen-types && pnpm typecheck"
  }
}
```

**Step 2: Install orval** (generates TS types + TanStack Query hooks з OpenAPI):
```bash
pnpm add -D orval @tanstack/react-query
```

**Step 3: Create `orval.config.ts`:**
```ts
import { defineConfig } from 'orval';

export default defineConfig({
  lyceumApi: {
    input: './api.json',
    output: {
      mode: 'tags-split',
      target: './src/shared/api/generated',
      schemas: './src/shared/api/generated/models',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/shared/api/client.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
          options: { staleTime: 60_000 },
        },
      },
    },
  },
});
```

**Step 4:** Run `pnpm sync && git add api.json src/shared/api/generated && git commit -m "chore: sync API contract with BE"`.

**Step 5:** Поступово замінити ручні модулі в `src/shared/api/modules/` на generated hooks:
- Старе: `import { listProducts } from '@/shared/api/modules/products'`
- Нове: `import { useListProducts } from '@/shared/api/generated/products/products'`

**Step 6: Видалити** старі manual `src/shared/api/types/*.ts` після міграції всіх consumer-ів.

**Acceptance:**
- [ ] `pnpm sync` без помилок генерує types для всіх 43 endpoints.
- [ ] `src/shared/api/generated/` committed.
- [ ] Усі feature-modules імпортують з `generated/`, не з ручних types.
- [ ] Zero `any` у API layer.

---

### P0-API-2. CI drift check ❌

**Виправлення** — додати у `.github/workflows/ci.yml` (FE side) як required step:

```yaml
api-drift:
  runs-on: ubuntu-latest
  services:
    backend:
      image: ghcr.io/your-org/lyceum-157-backend:latest
      ports: [8080:8080]
      env: { APP_AES_SECRET: "${{ secrets.TEST_AES_SECRET }}", JWT_SECRET: "${{ secrets.TEST_JWT_SECRET }}" }
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v3
    - run: pnpm install --frozen-lockfile
    - name: Wait for backend
      run: |
        for i in {1..60}; do
          curl -sf http://localhost:8080/actuator/health/liveness && break
          sleep 1
        done
    - name: Sync API
      run: pnpm sync-api
    - name: Detect drift
      run: |
        if ! git diff --exit-code api.json; then
          echo "::error::api.json is out of sync. Run 'pnpm sync' locally and commit."
          exit 1
        fi
    - name: Verify generated types build
      run: pnpm gen-types && pnpm typecheck
```

Альтернатива (якщо немає BE Docker image у GHCR): використати BE PR artifact `api-spec` (BE workflow uploads it; FE downloads via `dawidd6/action-download-artifact@v6`).

---

### P0-API-3. Імплементувати відсутні FE-consumer-и для існуючих BE endpoints ⚠️

11 endpoints у BE, для яких FE-side нічого нема. Розподіл по feature-pack-ам:

| Endpoint | FE feature module | Tracked у |
|---|---|---|
| `GET /student/orders` | `features/student-sales/` (new) | P0-1 (edit screen + sales view together) |
| `POST /student/products/{id}/resubmit` | `features/product-resubmit/` (new) | P0-1 |
| `PUT /.../images/reorder` | `features/product-images/` (new) | P0-1 |
| `DELETE /.../images/{imageId}` | `features/product-images/` (same) | P0-1 |
| `DELETE /users/me` | `features/account-delete/` (new) | New P1 |
| `GET /admin/orders` | `views/admin/orders-list/` (new) | New P1 |
| `GET /admin/orders/{id}` | `views/admin/order-detail/` (new) | New P1 |
| `POST /admin/orders/{id}/refund` | `features/admin-refund/` (new) | New P1 |
| `GET /admin/payouts` | `views/admin/payouts-list/` (new) | New P1 |
| `POST /admin/payouts/{id}/approve` | `features/payout-approve/` (new) | New P1 |
| `POST /admin/payouts/{id}/reject` | `features/payout-reject/` (new) | New P1 |
| `POST /student/products/{id}/hide` + `/unhide` | `features/product-visibility/` (new) | P0-1 ext |

**Acceptance:** кожен endpoint має FE module (`api/`, `model/`, `ui/`) + Vitest tests + Playwright E2E у `tests/e2e/`.

---

### P0-API-4. Enum name skew БE↔FE ⚠️

**Найкритичніше — `ConsentStatus`:** BE persist `SIGNED`/`PENDING`/`REVOKED`/`REJECTED`, FE expects `APPROVED`/`AWAITING_DETAILS`/`PENDING_SIGNATURE`/`REJECTED`. **Mismatch гарантує runtime bugs у KYC UI.**

**Виправлення:**

1. **Variant A (preferred):** BE side додає DTO-level mapping у `MeDto.parentKycStatus`:
   ```java
   public String parentKycStatus(LegalConsent c) {
       return switch (c.getStatus()) {
           case PENDING -> c.getParentRnokpp() == null ? "AWAITING_DETAILS" : "PENDING_SIGNATURE";
           case SIGNED -> "APPROVED";
           case REJECTED -> "REJECTED";
           case REVOKED -> "REVOKED";
       };
   }
   ```
2. **Variant B:** FE через generated types map БE enum 1:1 (більше displaylogik у FE).

**Single source of truth = BE.** FE НЕ хардкодить enum values — все через `src/shared/api/generated/models/*Status.ts`.

**Інші enum-и для аудиту** (можуть бути skew):
- `OrderStatus`: BE = `PENDING_PAYMENT, PAID, FULFILLED, DELIVERED, REFUNDED, EXPIRED, FAILED, CANCELLED, DISPUTED`
- `ProductStatus`: BE = `DRAFT, PENDING_REVIEW, ACTIVE, HIDDEN, REJECTED, SOLD_OUT`
- `PayoutStatus`: BE = `HOLD, APPROVED, PAID_OUT, REFUNDED, REJECTED`
- `ProductType`: BE = `PHYSICAL, DIGITAL`

Звірити кожен з FE expectation у `src/shared/api/types/*.ts` ДО переходу на generated.

---

### P0-API-5. Error-mapping pattern (RFC 7807) ⚠️

BE повертає problem-types `urn:l157:*`. FE має centralizov mapper.

**Виправлення** — `src/shared/api/errors.ts`:
```typescript
export const errorHandlers: Record<string, (err: ApiError) => void> = {
  'urn:l157:auth/email-not-verified': () => router.push('/verify-email'),
  'urn:l157:auth/totp-required': () => toast('Введіть TOTP код'),
  'urn:l157:product/kyc-required': () => router.push('/student/dashboard?kycRequired=1'),
  'urn:l157:checkout/insufficient-stock': (err) => {
    invalidateQueries(['catalog']);
    toast(`Товар скінчився${err.extensions?.failedItems ? ': ' + (err.extensions.failedItems as any[]).map(i => i.title).join(', ') : ''}`);
  },
  'urn:l157:resource/concurrent-modification': () => toast('Хтось щойно це змінив, оновіть сторінку'),
  'urn:l157:idem/conflict': () => toast('Повторна відправка з іншими даними'),
  'urn:l157:transient/retry': () => toast('Тимчасова помилка, спробуйте знов'),
};
```

Integrate у `src/shared/api/client.ts` так щоб кожен fetch автоматично mapper-ив error → відповідний UX.

---

### P0-API-6. `BACKEND-CHANGES.md` cleanup ⚠️

**Проблема.** Документ створений 2026-05-07. Більшість sections (A.1-A.4) BE вже реалізував. FE плани/UI ще не cross-link-нуті з реальним станом.

**Виправлення** (BE-side task, але FE coordination needed):
1. Read `BACKEND-CHANGES.md` (root).
2. Для кожного section позначити status badge:
   - `✅ DONE — implemented in vX.Y.Z`
   - `🟡 BE done — FE TODO`
   - `🔴 OPEN`
3. Closed sections — strikethrough title + keep body for context.
4. Open sections — підняти у P0+.

**Acceptance:** `BACKEND-CHANGES.md` має статус-badges на всіх sections; FE дізнається з одного source які items потребують FE-роботу.

---

## P0+ — LEGAL / COMPLIANCE UI (Privacy, ToS, Public Offer, Cookie banner) ❌🔥

> **Контекст.** На проді зараз **заглушки** для Privacy Policy / ToS / Public Offer. Без них — GDPR штраф + UA "Про захист персональних даних" + онлайн-продаж в UA нелегітимний.
> Координація з BE: `lyceum-157-backend/docs/superpowers/plans/PRODUCTION-READINESS.md` секція **P0+ LEGAL** (P0-LEGAL-1..7 + tech P0-LEGAL-TECH-1..2). Тексти готує юрист, FE рендерить + збирає acceptance.

### P0-LEGAL-FE-1. Cookie consent banner ❌
- Pre-rendered banner на first visit (server-side rendered, без CLS).
- Granular categories: Essential (always on) / Functional / Analytics (Sentry, GA) / Marketing.
- НЕ "Accept all" by default — user explicit choice required.
- Persist у localStorage `cookie-consent-v1` із expiry 12 місяців → re-prompt.
- Pre-consent: блокує тільки non-essential SDK loads (Sentry init delayed until consent).

**Acceptance:**
- [ ] `src/_app/providers/cookie-consent-provider.tsx` із Zustand store.
- [ ] `<CookieBanner />` у root layout.
- [ ] Sentry init у `useEffect` після `analyticsConsent === true`.
- [ ] E2E test reject-all flow.

---

### P0-LEGAL-FE-2. Legal docs pages ❌
Створити routes:
- `/legal/privacy-policy` — RSC, тягне `GET /api/v1/legal/privacy-policy` із BE.
- `/legal/terms-of-service` — RSC.
- `/legal/public-offer` — RSC.
- `/legal/cookie-policy` — статичний MDX (FE-managed).
- `/legal/changes` — diff попередньої version vs current (для acceptance update flow).

**Acceptance:**
- [ ] Кожен route рендерить markdown із BE response (через `react-markdown` із sanitize).
- [ ] Footer link до всіх 4 docs.
- [ ] `noindex` НЕ ставити (treba SEO).
- [ ] Print-friendly CSS.

---

### P0-LEGAL-FE-3. Registration consent flow ❌
- Form має 3 required checkboxes:
  - "Я погоджуюсь з Політикою конфіденційності [v2.0]" + link.
  - "Я погоджуюсь з Умовами користування [v1.1]" + link.
  - **Для STUDENT тільки:** "Я розумію що Hub утримує PDFO 18% + ВЗ 1.5% з моїх продажів" (tax-agent disclosure, P0-LEGAL-6 BE).
- Submit без checkbox = disabled.
- BE receives accepted versions у `RegisterRequest`.

**Acceptance:**
- [ ] `features/auth/register/ui/legal-checkboxes.tsx` з aria-required.
- [ ] Vitest test — submit без accept = button disabled.
- [ ] E2E — full registration з checkboxes.

---

### P0-LEGAL-FE-4. Checkout — Public Offer acceptance ❌
- Required checkbox перед "Pay": "Я погоджуюсь з Договором публічної оферти [vX.Y]" + link.
- Submit POST `/api/v1/orders` включає `acceptedOfferVersion`.

**Acceptance:**
- [ ] `features/checkout/ui/offer-acceptance.tsx`.
- [ ] Без checkbox — pay button disabled.
- [ ] E2E test.

---

### P0-LEGAL-FE-5. Acceptance update prompt ❌
Коли BE response містить `urn:l157:legal/acceptance-required`:
- Redirect на `/legal/accept-updates`.
- Screen показує які docs мають нову версію + diff.
- "Accept all" → POST `/api/v1/legal/accept` із pending docs list.
- Reject → logout + email confirmation що account буде deleted протягом 30 днів (GDPR right).

**Acceptance:** E2E test — version bump → re-accept flow → можна продовжити user actions.

---

### P0-LEGAL-FE-6. Account-delete flow ❌
- `/account/delete` screen (GDPR right-to-be-forgotten).
- Required type-confirm "ВИДАЛИТИ" + password re-entry.
- Warning: "Tax records зберігаються 7 років за законом, але PII буде crypto-shred-нуто."
- Confirm → DELETE `/api/v1/users/me` → logout → success page.

**Acceptance:**
- [ ] `views/account/delete/` view.
- [ ] Multi-step confirmation flow.
- [ ] E2E — full deletion path + verify subsequent login impossible.

---

### P0-LEGAL-FE-7. Footer with legal links ❌
Кожна сторінка має footer:
- Privacy / ToS / Public Offer / Cookie Policy links.
- ФОП identification (EDRPOU, address).
- Contact email.
- Copyright + рік.

**Acceptance:** `shared/ui/footer/footer.tsx` присутній у `RootLayout`.

---

## P1 — UX & SECURITY (3-4 тижні)

### P1-1. Edge middleware: role-based redirects ⚠️
Поточний middleware redirect тільки на refresh_token. STUDENT на `/admin` пропускається до API call → 403.

**Fix:** decode role з access-token claim АБО short-lived `role` cookie на login:
```ts
if (path.startsWith('/admin') && roleCookie !== 'ADMIN') return redirect('/forbidden');
if (path.startsWith('/student') && roleCookie !== 'STUDENT') return redirect('/forbidden');
```

**Acceptance:** E2E `middleware-role-gating.spec.ts` cross-role combinations.

---

### P1-2. Single-flight refresh race coverage ⚠️
`refresh.ts:7,16` має `_resetRefreshForTest`. Тест на concurrent 401-fan-in:
- 5 паралельних requests → 1 виклик `/auth/refresh`, всі 5 retry після.

---

### P1-3. Access token in-memory only — verify ⚠️
Grep `localStorage`/`sessionStorage`/`document.cookie` у `src/shared/api/`. ESLint `no-restricted-globals`.

---

### P1-4. Image upload UI: progress, cancel, error handling ⚠️
- XHR progress bar.
- AbortController cancel.
- Retry на network error із exp backoff.
- Errors: file size, type, magic-byte mismatch (`/confirm` 4xx), EXIF strip failure.
- Drop zone states: idle/dragging/uploading/success/error.

---

### P1-5. Form validation консистентність 🟡
`useAppForm()` має повертати `errorSummary` для top-of-form. `<FieldError aria-describedby>` зв'язок. `aria-invalid` automatic. Server problem-type → form-level errors з UI-friendly uk locale.

---

### P1-6. KYC parent-side UI ⚠️
`views/parent/kyc/` для всіх стнів: `AwaitingDetails` (RNOKPP/passport/IBAN), `PendingSignature` (PDF + Diia/Vchasno), `Rejected` (reason + повторити), `Approved` (history).
Pre-condition: BE endpoints (BACKEND-CHANGES.md A.6 + KYC magic-link).

---

### P1-7. Order checkout UI — error handling для out-of-stock ⚠️
`features/checkout/api/create-order.ts` mapping: 409 `urn:l157:checkout/insufficient-stock` → toast + invalidate queries. Multi-item: `extensions.failedItems[]` → UI підсвічує позиції.

**Acceptance:** E2E `concurrent-checkout.spec.ts` — 2 browsers, останній товар, 1 winner.

---

### P1-8. Cart Zustand persist — version migration ⚠️
```ts
persist(..., { name: 'cart-v1', version: 1, migrate: (state, version) => { ... } })
```

---

### P1-9. ISR revalidate tags consistency ⚠️
Grep `revalidateOnClient` + `fetch tags` → ensure consistent. Enum:
```ts
export const RevalidateTags = { CATALOG: 'catalog', PRODUCT: (slug: string) => `product:${slug}` } as const;
```

---

### P1-10. Bundle size budget ⚠️
`@next/bundle-analyzer` + `size-limit`:
```json
"size-limit": [
  { "path": ".next/static/chunks/main-*.js", "limit": "120 KB" },
  { "path": ".next/static/chunks/pages/_app-*.js", "limit": "80 KB" }
]
```
CI `pnpm size` блокує overshoot.

---

### P1-11. Next images — verify `unoptimized: true` ⚠️
Підтвердити CDN-fronted або повернути optimizer + `images.formats: ['image/avif','image/webp']`.

---

### P1-12. E2E coverage 🟡
- `full-purchase-flow.spec.ts` — реєстрація → каталог → cart → checkout → LiqPay sandbox webhook → success.
- `student-onboarding.spec.ts` — STUDENT register → parent invite → KYC sign → submit → admin approve.
- `concurrent-checkout.spec.ts`.
- `refund-flow.spec.ts`.

---

### P1-13. Accessibility WCAG 2.1 AA 🟡
`@axe-core/playwright`. Lighthouse a11y на home/catalog/product/checkout/dashboard. Fix focus traps, aria-labels, contrast.

---

## P2 — OPERATIONS & POLISH

- **P2-1** `pnpm verify` parallel — `concurrently -g 'pnpm typecheck' 'pnpm lint' 'pnpm test' 'pnpm scan-images' && pnpm build && pnpm e2e --grep @smoke`.
- **P2-2** Lighthouse CI budget на staging URL після deploy. Fail на regress >5%.
- **P2-3** Sentry release tracking — Vercel build step `sentry-cli releases new/finalize/set-commits`.
- **P2-4** SEO structured data Product JSON-LD + sitemap.xml route + robots.txt (disallow /admin /student /parent /account).
- **P2-5** i18n: всі strings через `t()`, ніяких inline. `react/jsx-no-literals` lint.
- **P2-6** 401 на logout flow — не sentry-capture (expected). Тільки unexpected (refresh failed, malformed).

---

## P3 — POST-MVP

- **P3-1** Storybook для shared/ui.
- **P3-2** Visual regression (Chromatic / Percy / Playwright snapshot).
- **P3-3** PWA service worker offline catalog.
- **P3-4** Real-time SSE для admin new submit-on-review.
- **P3-5** Streaming RSC + Suspense навколо product list.
- **P3-6** A/B testing infra (GrowthBook / PostHog).

---

## Verification

```bash
# З lyceum-157-frontend/
pnpm typecheck                            # tsc --noEmit
pnpm lint                                 # ESLint + FSD boundaries
pnpm test src/path/to/file.test.tsx
pnpm test -t "renders error summary"
pnpm e2e tests/e2e/checkout.spec.ts
pnpm e2e -g "stamp drop"
pnpm verify                               # full chain PR-level
pnpm size                                 # після P1-10
```

UI-task: `pnpm dev` + manual smoke (Chrome+Firefox+Safari) + Playwright headed golden path.

---

## Залежності від бекенду

| FE | Blocked by BE |
|---|---|
| P0-1 (edit screen) | BE P0-1 (KYC), P0-3 (image hijack), P1-14/15 (EXIF/AV) |
| P0-2 (KYC banner) | BE P0-1 + `GET /users/me` |
| P0-API-1 (api.json) | BE додає `mvn -P generate-api-spec` step |
| P1-6 (parent KYC UI) | BACKEND-CHANGES.md A.6 + KYC magic-link endpoints |
| P1-7 (checkout error) | BE P0-9 (concurrency tests pass) |
| P1-12 (concurrent E2E) | BE P0-9 |

---

## Сумарний таймлайн

| Sprint | Тижні | Зміст |
|---|---|---|
| **0** | 1 | P0-4 (CI), P0-5 (Sentry), P0-3 (security headers), P0-API-1 (api.json sync) |
| **1** | 2 | P0-1 (edit screen скелет) + BE coordination |
| **2** | 3 | P0-1 (edit screen completion + image flow), P0-2 (KYC banner) |
| **3** | 4 | P1-1..4 (middleware roles, refresh tests, upload UX) |
| **4** | 5 | P1-5..9 (forms, parent KYC, checkout errors, cart, ISR) |
| **5** | 6 | P1-10..13 (bundle, images, E2E, a11y) |
| **6** | 7 | P2-1..6 (ops, SEO, monitoring) |
| **Go-live** | 8 | Прод-реліз paralel із BE |

**Production-ready:** після Sprint 5 (всі P0 + P0+ + P1 закриті, FE CI green, a11y AA, Sentry staging working).
