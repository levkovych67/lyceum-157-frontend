# Зміни для бекенду `lyceum-157-backend` (Spring Boot, Java)

> Складено на основі аудиту фронтенд-API (`src/shared/api/**`) проти `FRONTEND-API.md` + аналізу UI-екранів (`src/views/**`, `src/app/**`). Дата: 2026-05-07.

UI-екрани наразі заглушки → список того, що бракує бекенду = "гепи" зі спеки + поглиблення, які стають очевидними при реальному малюванні цих екранів.

---

## A. Додати READ-ендпоінти

### A.1. `GET /api/v1/student/products` — список своїх товарів

**Auth:** `@PreAuthorize("hasRole('STUDENT')")`. Бек вибирає тільки `studentId == auth.principal.userId`.

**Query:**

| Параметр | Тип | Default |
|---|---|---|
| `status` | `DRAFT \| PENDING_REVIEW \| ACTIVE \| HIDDEN \| REJECTED` (можна множинно через repeated) | (всі окрім `DELETED`) |
| `page` | int | 0 |
| `size` | int (1..50) | 20 |
| `sort` | `createdAt,desc` | `createdAt,desc` |

**Response:** `Page<StudentProductDto>`

```ts
type StudentProductDto = {
  id: string;
  title: string;
  slug: string | null;          // null до approve
  priceUah: string;
  type: "PHYSICAL" | "DIGITAL";
  stockQty: number;
  status: ProductStatus;
  rejectionReason: string | null;
  thumbnailUrl: string | null;  // primary image
  imageCount: number;
  createdAt: string;
  updatedAt: string;
  // лічильники для дешборду
  pendingOrdersCount?: number;
  totalSold?: number;
};
```

### A.2. `GET /api/v1/student/products/{id}` — деталі для редагування

**Auth:** STUDENT, owner-check (404 якщо чужий — не 403, щоб не лікити existence).

**Response:** усі поля що приймає `PUT /student/products/{id}` + список зображень + `status` + `rejectionReason`.

```ts
type StudentProductDetailDto = {
  id: string;
  title: string;
  description: string;          // raw HTML (sanitized)
  priceUah: string;
  type: "PHYSICAL" | "DIGITAL";
  stockQty: number;
  status: ProductStatus;
  rejectionReason: string | null;
  images: Array<{
    id: string;
    s3Key: string;
    url: string;                // CDN
    primary: boolean;
    sortOrder: number;
  }>;
};
```

Без цього неможливо завантажити форму редагування і керувати галереєю.

### A.3. `DELETE /api/v1/student/products/{id}/images/{imageId}` — видалити зображення

Зараз є `confirm` (додати), але немає `remove` (видалити з draft / списку). UI редагування галереї — must.

→ 204. 409 якщо товар не у `DRAFT|REJECTED`. Видаляє об'єкт із S3 + рядок із БД.

### A.4. `PATCH /api/v1/student/products/{id}/images/{imageId}/primary` — зробити primary

Або `PUT /api/v1/student/products/{id}/images/reorder` із `[{imageId, sortOrder, primary}]`.

→ 204. Без цього при редагуванні неможливо змінити, яке фото буде на thumbnail.

### A.5. `GET /api/v1/student/orders` — мої замовлення (як автор товарів)

**Auth:** STUDENT.

**Query:** `page`, `size=20`, `status` (multi: `PAID | DELIVERED | REFUNDED | …`).

**Response:** `Page<StudentOrderItemDto>` — рядок-на-(orderItem, не на order), щоб студент бачив **свої** позиції в чужих замовленнях.

```ts
type StudentOrderItemDto = {
  orderItemId: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productThumbnailUrl: string | null;
  quantity: number;
  pricePerUnit: string;
  grossAmount: string;
  status: "PAID" | "FULFILLED" | "DELIVERED" | "REFUNDED" | "DISPUTED";
  paidAt: string;
  payoutStatus: "HOLD" | "APPROVED" | "PAID_OUT" | "REFUNDED";
  payoutReleasesAt: string | null;   // коли вийде з 14-day hold
  buyerNameMasked: string;           // "Анна П."
};
```

