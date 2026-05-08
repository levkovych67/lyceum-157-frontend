# FRONTEND-MIGRATION.md

> Що змінилось у бекенді `lyceum-157-backend` після виконання всього BACKEND-CHANGES roadmap (slices 1–8) та що треба підкрутити на фронті щоб працювало.
> **Дата:** 2026-05-08
> **Бек-теги:** від commit'у `b911ab6` (spec) до `7b3d844` (Slice 8).
> **Останнє оновлення фронту:** Track A — UX Resilience (loading/error.tsx, cookie banner, legal stubs, blurDataURL prop, WidgetErrorBoundary). Spec: `docs/superpowers/specs/2026-05-08-track-a-ux-resilience-design.md`. Plan: `docs/superpowers/plans/2026-05-08-track-a-ux-resilience.md`. Див. секцію 11.

---

## TL;DR — що мати на радарі

1. **Status enum-и DB перейменовано** (Slice 1, V1.0.6 migration). Frontend, який тримав `'SHIPPED' | 'COMPLETED' | 'SUCCESS' | 'PENDING_APPROVAL'` — зламається на нових responses. Треба оновити TypeScript-енами.
2. **Новi 14 endpoint'ів** (4 student + 4 admin orders + 1 admin payout list + 2 governance + 2 image management + /me + /resubmit). Більшість UI-плейсхолдерів на фронті можна замінювати реальними даними.
3. **Error contract = RFC 7807 з `urn:l157:*` типами** (Slice 3). Фронт повинен мапитись на `problem.type` (URI), а не парсити `title`.
4. **CORS дозволяє `https://*.vercel.app`** (Slice 3) — preview deployments йдуть напряму на API без проксі.
5. **POST /api/v1/orders приймає `recaptchaToken`** (Slice 6). Поки `app.captcha.enabled=false` бек ігнорує; коли flip — фронт мусить подати v3-токен.
6. **`/api/v1/users/me` тепер існує** (Slice 1, A.6) — TanStack-кеш можна перевести на нього як на джерело правди.
7. **`GET /api/v1/admin/products` тепер приймає `q` + `studentId`** (Slice 8, B.2). Адмін-модерація отримує full-text по title (case-insensitive substring, ≤80 символів) і фільтр по власнику. Без них список 1k+ pending некерований.

---

## 1. Перейменовані enum-значення (BREAKING)

`V1.0.6__rename_status_values.sql` змінив 5 enum-значень. Frontend треба синхронізувати **всюди де ці значення hardcoded**.

### 1.1 OrderStatus