### A.6. `GET /api/v1/users/me` — профіль

**Auth:** STUDENT | PARENT | ADMIN.

```ts
type MeDto = {
  userId: string;
  email: string;
  role: "STUDENT" | "PARENT" | "ADMIN";
  firstName: string;
  lastName: string;
  // STUDENT only:
  grade?: string;
  parentEmail?: string;
  parentKycStatus?: "AWAITING_DETAILS" | "PENDING_SIGNATURE" | "APPROVED";
  canSubmitProducts?: boolean;       // computed from kycStatus
  // ADMIN only:
  twoFaEnrolled?: boolean;
  twoFaConfirmedAt?: string | null;
  // всі:
  createdAt: string;
};
```

Без цього `/account` і логіка "чи можна сабмітити товар" висить у клієнті без джерела правди.

### A.7. `GET /api/v1/admin/orders` — список замовлень для refund-UI

**Auth:** ADMIN.

**Query:** `status` (default `PAID`), `from`, `to` (ISO date), `q` (orderNumber/email/buyerName ilike), `page`, `size=50`.

**Response:** `Page<AdminOrderListDto>`

```ts
type AdminOrderListDto = {
  orderId: string;
  orderNumber: string;
  status: "PENDING_PAYMENT" | "PAID" | "FULFILLED" | "REFUNDED" | "FAILED" | "EXPIRED";
  totalAmount: string;
  buyerEmail: string;
  buyerName: string;
  itemsCount: number;
  paidAt: string | null;
  refundableUntil: string | null;     // якщо ще можна reverse
};
```

### A.8. `GET /api/v1/admin/orders/{orderId}` — деталі для сторінки `/admin/orders/[id]`

```ts
type AdminOrderDetailDto = AdminOrderListDto & {
  buyerPhone: string;
  items: Array<{
    productId: string;
    productTitle: string;
    studentId: string;
    studentFullName: string;
    quantity: number;
    pricePerUnit: string;
    lineGross: string;
    payoutStatus: "HOLD" | "APPROVED" | "PAID_OUT" | "REFUNDED";
  }>;
  payment: {
    liqpayOrderId: string;
    paymentMethod: string | null;
    paidAt: string | null;
  };
  refund: {
    refundedAt: string | null;
    refundedBy: string | null;
    reason: string | null;
    bankFeeWriteOff: string | null;
  } | null;
};
```

### A.9. `GET /api/v1/admin/payouts` — список виплат

**Auth:** ADMIN.

**Query:** `status` (default `APPROVED`; всі: `HOLD | APPROVED | PROCESSING | PAID | FAILED`), `studentId`, `from`, `to`, `page`, `size=50`.

**Response:** `Page<AdminPayoutDto>`

```ts
type AdminPayoutDto = {
  payoutId: string;
  studentId: string;
  studentFullName: string;
  studentGrade: string;
  parentName: string;
  netAmount: string;             // що піде на карту
  cardMasked: string;            // "**** 1234"
  status: "HOLD" | "APPROVED" | "PROCESSING" | "PAID" | "FAILED";
  approvedAt: string | null;
  scheduledAt: string | null;
  paidAt: string | null;
  failureReason: string | null;
  liqpayPayoutId: string | null;
  retriesLeft: number;
};
```

### A.10. `POST /api/v1/admin/payouts/{id}/approve` + `POST /api/v1/admin/payouts/{id}/reject`

UI має workflow: payout у `HOLD` → admin approve → `APPROVED` → batch execute. Зараз є тільки `execute`. Без `approve/reject` HOLD-payouts нікуди не рухаються.

```
POST /admin/payouts/{id}/approve     → 204
POST /admin/payouts/{id}/reject      { reason: string }  → 204
```

Опційно з TOTP на approve (бо змінює грошові flow). За консистентністю з `execute` — додати `X-TOTP-Code` обов'язковим хедером.

---

## B. Доповнити існуючі ендпоінти

### B.1. `GET /api/v1/student/finance/summary` — додати breakdown

Зараз 5 чисел — для UI цього мало:

```ts
type FinanceSummaryDto = {
  // вже є
  totalGross: string;
  totalTaxes: string;
  totalNetEarned: string;
  pendingHold: string;
  pendingApproved: string;
  // ДОДАТИ:
  paidOut: string;                 // що вже виплачено батькам
  refunded: string;                // вертунки покупцям
  taxBreakdown: { pdfo: string; vz: string };
  feeBreakdown: { liqpay: string; platform: string };
  recentMonths: Array<{
    month: string;                 // "2026-04"
    gross: string;
    net: string;
  }>;
};
```

### B.2. `GET /api/v1/admin/products` — додати фільтр `q` (full-text по title) + `studentId`

Без цього модерація 1k+ pending — не керована.

### B.3. `POST /api/v1/orders` — додати `recaptchaToken` (anti-bot)

Публічний endpoint без авторизації + LiqPay redirect = улюблена ціль для card-testing-атак. Бек має валідувати reCAPTCHA v3 score або hCaptcha (або BotID). UI додасть hidden input, бек валідує.

### B.4. `POST /api/v1/auth/login` — rate limit + явний `429`

Spec не описує, але вже з 5+ спроб з одного IP/email бек має 429 + `Retry-After`. Обов'язкове для production.

### B.5. `POST /api/v1/auth/register` — повертати `parentEmail` masked у 201

Зараз `RegisterResponse = { userId, message }`. UI має показати "лист надіслано на a***@gmail.com" — без masked email цей рядок або не показується, або фронт реконструює його з форми (втрачаючи canonical-форму).

```ts
type RegisterResponse = {
  userId: string;
  parentEmailMasked: string;   // "a***@gmail.com"
  message: string;
};
```

### B.6. `POST /api/v1/student/products/{id}/resubmit` (опційно)

Якщо `REJECTED` → відредагували → треба повернути в `PENDING_REVIEW`. Зараз спека каже "edit → DRAFT через PUT" + потім "submit". Тобто 2 виклики. Можна скоротити до одного — або залишити явно як є. Якщо лишаємо — явно задокументуй у spec, що PUT з REJECTED скидає на DRAFT.

---

## C. Системні / SRE-зміни

### C.1. Cookie-path для `refresh_token`

Спека: `Path=/api/v1/auth`. Це працює тільки якщо фронт стучить на бек **прямо** (cross-origin із credentials). Якщо ставиш Next-проксі через rewrites під своїм доменом — cookie з path `/api/v1/auth` не дійде на проксі-роут `/api/auth/...`. Або path до `/`, або синхронізувати rewrites із бекенд-path.

**Рекомендація:** залишити `Path=/api/v1/auth`, фронт прокидувати **direct** на `api.hub.157.kyiv.ua` (CORS + credentials).

### C.2. CORS

Бек має `Access-Control-Allow-Origin` для:
- `https://hub.157.kyiv.ua` (prod)
- `https://*.vercel.app` (preview deployments — wildcard з `Vary: Origin` або список)
- `http://localhost:3000` (dev)

Та `Access-Control-Allow-Credentials: true` (інакше cookie не йде).

Та `Access-Control-Expose-Headers: X-Idempotency-Replayed, Retry-After, Content-Disposition` — без цього frontend не побачить ці хедери з cross-origin.

### C.3. Експортувати `Content-Disposition` для tax-report

CSV-стрім → з cross-origin браузер не дасть JS прочитати `Content-Disposition` без `Access-Control-Expose-Headers`. Без цього не сформувати правильний `filename` на фронті.

### C.4. Webhook idempotency для LiqPay/Vchasno

Не пов'язано напряму з фронтом, але ризик: дубль payment-webhook → подвійний payout. Підтвердити, що бек обробляє `liqpay_order_id` як unique-key.

### C.5. Healthcheck endpoint для preview-environments