| Було (DB + старе API) | Стало | Де зустрічається |
|---|---|---|
| `SHIPPED` | `FULFILLED` | `StudentOrderItemDto.status`, `AdminOrderListDto.status`, `AdminOrderDetailDto.status` |
| `COMPLETED` | `DELIVERED` | те саме |
| — | `DISPUTED` (новий, поки не emit'иться, але enum-значення дозволене) | те саме |

```ts
// було
type OrderStatus = "PENDING_PAYMENT" | "PAID" | "SHIPPED" | "COMPLETED"
                 | "REFUNDED" | "CANCELLED" | "EXPIRED";

// стало
type OrderStatus = "PENDING_PAYMENT" | "PAID" | "FULFILLED" | "DELIVERED"
                 | "REFUNDED" | "DISPUTED" | "CANCELLED" | "EXPIRED";
```

**Що зробити:** grep по фронту `"SHIPPED"`, `"COMPLETED"` у literal/`as const`/switch-cases і замінити. Де є i18n-ключі `order.status.shipped` — додати `order.status.fulfilled` etc.

### 1.2 PayoutStatus (студентський контракт)

| Було | Стало |
|---|---|
| `SUCCESS` | `PAID_OUT` |

DTO `StudentOrderItemDto.payoutStatus` тепер: `"HOLD" | "APPROVED" | "PAID_OUT" | "REFUNDED"`.

### 1.3 PayoutStatus (адмінський контракт — ОКРЕМО)

⚠️ `AdminPayoutDto.status` повертає `"PAID"` (не `"PAID_OUT"`!) бо такий був frozen-frontend контракт у спеці. Бек робить мапінг `PAID_OUT → "PAID"` саме для адмін-DTO. Інші статуси `HOLD|APPROVED|PROCESSING|FAILED|CANCELLED` ідентичні.

```ts
// admin payout list
type AdminPayoutStatus = "HOLD" | "APPROVED" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
```

### 1.4 ProductStatus

| Було | Стало |
|---|---|
| `PENDING_APPROVAL` | `PENDING_REVIEW` |

`SOLD_OUT` лишається в БД, але **не повертається в DTO** — бек мапить на `ACTIVE` + `stockQty=0`. Фронт визначає "немає в наявності" за `stockQty === 0`, не за окремим статусом.

```ts
type ProductStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "HIDDEN" | "REJECTED";
// SOLD_OUT прибрати — не з'являтиметься у відповідях
```

### 1.5 ParentKycStatus (новий enum, тільки в `MeDto`)

| DB `legal_consents.status` | DTO `parentKycStatus` |
|---|---|
| (немає row) | `AWAITING_DETAILS` |
| `PENDING` | `PENDING_SIGNATURE` |
| `SIGNED` | `APPROVED` |
| `REVOKED`, `REJECTED` | `AWAITING_DETAILS` *(parent починає заново)* |

```ts
type ParentKycStatus = "AWAITING_DETAILS" | "PENDING_SIGNATURE" | "APPROVED";
```

---

## 2. Нові endpoint-и

### 2.1 Student cabinet (Slice 1)

| Method+Path | DTO | Header/Query |
|---|---|---|
| `GET /api/v1/student/products` | `Page<StudentProductDto>` | `?status=…&page&size&sort` |
| `GET /api/v1/student/products/{id}` | `StudentProductDetailDto` | — (404 якщо не власний) |
| `GET /api/v1/student/orders` | `Page<StudentOrderItemDto>` | `?status=…&page&size&sort=paidAt,desc` |
| `GET /api/v1/users/me` | `MeDto` | `Cache-Control: no-store` |

`StudentProductDto` поля: `id, title, slug?, priceUah, type, stockQty, status, rejectionReason?, thumbnailUrl?, imageCount, createdAt, updatedAt, pendingOrdersCount, totalSold` — всі live-aggregated в одному запиті.

`MeDto` поля conditional за роллю — для STUDENT/PARENT/ADMIN (див. секцію 5).

### 2.2 Image management (Slice 4)

| Method+Path | Body |
|---|---|
| `DELETE /api/v1/student/products/{id}/images/{imageId}` | — |
| `PUT /api/v1/student/products/{id}/images/reorder` | `{ images: [{ imageId, sortOrder, primary }] }` |

`reorder` — atomic: вимагає **рівно один** `primary: true` і **всі** існуючі images у списку. Інакше 400.

### 2.3 Resubmit (Slice 7)

`POST /api/v1/student/products/{id}/resubmit` — alias of `/submit` для REJECTED→PENDING_REVIEW. Логіка ідентична, але endpoint дає чистіший UI: на сторінці rejected-product можна показати кнопку "Resubmit for review" що б'є саме сюди.

### 2.4 Admin orders + payouts (Slice 2)

| Method+Path | DTO | Особливості |
|---|---|---|
| `GET /api/v1/admin/orders` | `Page<AdminOrderListDto>` | `?status, from, to, q (ilike), page, size` |
| `GET /api/v1/admin/orders/{id}` | `AdminOrderDetailDto` | items + payment + refund |
| `GET /api/v1/admin/payouts` | `Page<AdminPayoutDto>` | `?status, studentId, from, to, page, size` |
| `POST /api/v1/admin/payouts/{id}/approve` | — (204) | **`X-TOTP-Code` header обов'язковий** |
| `POST /api/v1/admin/payouts/{id}/reject` | `{ reason }` | **`X-TOTP-Code` header обов'язковий** |

Існуючий `POST /api/v1/admin/payouts/execute` (batch) лишається без змін.

`AdminOrderListDto.refundableUntil` — момент до якого ще можна reverse. Дорівнює `paid_at + 14 днів` (поки `canBeRefunded()=true`), інакше `null`.

`AdminPayoutDto.cardMasked` — `"**** 1234"` (формується з `card_last4`). `parentName` — plaintext з `legal_consents.parent_name`. `retriesLeft` — `3 - retry_count`.

---

## 3. Зміни в існуючих endpoint-ах

### 3.1 `GET /api/v1/student/finance/summary` (Slice 5, B.1)

DTO збагачений. Старі 5 полів лишаються; нові додано:

```ts
type FinanceSummaryDto = {
  totalGross: string;
  totalTaxes: string;
  totalNetEarned: string;        // тепер = HOLD + APPROVED + PROCESSING + PAID_OUT
  pendingHold: string;
  pendingApproved: string;
  // НОВЕ:
  paidOut: string;               // суворо PAID_OUT only — те що вже на картці
  refunded: string;              // gross by CANCELLED payouts
  taxBreakdown: { pdfo: string; vz: string };
  feeBreakdown: { liqpay: string; platform: string };  // platform = "0.00" поки в v1
  recentMonths: Array<{ month: string; gross: string; net: string }>;  // YYYY-MM, oldest→newest
};
```

**Семантика змінилась:** `totalNetEarned` тепер це сума всіх non-cancelled payouts (включно з HOLD/APPROVED). Раніше — тільки SUCCESS. Якщо UI показує "ви заробили", використовуй `paidOut` для строгої "вже на картці" семантики, або `totalNetEarned` для ширшої.

### 3.2 `POST /api/v1/auth/register` (Slice 5, B.5)

Response змінився:

```ts
// було
{ userId: string; message: string; }

// стало
{ userId: string; parentEmailMasked: string; message: string; }
```

`message` тепер містить maskований email замість сирого, тож `parentEmailMasked` — primary поле для UI рядка "лист надіслано на a***@gmail.com".

### 3.3 `POST /api/v1/orders` (Slice 6, B.3)

Body розширений новим **опціональним** полем `recaptchaToken`:

```ts
{
  buyerEmail, buyerName, buyerPhone,
  items: [...],
  recaptchaToken?: string;   // НОВЕ
}
```

Поки `app.captcha.enabled=false` (default dev/staging) бек просто ігнорує. У продакшені (`RECAPTCHA_ENABLED=true`) фронт **мусить**:

1. Завантажити Google reCAPTCHA v3 script.
2. Викликати `grecaptcha.execute(siteKey, { action: 'order' })` перед submit'ом.
3. Передати token у body.

Помилка верифікації — `403` з `type: "urn:l157:captcha/rejected"` (див. секцію 4).

### 3.4 `POST /api/v1/auth/login` (Slice 6, B.4 — без змін у коді, документую факт)

Rate-limit вже працював: 5 спроб/хвилина по IP+email → `429 Too Many Requests` з `Retry-After: 60`. Фронту треба handle 429 (вже мав по специ); жодних змін у запиті.

### 3.5 Status mapping для existing endpoint-ів

Будь-яке поле що раніше повертало `SHIPPED|COMPLETED|SUCCESS|PENDING_APPROVAL` тепер повертає нове значення. Це зачіпає:
- `GET /admin/products` (`status` поле — `PENDING_REVIEW`)
- LiqPay webhook DTO (внутрішній — не зачіпає фронт)
- Будь-які інші `*ProductDto` / `*OrderDto`

### 3.6 `GET /api/v1/admin/products` — нові фільтри (Slice 8, B.2)

Endpoint існував і раніше (status filter + paging). Slice 8 додає **два нові опціональні query-параметри**:

| Параметр | Тип | Семантика |
|---|---|---|
| `q` | string, ≤80 chars | Case-insensitive substring match на `title`. Cyrillic safe. Pure whitespace ігнорується (=`null`). |
| `studentId` | UUID | Exact match на власника товару. Невалідний UUID → 400. |
| `status` | `ProductStatus` | (як було) Exact match. Якщо `null` — фільтру немає (повертає всі статуси, включно з DRAFT/REJECTED — admin має full visibility). |

Фільтри **компонуються з AND**: `?status=PENDING_REVIEW&studentId=…&q=картина` повертає лише ті товари що задовольняють всім трьом.

Дефолти `page=0`, `size=50`, `sort=createdAt`. Pageable identical to before.

```ts
// queryKey example
useQuery({
  queryKey: ['admin', 'products', { status, studentId, q, page }],
  queryFn: () => api.adminProducts.list({ status, studentId, q, page, size: 50 }),
  // debounce q → 300ms recommended
});
```

**Важливо:**
- Поведінка **без параметрів** не змінилась: `status=null` як і раніше повертає всі статуси (включно з DRAFT/REJECTED/HIDDEN). Стара Swagger-доку "Defaults to PENDING_REVIEW" була неточна — насправді backend ніколи не накладав дефолтний фільтр. Якщо UI потрібен ексклюзивно "на модерації" — явно слати `?status=PENDING_REVIEW` (як і раніше).
- LIKE-wildcards у `q` (`%`, `_`) **не екрануються** — це SQL-pattern. Для admin-only UI це безпечно (немає injection через bound params), але якщо хочете literal-match — sanitize на фронті. Низький пріоритет: фронт зазвичай шле прості keyword'и.
- 400 з `urn:l157:validation-error` повернеться якщо `q.length > 80` або невалідний UUID — обробляйте через стандартний RFC 7807 handler (секція 4.2).

---

## 4. Error contract — RFC 7807 типи (Slice 3, D)

Бек-handler тепер повертає `application/problem+json` з URN-типами. Фронт повинен **dispatching на `problem.type`**, а не на `problem.title` (титул локалізований і нестабільний).

### 4.1 Тип-URI таблиця

| HTTP | `problem.type` | Коли |
|---|---|---|
| 400 | `urn:l157:validation-error` | Validation/constraint violation. `invalidParams[]` має деталі. |
| 400 | `urn:l157:bad-request` | Generic bad input |
| 401 | `urn:l157:auth/invalid-credentials` | Wrong email/password |
| 401 | `urn:l157:auth/account-locked` | Lock після 5 failed login |
| 401 | `urn:l157:auth/refresh-expired` | Прострочений/невалідний refresh |
| 401 | `urn:l157:admin/totp-invalid` | Wrong/missing X-TOTP-Code |
| 401 | `urn:l157:unauthorized` | generic auth fail |
| 403 | `urn:l157:forbidden` | Roles mismatch / `@PreAuthorize` denied |
| 403 | `urn:l157:captcha/rejected` | reCAPTCHA below threshold |
| 404 | `urn:l157:product/not-found` | Product не знайдений АБО не власний (owner-check 404) |
| 404 | `urn:l157:payout/not-found` | те саме для payout |
| 404 | `urn:l157:kyc/token-invalid` | Magic-link битий/прострочений |
| 404 | `urn:l157:not-found` | generic |
| 409 | `urn:l157:auth/email-taken` | Email уже зареєстрований |
| 409 | `urn:l157:kyc/token-consumed` | Magic-link уже спожитий |
| 409 | `urn:l157:order/out-of-stock` | + `invalidParams[].productId, .available` |
| 409 | `urn:l157:order/refund-conflict` | Payout вже PAID_OUT — refund не пройде |
| 409 | `urn:l157:product/not-available` | KYC-required та подібні product-rule блоки |
| 409 | `urn:l157:product/images-required` | Submit без зображень (`code=PRODUCT_NO_IMAGE`) |
| 409 | `urn:l157:product/digital-asset-required` | Submit DIGITAL без файлу |
| 409 | `urn:l157:product/kyc-required` | Submit/approve коли parent KYC ще не SIGNED |
| 409 | `urn:l157:state/wrong-state` | Невалідна state-machine transition |
| 415 | `urn:l157:image/mime-mismatch` | Magic-bytes ≠ declared MIME |
| 422 | `urn:l157:business-rule` | Будь-який інший business-rule (з `code` полем) |
| 429 | (немає кастомного типу — стандартний 429) | Rate-limit (login) |
| 500 | `urn:l157:internal-error` | Uncaught — має `Trace ID: ...` для діагностики |

### 4.2 Як фронт повинен робити mapping

```ts
type ApiProblem = {
  type: string;          // "urn:l157:auth/invalid-credentials"
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp: string;
  invalidParams?: Array<{ field: string; reason: string; [k: string]: string }>;
  code?: string;         // тільки для business-rule
};

// Switch на type — стабільно
switch (problem.type) {
  case "urn:l157:auth/invalid-credentials":
    setFormError("Невірний email або пароль");
    break;
  case "urn:l157:order/out-of-stock":
    const stock = problem.invalidParams?.[0];
    showToast(`Товар закінчився (доступно: ${stock?.available})`);
    break;
  // ...
}
```

**НЕ робіть** `if (problem.status === 401 && problem.title.includes("Invalid"))` — title локалізується.

---

## 5. `MeDto` — структура за ролями (Slice 1, A.6)

Усі поля повертаються; ролеспецифічні поля = `null` коли неактуально.

```ts
type MeDto = {
  userId: string;
  email: string;
  role: "STUDENT" | "PARENT" | "ADMIN";
  firstName: string;
  lastName: string;
  // STUDENT only:
  grade: string | null;
  parentEmail: string | null;
  parentKycStatus: "AWAITING_DETAILS" | "PENDING_SIGNATURE" | "APPROVED" | null;
  canSubmitProducts: boolean | null;       // = (parentKycStatus === "APPROVED")
  // ADMIN only:
  twoFaEnrolled: boolean | null;
  twoFaConfirmedAt: string | null;
  // всі ролі:
  createdAt: string;
};
```

**Особливості:**
- **PARENT firstName/lastName** беруться з `legal_consents.parent_name` (split за whitespace). Якщо KYC ще не подано — fallback на email-prefix (`"olena.k01"`). Тобто PARENT може бачити "Olena.k01" в перший момент після реєстрації, потім справжнє ім'я після того як подасть RNOKPP/PIB.
- **ADMIN firstName/lastName** — поки fallback на email-prefix (admin_profiles таблиці немає).
- **`Cache-Control: no-store`** — клієнт-сайд кеш TanStack `staleTime: 60_000` рекомендований.

**Що зробити на фронті:** замінити `useAuth()` (in-memory роль) як джерело правди на `useQuery({ queryKey: ['me'], staleTime: 60_000 })`. Логіка `canSubmitProducts` — пряме поле, не обчислювати самостійно.

---

## 6. Cookie + CORS зміни (Slice 3)

### 6.1 Cookie path

Refresh-token cookie тепер має explicit:
- `Path=/api/v1/auth`
- `SameSite=Lax`
- `HttpOnly; Secure`

**Наслідок:** якщо ви ставили Next.js rewrite під своїм доменом (наприклад `/api/auth/...` → `https://api.hub.157.kyiv.ua/api/v1/auth/...`), cookie не дійде на rewrite-роут бо path не співпадає. Два варіанти:

**(а, рекомендовано)** Фронт ходить direct на `https://api.hub.157.kyiv.ua` з `credentials: 'include'`. CORS налаштовано (див. 6.2).

**(б)** Якщо ви на проксі — синхронізуйте path. Або змініть бекенд на `Path=/`, але це ширший CSRF-surface.

### 6.2 CORS allow-list

Дозволені origins:
- `https://hub.157.kyiv.ua` (prod)
- `https://*.vercel.app` (preview deployments — wildcard через `setAllowedOriginPatterns`)
- `http://localhost:3000` (dev)

`Access-Control-Allow-Credentials: true` — щоб refresh-cookie ходила.

`Access-Control-Allow-Methods`: GET, POST, PUT, **PATCH**, DELETE, OPTIONS.

`Access-Control-Expose-Headers`:
- `X-Trace-Id`, `X-Request-Id` — трейсинг
- `X-Idempotency-Replayed` — `true` коли реплей
- `X-Token-Expired` — JWT прострочений
- `Retry-After` — rate-limit (login)
- **`Content-Disposition`** — *новий*; потрібен для tax-report CSV-стрімів щоб JS міг прочитати `filename=...`

**Що зробити на фронті:**
- При завантаженні CSV (`GET /api/v1/admin/tax-report/...`) тепер можна дістати `response.headers.get('Content-Disposition')` cross-origin.
- Vercel preview-URL'и автоматично проходитимуть CORS — не треба вручну додавати в whitelist.

---

## 7. OpenAPI doc (Slice 7, E)

Swagger UI / OpenAPI JSON оновлено:
- `servers:` блок: `https://api.hub.157.kyiv.ua/api/v1` + `http://localhost:8080/api/v1`. Якщо frontend генерує SDK з `openapi-typescript` чи `orval` — `serverUrl` тепер автоматично коректний.
- Reusable response header `X-Idempotency-Replayed` (boolean) — codegen покаже його типово.
- Bearer-JWT security scheme зареєстровано глобально.

OpenAPI JSON URL: `GET /v3/api-docs` (стандартний springdoc), Swagger UI: `GET /swagger-ui.html`.

---

## 8. Що треба явно оновити на фронті — checklist

### 8.1 Code changes

- [ ] **Status enums (TS):** замінити `SHIPPED→FULFILLED`, `COMPLETED→DELIVERED`, додати `DISPUTED`; `SUCCESS→PAID_OUT` (student); `PENDING_APPROVAL→PENDING_REVIEW`.
- [ ] **AdminPayoutDto.status:** окремий enum з `PAID` (не `PAID_OUT`); `CANCELLED` додано до allowed.
- [~] **i18n labels:** додати ключі для нових станів (FULFILLED, DELIVERED, DISPUTED, PENDING_REVIEW, AWAITING_DETAILS, PENDING_SIGNATURE). _Track A створив `src/shared/i18n/uk.ts` з namespaced секціями (cookies, legal, loading, errors). Status-labels — додавати в нову `statuses.*` секцію коли робитимете цей пункт._
- [~] **Error handler:** перейти з `status + title` на `type` URN switch (див. 4.2). _Track A: `app/admin/error.tsx` вже використовує `error instanceof ApiError && error.isUnauthorized` для conditional 2FA-link. Цей паттерн (instanceof + getter) — рекомендований; URN-type switch для більш специфічних помилок робиться у каталог-fetch / mutation handlers, не в Next-error.tsx._
- [ ] **`useAuth()` → `useMe()`:** замінити on-memory role на `useQuery({ queryKey: ['me'], queryFn: fetchMe, staleTime: 60_000 })`.
- [ ] **Register flow:** використати `parentEmailMasked` з response замість реконструкції з form.
- [ ] **Order create:** додати `recaptchaToken` у body коли `process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED='true'`.
- [ ] **Finance dashboard:** новi поля `paidOut, refunded, taxBreakdown, feeBreakdown, recentMonths` — замінити плейсхолдери.
- [ ] **Image gallery:** реалізувати DELETE + reorder, видалити placeholder для `student-products` edit.
- [ ] **Admin payout actions:** додати approve/reject UI (з TOTP-input modal); use `X-TOTP-Code` header. _Track A: `views/admin-payouts` вже обгорнуто `<WidgetErrorBoundary label="Виплати">` у `app/admin/payouts/page.tsx`. Реалізація approve/reject UI робиться всередині view._
- [ ] **Admin orders/payouts list:** замінити placeholder-екрани реальними даними з нових endpoint-ів.
- [ ] **Admin products list (Slice 8):** додати search-input (`q`, debounced 300ms, max 80 chars) і student-picker (`studentId`) до moderation-екрану. Зберегти існуючий `status` filter. Combined фільтри — AND-композиція.

### 8.2 Config changes

- [ ] **API base URL:** point direct на `https://api.hub.157.kyiv.ua` (не через rewrite) щоб refresh-cookie path спрацював. Якщо лишаєте rewrite — synchronize path.
- [ ] **`credentials: 'include'`** на всіх fetch/axios calls що ходять на API (refresh-cookie).
- [ ] **`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`** env var для prod.

### 8.3 Видалити з фронту

- [ ] Будь-який client-side обчислюваний `canSubmitProducts` — тепер серверне поле.
- [ ] Будь-які hardcoded `SHIPPED`/`COMPLETED`/`SUCCESS`/`PENDING_APPROVAL` — гарантовано не з'являться у responses (DB CHECK constraints не дозволять).
- [ ] Хелпери що реконструюють masked email — використовуй `parentEmailMasked` з response.
- [ ] Reading `problem.title` для логіки (тільки для display).

---

## 9. Endpoint-and-DTO компактний reference

```
GET    /api/v1/users/me                                    MeDto
DELETE /api/v1/users/me                                    204

GET    /api/v1/student/products                            Page<StudentProductDto>
GET    /api/v1/student/products/{id}                       StudentProductDetailDto
POST   /api/v1/student/products                            CreatedProductResponse
PUT    /api/v1/student/products/{id}                       204
POST   /api/v1/student/products/{id}/submit                204
POST   /api/v1/student/products/{id}/resubmit              204   ← новий (alias)
POST   /api/v1/student/products/{id}/hide                  204
POST   /api/v1/student/products/{id}/unhide                204
DELETE /api/v1/student/products/{id}                       204
POST   /api/v1/student/products/{id}/images/upload-url     PresignedUploadDto
POST   /api/v1/student/products/{id}/images/confirm        204
DELETE /api/v1/student/products/{id}/images/{imageId}      204   ← новий
PUT    /api/v1/student/products/{id}/images/reorder        204   ← новий

GET    /api/v1/student/orders                              Page<StudentOrderItemDto>   ← новий
GET    /api/v1/student/finance/summary                     FinanceSummaryDto (розширено)

GET    /api/v1/admin/products                              Page<AdminProductDto>       (+ q, studentId — Slice 8)
POST   /api/v1/admin/products/{id}/approve                 AdminProductDto
POST   /api/v1/admin/products/{id}/reject                  AdminProductDto

GET    /api/v1/admin/orders                                Page<AdminOrderListDto>     ← новий
GET    /api/v1/admin/orders/{id}                           AdminOrderDetailDto         ← новий
POST   /api/v1/admin/orders/{id}/refund                    204

GET    /api/v1/admin/payouts                               Page<AdminPayoutDto>        ← новий
POST   /api/v1/admin/payouts/{id}/approve                  204 (X-TOTP-Code)           ← новий
POST   /api/v1/admin/payouts/{id}/reject                   204 (X-TOTP-Code)           ← новий
POST   /api/v1/admin/payouts/execute                       PayoutBatchResponse (X-TOTP-Code)

POST   /api/v1/orders                                      OrderCreationResponse (+ recaptchaToken)
POST   /api/v1/auth/register                               RegisterResponse (+ parentEmailMasked)
POST   /api/v1/auth/login                                  TokenResponse
```

---

## 10. Track A — UX Resilience (фронт-only, паралельно до бек-міграції)

> Spec: `docs/superpowers/specs/2026-05-08-track-a-ux-resilience-design.md`
> Plan: `docs/superpowers/plans/2026-05-08-track-a-ux-resilience.md`
> 17 задач, кожна окремий комміт; всі фронт-зміни, не залежать від бек-міграції.

### 10.1 Що додано

| Файл / шар | Призначення |
|---|---|
| `src/shared/i18n/uk.ts` + `index.ts` | Централізовані ua-strings (`cookies`, `legal`, `loading`, `errors` namespaces). **Усі нові ua-string повинні йти сюди.** |
| `src/shared/lib/consent/{consent,use-consent}.ts` + `index.ts` | Cookie helpers + React hook для cookie banner |
| `src/shared/ui/error-boundary/{widget-error-boundary,widget-error-fallback}.tsx` | `<WidgetErrorBoundary label=… resetKeys=… onError=…>` обгортка над `react-error-boundary@4.1.2` |
| `src/shared/ui/paper-skeleton/paper-skeleton.tsx` | Primitive `<PaperSkeleton variant=…>` + 5 готових composition: `Page/Grid/Form/Profile/Article` |
| `src/_app/styles/paper-skeleton.css` | Keyframes `@keyframes ps-stamp-pulse` з `prefers-reduced-motion` fallback |
| `src/widgets/cookie-banner/cookie-banner.tsx` | Dismiss-only banner, маунтиться в root layout |
| `src/app/{public/,account/,student/,admin/,parent/}error.tsx` | Segment-level error boundaries з role-aware Stamp-копірайтингом |
| `src/app/{loading,public/loading,public/<route>/loading,…}.tsx` | 13 `loading.tsx` файлів — root + 8 public + 4 cabinet |
| `src/app/(public)/{privacy,terms}/page.tsx` | Stub-сторінки з placeholder Stamp + mailto:legal@157.kyiv.ua |
| `tests/e2e/{loading-states,cookie-banner,legal-stubs,error-boundary}.spec.ts` | 4 Playwright `@smoke` тести |
| `TODO.md` (root) | Backlog для Tracks B (legal content) і C (image pipeline + carousel + paper-noise tuning + checkout/2FA E2E) |

### 10.2 Інтеграція з бек-міграцією

| Бек-зона | Як Track A доторкнувся |
|---|---|
| **Section 4 (RFC 7807 errors)** | `app/admin/error.tsx` робить `error instanceof ApiError && error.isUnauthorized` → conditional Link на `/admin/2fa`. Паттерн `instanceof + getter` рекомендований для Next-error.tsx; URN-`type` switch — для query/mutation handlers. |
| **Section 8.1 i18n labels** | Створено `shared/i18n/uk.ts` з namespaced структурою. Status-labels (FULFILLED, DELIVERED, ...) додаються в `statuses.*` секцію коли робитимете status-enum migration. |
| **Section 8.1 Admin payouts** | `app/admin/payouts/page.tsx` уже обгорнуто `<WidgetErrorBoundary label="Виплати">`. Approve/reject UI — всередині view. |
| **Section 8.1 Admin orders** | `app/admin/reports/tax/page.tsx` обгорнуто `<WidgetErrorBoundary label="Податковий звіт">`. Orders-list — обгорнути коли реалізовуватимете. |

### 10.3 Що Track A НЕ робить

- Не торкається бек-DTO або status enum-ів — це окремі задачі з checklist 8.1
- Не реалізовує реальні Privacy/ToS тексти — це Track B (контент від юриста)
- Не додає WebP/blurDataURL автогенерацію — це Track C (sharp pre-build pipeline; **WebP-only, no AVIF** — див. project memory)
- Не додає Sentry — у `TODO.md` під "Інше"

### 10.4 Нові FE-залежності

```json
"dependencies": {
  "react-error-boundary": "4.1.2"  // Track A
}
```

### 10.5 Нові test-категорії

- `tests/component/lib/` — для React-hook тестів (Task 3 додав)
- `tests/component/widgets/` — для widget-component тестів (Task 6 додав)

### 10.6 Verification

`pnpm verify` ланцюжок:
- `pnpm typecheck` ✅
- `pnpm lint` ✅
- `pnpm test` ✅ (76 unit + component тестів passes)
- `pnpm scan-images` ✅ (48 slots aligned)
- `pnpm build` ✅ (31 routes, `/privacy` + `/terms` static)
- `pnpm e2e --grep @smoke` — потребує запуск з реальним dev-server

---

## 11. Контакт

- Бек spec для Slice 1: `docs/superpowers/specs/2026-05-08-slice-1-student-cabinet-read-api-design.md`
- Source of truth для типів: OpenAPI JSON `/v3/api-docs`
- Comprehensive list of changes: `git log --oneline main` (commits `b911ab6`...`7b3d844`)
- Питання на бек-команду — у звичайному каналі.

Якщо щось не сходиться між цим документом і реальною поведінкою — **бажиш реальну поведінку**, цей файл — snapshot.