`GET /actuator/health/readiness` має бути швидким (<100ms) і не дзвонити в зовнішні сервіси (LiqPay, Vchasno) — інакше k8s flapping.

---

## D. Контракт на помилки — добити мапінги

Спека описує 7 статусів. Реальні бізнес-помилки, які UI має розрізняти, потребують **унікальних `type`-URI** (RFC 7807):

| Кейс | HTTP | `type` |
|---|---|---|
| Невірний пароль | 401 | `urn:l157:auth/invalid-credentials` |
| Прострочений refresh | 401 | `urn:l157:auth/refresh-expired` |
| **Replay refresh (revoke all)** | 401 | `urn:l157:auth/refresh-replay` |
| Email уже зареєстрований | 409 | `urn:l157:auth/email-taken` |
| Magic-link битий/прострочений | 404 | `urn:l157:kyc/token-invalid` |
| Magic-link consumed | 409 | `urn:l157:kyc/token-consumed` |
| KYC не APPROVED при submit | 409 | `urn:l157:product/kyc-required` |
| Немає зображень при submit | 409 | `urn:l157:product/images-required` |
| Edit non-DRAFT | 409 | `urn:l157:product/wrong-state` |
| Недостатньо stock | 409 | `urn:l157:order/out-of-stock` (+ `invalidParams[]` із `productId`+`available`) |
| Idempotency replay із іншим body | 409 | `urn:l157:order/idem-conflict` |
| Magic-bytes mismatch | 415 | `urn:l157:image/mime-mismatch` |
| Wrong TOTP | 401 | `urn:l157:admin/totp-invalid` |
| Payout not APPROVED | 409 | `urn:l157:payout/wrong-state` |
| Rate-limit | 429 | `urn:l157:rate-limit` (+ `Retry-After`) |

UI поверх цього мапить на конкретні toast/redirect/RHF-помилки. Без таксономії — лиш `status` коди, і фронт мусить парсити `title` (крихко).

---

## E. Документація / OpenAPI

Це є в `lyceum-157-backend` (Swagger), але треба:

1. **Усі нові ендпоінти** з прикладами request/response.
2. **`@Schema`-анотації** на DTOs (особливо enum-значення — без них клієнтський codegen втрачає типи).
3. **`X-Idempotency-Replayed: true`** оголосити як response-header.
4. **`servers:` блок** з `https://api.hub.157.kyiv.ua/api/v1` (зараз часто Swagger показує `localhost`).

---

## F. Пріоритезація

| # | Що | Блокує UI |
|---|---|---|
| P0 | A.1, A.2, A.5, A.6 | Студент-кабінет (`/student/*`) — найбільший cluster |
| P0 | A.7, A.8, A.9, A.10 | Адмін-кабінет (refund + payout flow) |
| P0 | C.2 (CORS), C.3 (expose headers) | Будь-який крос-домен |
| P0 | D — як мінімум розрізнити replay-refresh / token-invalid / out-of-stock | UX-помилки |
| P1 | A.3, A.4 | Image-flow для редагування товару |
| P1 | B.1 (finance breakdown) | Сторінка `/student/finance` буде "5 цифр" |
| P1 | B.5 (masked parentEmail) | UX register-success |
| P2 | B.3 (reCAPTCHA), B.4 (rate-limit 429) | Анти-фрод (нагально для prod) |
| P2 | B.6 (resubmit short-cut) | Косметика |

---

## G. Зв'язок із фронтенд-фіксами

Поки бекенд не закриє розділ A, на фронті треба:

- видалити placeholder-екрани `student-products`, `admin-products`, `admin-payouts`, `admin-order` зі списку "готових" — вони чекають на дані;
- `views/account` зараз дістає роль із `useAuth()` (в-пам'яті). Після появи `GET /users/me` — переносити на TanStack Query з `staleTime: 60_000` як джерело правди.

---

**Контакти:**
- Frontend repo: `lyceum-157-frontend/` (Next.js 14, App Router)
- Frontend API client: `src/shared/api/**`
- Frontend API contract (текущий): `FRONTEND-API.md`
