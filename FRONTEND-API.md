# Lyceum 157 — Frontend API Integration Guide

Повний контракт між Next.js фронтендом і Spring Boot бекендом `lyceum-157-backend`. Документ описує **усі** доступні роути, їхню логіку, валідацію, бізнес-правила, моделі даних і готові патерни підключення.

---

## 0. Базові константи

```ts
// lib/api/constants.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://api.hub.157.kyiv.ua/api/v1";
export const ACCESS_TOKEN_TTL_SEC = 900;        // 15 хв
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const PRESIGNED_UPLOAD_TTL_SEC = 300;    // 5 хв
export const IDEMPOTENCY_REPLAY_WINDOW_HOURS = 24;
```

| Параметр | Значення |
|---|---|
| Base URL | `/api/v1` |
| Content-Type (звичайні запити) | `application/json` |
| Content-Type (S3 upload) | `image/jpeg \| image/png \| image/webp` (бінар напряму на S3) |
| Content-Type (LiqPay webhook) | `application/x-www-form-urlencoded` (не використовується фронтом) |
| Auth | `Authorization: Bearer <accessToken>` |
| Refresh | HttpOnly cookie `refresh_token` (Secure, SameSite=Strict, path=`/api/v1/auth`) |
| Дати | ISO-8601 `2026-05-07T12:00:00.000Z` |
| Гроші | **рядки** `"850.00"` (`BigDecimal`, scale 2, HALF_UP) |
| Enum-формат | `SCREAMING_SNAKE_CASE` |
| Pagination | стандарт Spring `Page<T>` |

---

## 1. Формат помилок (RFC 7807)

Усі 4xx/5xx повертаються як `application/problem+json`:

```ts
// lib/api/errors.ts
export type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  invalidParams?: Array<{ field: string; reason: string }>;
};

export class ApiError extends Error {
  constructor(public problem: ProblemDetail) {
    super(problem.title);
  }
  get isValidation()    { return this.problem.status === 400; }
  get isUnauthorized()  { return this.problem.status === 401; }
  get isForbidden()     { return this.problem.status === 403; }
  get isNotFound()      { return this.problem.status === 404; }
  get isConflict()      { return this.problem.status === 409; }
  get isUnsupported()   { return this.problem.status === 415; }
  get isTransient()     { return this.problem.status >= 500; }
}
```

| Статус | Коли |
|---|---|
| 400 | Валідація — дивись `invalidParams[]` |
| 401 | Немає / прострочений / replay refresh-токен / неправильний TOTP |
| 403 | RBAC — є токен, але не та роль |
| 404 | Ресурс не знайдено / не належить юзеру / magic-link битий |
| 409 | State-machine конфлікт (edit ACTIVE-товару, недостатньо stock, replay із іншим тілом, не-APPROVED payout) |
| 415 | Magic-bytes файлу не збігаються з `declaredMimeType` |
| 503 | Транзитна помилка (БД лежить) — клієнт може ретраїти |

---

## 2. HTTP-клієнт (готовий шаблон)

### 2.1. Стейт токенів

```ts
// lib/api/auth-store.ts (Zustand чи будь-який стор)
type AuthState = {
  accessToken: string | null;
  userId: string | null;
  role: "STUDENT" | "PARENT" | "ADMIN" | null;
  expiresAt: number; // ms epoch
};
```

Refresh-cookie фронт **не бачить** — він HttpOnly. Усе керування через `credentials: "include"` на запитах до `/auth/*`.

### 2.2. Базова обгортка

```ts
// lib/api/client.ts
import { ApiError, type ProblemDetail } from "./errors";

type Options = RequestInit & {
  auth?: boolean;             // додати Bearer
  idempotent?: boolean;       // згенерувати Idempotency-Key
  totp?: string;              // X-TOTP-Code (admin payouts)
};

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  headers.set("Accept", "application/json");
  if (!(opts.body instanceof FormData) && opts.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth !== false) {
    const tok = getAccessToken();
    if (tok) headers.set("Authorization", `Bearer ${tok}`);
  }
  if (opts.idempotent ?? isMutating(opts.method)) {
    headers.set("Idempotency-Key", crypto.randomUUID());
  }
  if (opts.totp) headers.set("X-TOTP-Code", opts.totp);

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    credentials: path.startsWith("/auth/") ? "include" : "same-origin",
  });

  if (res.status === 204) return undefined as T;

  // Auto-refresh on 401 (один раз, лише для protected)
  if (res.status === 401 && opts.auth !== false && !path.startsWith("/auth/")) {
    if (await tryRefresh()) return api<T>(path, opts);
  }

  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as ProblemDetail | null;
    throw new ApiError(problem ?? fallbackProblem(res));
  }

  const ct = res.headers.get("Content-Type") ?? "";
  return ct.includes("text/csv") ? (res.body as unknown as T) : (res.json() as Promise<T>);
}

const isMutating = (m?: string) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes((m ?? "GET").toUpperCase());
```

### 2.3. Refresh single-flight

```ts
let refreshing: Promise<boolean> | null = null;

export async function tryRefresh(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const r = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) { logout(); return false; }
      const t = await r.json();
      setTokens(t);
      return true;
    } finally { refreshing = null; }
  })();
  return refreshing;
}
```

### 2.4. Idempotency

- Генеруй `crypto.randomUUID()` **на кожен новий бізнес-запит**.
- Якщо ретраїш мережеву помилку — використовуй **той самий ключ** (зберігай у `sessionStorage` до відповіді).
- Replay у межах 24 год → той самий response + header `X-Idempotency-Replayed: true`.
- Якщо replay із **іншим тілом** → `409 Conflict`.

---

# 3. Роути

## 3.1. AUTH — `/api/v1/auth` (публічно)

| Endpoint | Опис |
|---|---|
| `POST /auth/register` | Створення STUDENT-акаунта + magic-link на email батьків |
| `POST /auth/login` | Логін, видача access-токена + refresh-cookie |
| `POST /auth/refresh` | Ротація refresh + новий access |
| `POST /auth/logout` | Інвалідація refresh, очистка cookie |

### 3.1.1. POST /auth/register

**Тіло:**

```ts
type RegisterRequest = {
  email: string;        // @Email, ≤255
  password: string;     // 8..128 chars
  firstName: string;    // ≤100, NotBlank
  lastName: string;     // ≤100, NotBlank
  grade: string;        // ^\d{1,2}-[А-ЯA-Z]$  (приклад: "9-А", "11-B")
  parentEmail: string;  // @Email, ≤255, ≠ email учня
};
```

**Відповідь 201:**

```ts
type RegisterResponse = { userId: string; message: string };
```

**Помилки:** 400 валідація, 409 — email уже зареєстрований.

**UX:** після успіху — показати екран «Лист зі згодою надіслано батькам на `parentEmail`». Учень ще НЕ може публікувати товари.

---

### 3.1.2. POST /auth/login

**Тіло:** `{ email: string; password: string }`

**Відповідь 200:**

```ts
type TokenResponse = {
  accessToken: string;
  expiresIn: number;          // 900
  tokenType: "Bearer";
  userId: string;
  role: "STUDENT" | "PARENT" | "ADMIN";
};
```

Плюс `Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800`.

**Помилки:** 401 — невірний email/пароль.

**Важливо:** `fetch` має бути з `credentials: "include"`.

---

### 3.1.3. POST /auth/refresh

Без тіла. Читає cookie `refresh_token`, видає **новий пар** (rotating refresh + cookie оновлюється).

**Replay-detection:** якщо той самий refresh-токен пред'являють двічі → **усі сесії** юзера ревокаються → 401. Фронт має зразу робити logout.

```ts
async function refresh() {
  return fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" });
}
```

---

### 3.1.4. POST /auth/logout

Без тіла. Cookie тригер ідемпотентний — викликати безпечно навіть без cookie. Завжди 204.

---

## 3.2. CATALOG — `/api/v1/products` (публічно, Redis-кеш 5 хв)

### 3.2.1. GET /products — список ACTIVE

**Query:**

| Параметр | Тип | Default | Обмеження |
|---|---|---|---|
| `page` | int | 0 | ≥0 |
| `size` | int | 20 | 1..100 |
| `type` | `PHYSICAL \| DIGITAL` | (всі) | optional |
| `sort` | `newest \| price_asc \| price_desc \| popular` | `newest` | |

**Відповідь:** `Page<ProductCardDto>`

```ts
type ProductCardDto = {
  id: string;
  title: string;
  slug: string;
  priceUah: string;     // BigDecimal, "850.00"
  type: "PHYSICAL" | "DIGITAL";
  author: { studentId: string; firstName: string; grade: string };
  thumbnailUrl: string | null;
};

type Page<T> = {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
```

### 3.2.2. GET /products/{slug} — деталі

**Path:** `slug` — URL-safe (наприклад `painting-sunset-1234abcd`).

**Відповідь:**

```ts
type ProductDetailDto = {
  id: string;
  title: string;
  slug: string;
  description: string;        // sanitized HTML — можна dangerouslySetInnerHTML
  priceUah: string;
  type: "PHYSICAL" | "DIGITAL";
  stockQty: number;           // PHYSICAL only
  viewCount: number;
  author: AuthorDto;
  imageUrls: string[];        // primary first
};
```

**404:** не існує / не ACTIVE / soft-deleted. Інкремент `viewCount` асинхронний.

---

## 3.3. ORDERS — `/api/v1/orders` (публічно)

### 3.3.1. POST /orders

**Header (обов'язковий):** `Idempotency-Key: <UUID>`

**Тіло:**

```ts
type CreateOrderRequest = {
  buyerEmail: string;          // @Email, ≤255
  buyerName: string;           // NotBlank, ≤255
  buyerPhone: string;          // ^\+380\d{9}$
  items: Array<{
    productId: string;         // UUID
    quantity: number;          // ≥1
  }>;                          // NotEmpty
};
```

**Відповідь 201:**

```ts
type OrderCreationResponse = {
  orderId: string;
  orderNumber: string;        // "L157-2026-001234"
  totalAmount: string;        // "1500.00"
  status: "PENDING_PAYMENT";
  paymentUrl: string;         // LiqPay redirect
};
```

**Помилки:**
- 400 валідація
- 409 — недостатньо stock / replay із іншим тілом
- 503 — транзитно (ретрай з тим же `Idempotency-Key`)

**UX:** після `201` зробити `window.location.href = response.paymentUrl`. Бекенд гарантує race-safe-decrement через pessimistic-locks у sorted ID order.

---

## 3.4. KYC (батьки) — `/api/v1/kyc` (публічно, magic-link auth)

Усі endpoints авторизуються одноразовим magic-link токеном з email.

### 3.4.1. GET /kyc/session/{token}

**Не споживає** токен — дає preview перед сабмітом.

**Path:** `token` — magic-link з email.

**Відповідь:**

```ts
type KycSessionResponse = {
  studentName: string;        // "Анна Петренко"
  grade: string;              // "9-А"
  status: "AWAITING_DETAILS" | "PENDING_SIGNATURE" | "APPROVED";
};
```

Response має `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store`.

**404:** токен битий / прострочений / неправильний `purpose`.

### 3.4.2. POST /kyc/parents/submit?token=<magicLink>

**Споживає** magic-link токен (одноразово, raceless).

**Тіло:**

```ts
type KycSubmitRequest = {
  parentName: string;         // NotBlank, ≤255
  parentRnokpp: string;       // 10 digits + ukrainian-checksum (custom validator)
  payoutCard: string;         // PAN, Luhn-validated, без пробілів
};
```

**Відповідь 200:**

```ts
type KycSubmitResponse = {
  status: "PENDING_SIGNATURE";
  signDocumentUrl: string | null;   // редірект у Vchasno
  expiresAt: string;                // ISO
};
```

**404:** токен битий / уже використаний.

**UX:** після відповіді — `window.location.href = signDocumentUrl`. Vchasno → webhook → `LegalConsent.status=APPROVED` → учень може `submit` товари.

### 3.4.3. POST /kyc/parents/update-card?token=<magicLink>

Окремий magic-link типу `CARD_UPDATE` (не той самий, що для початкового KYC).

**Тіло:** `{ payoutCard: string /* Luhn */ }`

**Відповідь:** 204.

---

## 3.5. STUDENT · Products — `/api/v1/student/products` (Bearer + ROLE_STUDENT)

### State machine товару

```
DRAFT ──submit──> PENDING_REVIEW ──approve──> ACTIVE ──hide──> HIDDEN
  ↑                       │                      ↑                │
  └── edit (DRAFT only)   └──reject──> REJECTED  └─── unhide ─────┘
                                          │
                                       (edit → DRAFT через PUT)
```

| Статус | Можна edit | Видно публічно |
|---|---|---|
| DRAFT | ✅ | ❌ |
| PENDING_REVIEW | ❌ | ❌ |
| ACTIVE | ❌ (hide → новий draft) | ✅ |
| HIDDEN | ❌ | ❌ |
| REJECTED | ✅ | ❌ |

### 3.5.1. POST /student/products — створити DRAFT

```ts
type CreateProductRequest = {
  title: string;              // NotBlank, ≤200, OWASP-sanitized
  description: string;        // NotBlank, ≤10000, HTML allowed (sanitized)
  priceUah: string;           // 50.00 .. 50000.00
  type: "PHYSICAL" | "DIGITAL";
  stockQty: number;           // ≥0; ігнорується для DIGITAL
};
// → 201 { id: string }
```

### 3.5.2. PUT /student/products/{productId} — редагувати

Тільки `DRAFT` або `REJECTED`. Інакше **409**.

```ts
type EditProductRequest = {
  title: string;
  description: string;
  priceUah: string;           // 50..50000
};
// → 204
```

`type` і `stockQty` змінити не можна після створення.

### 3.5.3. POST /student/products/{productId}/submit

`DRAFT → PENDING_REVIEW`. **409** якщо:
- KYC батьків не `APPROVED`,
- немає жодного підтвердженого зображення.

### 3.5.4. POST /student/products/{productId}/hide

`ACTIVE → HIDDEN`. → 204.

### 3.5.5. POST /student/products/{productId}/unhide

`HIDDEN → ACTIVE`. → 204.

### 3.5.6. DELETE /student/products/{productId}

Soft-delete (`deleted_at`). Pending orders залишаються лінкованими. → 204.

### 3.5.7. POST /student/products/{productId}/images/upload-url — крок 1

```ts
type UploadImageRequest = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
};

type PresignedUploadDto = {
  url: string;                            // S3 PUT URL, TTL 5 хв
  s3Key: string;                          // повертати в /confirm
  requiredHeaders: Record<string, string>; // мають бути в S3-PUT
  expiresAt: string;                      // ISO
};
```

### 3.5.8. PUT прямо на S3 (поза бекендом)

```ts
async function uploadToS3(presigned: PresignedUploadDto, file: File) {
  const r = await fetch(presigned.url, {
    method: "PUT",
    headers: presigned.requiredHeaders,    // ВКЛЮЧАЮЧИ Content-Type
    body: file,
  });
  if (!r.ok) throw new Error(`S3 upload failed: ${r.status}`);
}
```

### 3.5.9. POST /student/products/{productId}/images/confirm — крок 2

```ts
type ConfirmImageRequest = {
  s3Key: string;
  declaredMimeType: "image/jpeg" | "image/png" | "image/webp";
  primary: boolean;             // primary = thumbnail у каталозі
};
// → 204
// → 415 якщо magic-bytes не співпадають із declaredMimeType (файл видаляється з S3)
```

**Повний flow upload (готовий приклад):**

```ts
async function uploadProductImage(productId: string, file: File, primary = false) {
  const presigned = await api<PresignedUploadDto>(
    `/student/products/${productId}/images/upload-url`,
    { method: "POST", body: JSON.stringify({ contentType: file.type }) }
  );
  await uploadToS3(presigned, file);
  await api<void>(
    `/student/products/${productId}/images/confirm`,
    {
      method: "POST",
      body: JSON.stringify({
        s3Key: presigned.s3Key,
        declaredMimeType: file.type,
        primary,
      }),
    }
  );
}
```

---

## 3.6. STUDENT · Finance — `/api/v1/student/finance` (Bearer + ROLE_STUDENT)

### 3.6.1. GET /student/finance/summary

```ts
type FinanceSummaryDto = {
  totalGross: string;          // вся валова виручка
  totalTaxes: string;          // PDFO 18% + ВЗ 1.5%
  totalNetEarned: string;      // що пішло батькам
  pendingHold: string;         // у 14-денному chargeback hold
  pendingApproved: string;     // approved, чекає на admin payout execute
};
```

Усі значення — рядки `BigDecimal`. Math інваріант: `gross == pdfo + vz + fee + net` (`TaxCalculator` + DB CHECK).

---

## 3.7. USERS — `/api/v1/users` (Bearer + STUDENT|PARENT)

### 3.7.1. DELETE /users/me — GDPR right-to-be-forgotten

Soft-delete + **crypto-shred** RNOKPP/PAN + анонімізація buyer-полів у Orders + revoke усіх refresh-токенів. Tax-required записи (payouts, fiscal_receipts) живуть 7 років, але PII не розшифрується.

→ 204.

**UX:** після успіху — повне видалення локального стану + редірект на головну.

---

## 3.8. ADMIN · 2FA — `/api/v1/admin/2fa` (Bearer + ROLE_ADMIN)

### 3.8.1. POST /admin/2fa/enroll

Без тіла. Кожен виклик регенерує secret — попередній стає невалідним.

```ts
type TotpEnrollResponse = {
  qrCodeDataUri: string;        // data:image/png;base64,... → <img src=...>
  secretBase32: string;         // для manual-entry в Authy
  recoveryCodes: string[];      // 10 кодів, показати один раз
};
```

### 3.8.2. POST /admin/2fa/confirm

Перший валідний TOTP-код підтверджує enrollment.

```ts
{ code: string }     // 6 digits
// → 204; 400 якщо invalid/expired
```

### 3.8.3. POST /admin/2fa/verify

Stateless-перевірка (UI використовує перед чутливою операцією).

```ts
{ code: string }     // 6 digits (TOTP) або 8 digits (recovery)
// → { valid: boolean }
```

---

## 3.9. ADMIN · Products — `/api/v1/admin/products` (ROLE_ADMIN)

### 3.9.1. GET /admin/products

**Query:** `status` (default `PENDING_REVIEW`), `page`, `size=50` (default), `sort=createdAt`.

**Можливі статуси:** `DRAFT | PENDING_REVIEW | ACTIVE | REJECTED | HIDDEN | DELETED`.

```ts
type AdminProductDto = {
  id: string;
  title: string;
  slug: string | null;          // null до approve
  descriptionPlain: string;     // HTML stripped
  priceUah: string;
  type: "PHYSICAL" | "DIGITAL";
  stockQty: number;
  status: ProductStatus;
  rejectionReason: string | null;
  studentId: string;
  studentFullName: string;
  studentGrade: string;
  kycSigned: boolean;           // gate на approve
  createdAt: string;
};
```

### 3.9.2. POST /admin/products/{id}/approve

`PENDING_REVIEW → ACTIVE`. Генерується public slug. → 200 + `AdminProductDto`. **409:** не PENDING_REVIEW.

### 3.9.3. POST /admin/products/{id}/reject

`PENDING_REVIEW → REJECTED`. Reason шлеться учневі.

```ts
{ reason: string }   // 10..500 chars
// → 200 AdminProductDto
```

---

## 3.10. ADMIN · Orders — `/api/v1/admin/orders` (ROLE_ADMIN)

### 3.10.1. POST /admin/orders/{orderId}/refund

Тільки **повний** refund (партіал у v1 нема).

```ts
{ reason: string }   // 5..500 chars
// → 204
// → 409 якщо order не в refundable-стані
```

LiqPay reversal API. Якщо payout уже виконано — bank fee write-off (admin info, не блок).

---

## 3.11. ADMIN · Payouts — `/api/v1/admin/payouts` (ROLE_ADMIN, **2FA-gated**)

### 3.11.1. POST /admin/payouts/execute

**Header (обов'язковий):** `X-TOTP-Code: 123456` (6 digits).

```ts
type PayoutBatchRequest = {
  payoutIds: string[];          // 1..200
};

type PayoutBatchResponse = {
  processedCount: number;
  jobId: string;                // для log-correlation
  message: string;
};
// → 202 Accepted
// → 401 invalid TOTP
// → 409 payout не в APPROVED або вже processing
```

5-layer protection (бекенд): TOTP → pessimistic lock → Redisson dist lock → JPA `@Version` → DB UNIQUE on success. Final SUCCESS/FAILED — асинхронно через LiqPay payout-webhook.

**UX:**
1. Адмін ставить чекбокси на approved payouts.
2. UI відкриває modal «Введіть TOTP» → POST `/admin/2fa/verify` (опційно).
3. POST `/admin/payouts/execute` з `X-TOTP-Code`.
4. На відповіді `202` — показати «Очікуємо підтвердження банку, jobId=…» і polling якщо є read-endpoint (у v1 немає — слухається через окремий dashboard / sse).

---

## 3.12. ADMIN · Tax Report — `/api/v1/admin/payouts/export` (ROLE_ADMIN)

### 3.12.1. GET /admin/payouts/export/tax-report?from=YYYY-MM-DD&to=YYYY-MM-DD

CSV-стрім. RNOKPP розшифровується on-the-fly; кожен доступ → запис в `audit_logs`.

**Headers відповіді:**
- `Content-Type: text/csv; charset=UTF-8`
- `Content-Disposition: attachment; filename="4DF_<from>_<to>.csv"`
- `Cache-Control: no-store, no-cache, must-revalidate`
- `Pragma: no-cache`

**Frontend approach:** не парсити в JS — просто `<a href={url} download>` із доданим Bearer-токеном через blob-fetch:

```ts
async function downloadTaxReport(from: string, to: string) {
  const r = await fetch(
    `${API_BASE}/admin/payouts/export/tax-report?from=${from}&to=${to}`,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } }
  );
  if (!r.ok) throw new ApiError(await r.json());
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `4DF_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 3.13. WEBHOOKS (для довідки, не для фронта)

| Endpoint | Auth | Опис |
|---|---|---|
| `POST /webhooks/liqpay` | Base64-SHA1 signature | Платіжний статус (success/failure/wait_accept) |
| `POST /webhooks/vchasno` | HMAC-SHA256 (`X-Vchasno-Signature`) | Статус e-підпису |

Фронт **не викликає** ці endpoints.

---

## 3.14. Системні

| Endpoint | Доступ | Призначення |
|---|---|---|
| `GET /actuator/health/**` | публічно | k8s liveness/readiness |
| `GET /actuator/info` | публічно | build-info |
| `GET /actuator/prometheus` | ROLE_ADMIN | metrics |
| `GET /v3/api-docs/**` | публічно | OpenAPI JSON |
| `GET /swagger-ui.html` | публічно | Swagger UI |

---

# 4. Поведінкові патерни

## 4.1. Cookie-based refresh (Next.js App Router)

В Next 14+ `fetch` на server-component не пробрасує cookies автоматично — використовуй `cookies()`:

```ts
// app/lib/server-api.ts
import { cookies } from "next/headers";

export async function serverApi<T>(path: string, init?: RequestInit): Promise<T> {
  const cookie = cookies().toString();
  const r = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...init?.headers, Cookie: cookie },
    cache: "no-store",
  });
  return r.json();
}
```

Для **публічних** read-endpoints (каталог) використовуй ISR/тег-revalidation:

```ts
fetch(`${API_BASE}/products?page=0`, { next: { revalidate: 300, tags: ["catalog"] } });
```

## 4.2. Idempotency-Key store

```ts
// hooks/useIdempotentMutation.ts
export function useIdempotentMutation<TBody, TResp>(path: string) {
  const [busy, setBusy] = useState(false);

  return async (body: TBody): Promise<TResp> => {
    setBusy(true);
    const storageKey = `idem:${path}:${hash(body)}`;
    let key = sessionStorage.getItem(storageKey);
    if (!key) {
      key = crypto.randomUUID();
      sessionStorage.setItem(storageKey, key);
    }
    try {
      const r = await api<TResp>(path, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Idempotency-Key": key },
      });
      sessionStorage.removeItem(storageKey);
      return r;
    } finally { setBusy(false); }
  };
}
```

## 4.3. Auto-refresh + queue

Використовуй single-flight (див. 2.3). Інші запити, що отримали 401 під час refresh, чекають один `Promise<boolean>` і ретраяться.

## 4.4. Авторизаційний guard у Next

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/student", "/admin", "/account"];

export function middleware(req: NextRequest) {
  if (PROTECTED.some(p => req.nextUrl.pathname.startsWith(p))) {
    const hasRefresh = req.cookies.has("refresh_token");
    if (!hasRefresh) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
```

Точна перевірка ролі — на client/RSC через `accessToken.role`.

## 4.5. Sanitized HTML

`description` із бекенду вже OWASP-sanitized. Можна напряму:

```tsx
<article dangerouslySetInnerHTML={{ __html: product.description }} />
```

Якщо хочеш додатковий шар — `isomorphic-dompurify`, але це не обов'язково.

## 4.6. Money formatting

```ts
const fmtUAH = (s: string) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseFloat(s)); // OK для display; для розрахунків — decimal.js
```

Ніколи не **рахуй** `parseFloat(price) * qty` без decimal-lib — точність плаває.

---

# 5. Готові API-модулі (Next.js + TanStack Query)

```ts
// lib/api/auth.ts
export const authApi = {
  register: (b: RegisterRequest) =>
    api<RegisterResponse>("/auth/register", { method: "POST", body: JSON.stringify(b), auth: false }),
  login: (b: LoginRequest) =>
    api<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(b), auth: false }),
  refresh: () =>
    api<TokenResponse>("/auth/refresh", { method: "POST", auth: false }),
  logout: () =>
    api<void>("/auth/logout", { method: "POST", auth: false }),
};

// lib/api/catalog.ts
export const catalogApi = {
  list: (q: { page?: number; size?: number; type?: ProductType; sort?: string }) =>
    api<Page<ProductCardDto>>(`/products?${qs(q)}`, { auth: false }),
  bySlug: (slug: string) =>
    api<ProductDetailDto>(`/products/${slug}`, { auth: false }),
};

// lib/api/orders.ts
export const ordersApi = {
  create: (b: CreateOrderRequest, idemKey: string) =>
    api<OrderCreationResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(b),
      headers: { "Idempotency-Key": idemKey },
      auth: false,
    }),
};

// lib/api/kyc.ts
export const kycApi = {
  peek: (token: string) =>
    api<KycSessionResponse>(`/kyc/session/${token}`, { auth: false }),
  submit: (token: string, b: KycSubmitRequest) =>
    api<KycSubmitResponse>(`/kyc/parents/submit?token=${token}`, {
      method: "POST", body: JSON.stringify(b), auth: false,
    }),
  updateCard: (token: string, payoutCard: string) =>
    api<void>(`/kyc/parents/update-card?token=${token}`, {
      method: "POST", body: JSON.stringify({ payoutCard }), auth: false,
    }),
};

// lib/api/student.ts
export const studentApi = {
  products: {
    create:    (b: CreateProductRequest)            => api<{ id: string }>("/student/products", { method: "POST", body: JSON.stringify(b) }),
    edit:      (id: string, b: EditProductRequest)  => api<void>(`/student/products/${id}`, { method: "PUT", body: JSON.stringify(b) }),
    submit:    (id: string)                         => api<void>(`/student/products/${id}/submit`,   { method: "POST" }),
    hide:      (id: string)                         => api<void>(`/student/products/${id}/hide`,     { method: "POST" }),
    unhide:    (id: string)                         => api<void>(`/student/products/${id}/unhide`,   { method: "POST" }),
    delete:    (id: string)                         => api<void>(`/student/products/${id}`,          { method: "DELETE" }),
    uploadUrl: (id: string, contentType: string)    => api<PresignedUploadDto>(`/student/products/${id}/images/upload-url`, { method: "POST", body: JSON.stringify({ contentType }) }),
    confirmImg:(id: string, b: ConfirmImageRequest) => api<void>(`/student/products/${id}/images/confirm`, { method: "POST", body: JSON.stringify(b) }),
  },
  finance: {
    summary: () => api<FinanceSummaryDto>("/student/finance/summary"),
  },
};

// lib/api/users.ts
export const userApi = {
  deleteMe: () => api<void>("/users/me", { method: "DELETE" }),
};

// lib/api/admin.ts
export const adminApi = {
  twoFa: {
    enroll:  ()                  => api<TotpEnrollResponse>("/admin/2fa/enroll", { method: "POST" }),
    confirm: (code: string)      => api<void>("/admin/2fa/confirm", { method: "POST", body: JSON.stringify({ code }) }),
    verify:  (code: string)      => api<{ valid: boolean }>("/admin/2fa/verify", { method: "POST", body: JSON.stringify({ code }) }),
  },
  products: {
    list:    (status?: ProductStatus, page = 0, size = 50) =>
      api<Page<AdminProductDto>>(`/admin/products?${qs({ status, page, size })}`),
    approve: (id: string) => api<AdminProductDto>(`/admin/products/${id}/approve`, { method: "POST" }),
    reject:  (id: string, reason: string) =>
      api<AdminProductDto>(`/admin/products/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  },
  orders: {
    refund: (orderId: string, reason: string) =>
      api<void>(`/admin/orders/${orderId}/refund`, { method: "POST", body: JSON.stringify({ reason }) }),
  },
  payouts: {
    execute: (payoutIds: string[], totp: string) =>
      api<PayoutBatchResponse>("/admin/payouts/execute", {
        method: "POST",
        body: JSON.stringify({ payoutIds }),
        totp,
      }),
  },
  taxReport: {
    download: downloadTaxReport,   // див. 3.12
  },
};

const qs = (o: Record<string, unknown>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
```

---

# 6. Маршрутна карта Next.js (рекомендована)

| Шлях фронта | Хто | Що використовує |
|---|---|---|
| `/` | публічно | `catalogApi.list({ page:0, sort:"newest" })` |
| `/p/[slug]` | публічно | `catalogApi.bySlug(slug)` |
| `/cart` | публічно | local state |
| `/checkout` | публічно | `ordersApi.create` → redirect `paymentUrl` |
| `/checkout/success` | публічно | landing після LiqPay |
| `/checkout/failure` | публічно | landing при failure |
| `/login` | публічно | `authApi.login` |
| `/register` | публічно | `authApi.register` |
| `/parent/kyc/[token]` | magic-link | `kycApi.peek` → form → `kycApi.submit` → redirect Vchasno |
| `/parent/card-update/[token]` | magic-link | `kycApi.updateCard` |
| `/student` | STUDENT | dashboard |
| `/student/products` | STUDENT | список своїх (немає GET-endpoint у v1 — підказка: треба додати) |
| `/student/products/new` | STUDENT | `studentApi.products.create` + image-flow |
| `/student/products/[id]/edit` | STUDENT | `studentApi.products.edit` |
| `/student/finance` | STUDENT | `studentApi.finance.summary` |
| `/account` | STUDENT/PARENT | `userApi.deleteMe` |
| `/admin` | ADMIN | dashboard |
| `/admin/2fa` | ADMIN | enroll/confirm |
| `/admin/products?status=PENDING_REVIEW` | ADMIN | `adminApi.products.list` |
| `/admin/orders/[id]` | ADMIN | refund |
| `/admin/payouts` | ADMIN | список + `execute` (modal TOTP) |
| `/admin/reports/tax` | ADMIN | `adminApi.taxReport.download` |

⚠️ **Гепи у v1 API** (бекенд ще не має — узгодь із бекенд-командою перед UI):
- `GET /student/products` — список своїх товарів учня.
- `GET /student/orders` — історія орденів учня для трекінгу payout-ів.
- `GET /admin/payouts` — список payouts (зараз тільки execute).
- `GET /admin/orders` — список замовлень для refund-UI.
- `GET /users/me` — профіль для page `/account`.

---

# 7. Чек-лист підключення

1. ✅ Налаштувати `NEXT_PUBLIC_API_BASE`.
2. ✅ Реалізувати `client.ts` з auto-refresh single-flight.
3. ✅ Cookie: `credentials: "include"` на всі `/auth/*`.
4. ✅ Idempotency-Key на всі mutating-запити (особливо `POST /orders`, `POST /admin/payouts/execute`).
5. ✅ ProblemDetail-handler → toast із `invalidParams` для 400, 401-rotate, 409-state messages.
6. ✅ Money як рядки, форматування через `Intl.NumberFormat`, розрахунки через `decimal.js`.
7. ✅ Валідація на клієнті — дзеркал бекенд-обмежень (Zod schemas).
8. ✅ S3 upload: PUT із `requiredHeaders` тільки після `upload-url`. Завжди після успіху — `confirm`.
9. ✅ Magic-link сторінки — `noindex,nofollow`, no-cache.
10. ✅ Admin 2FA: окремий modal перед `/admin/payouts/execute`.
11. ✅ Refresh-token cookie має `path=/api/v1/auth` — НЕ ламай pathing на dev-проксі.
12. ✅ CSV-експорт — fetch + blob, не `<a>` (бо треба Bearer).

---

# 8. Zod-схеми (готові валідатори)

```ts
import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  grade: z.string().regex(/^\d{1,2}-[А-ЯA-Z]$/, "формат 9-А або 11-B"),
  parentEmail: z.string().email().max(255),
}).refine(d => d.email !== d.parentEmail, { message: "Email учня й батьків мають відрізнятись", path: ["parentEmail"] });

export const CreateOrderSchema = z.object({
  buyerEmail: z.string().email().max(255),
  buyerName: z.string().min(1).max(255),
  buyerPhone: z.string().regex(/^\+380\d{9}$/, "Формат +380XXXXXXXXX"),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
});

export const KycSubmitSchema = z.object({
  parentName: z.string().min(1).max(255),
  parentRnokpp: z.string().regex(/^\d{10}$/, "10 цифр"),     // checksum валідуємо на бекенді
  payoutCard: z.string().regex(/^\d{13,19}$/, "13–19 цифр"), // Luhn — на бекенді
});

export const CreateProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10_000),
  priceUah: z.string().regex(/^\d+(\.\d{1,2})?$/).refine(v => {
    const n = parseFloat(v);
    return n >= 50 && n <= 50_000;
  }, "50.00 .. 50000.00"),
  type: z.enum(["PHYSICAL", "DIGITAL"]),
  stockQty: z.number().int().min(0),
});

export const RefundSchema = z.object({ reason: z.string().min(5).max(500) });
export const RejectProductSchema = z.object({ reason: z.string().min(10).max(500) });
export const TotpCodeSchema = z.object({ code: z.string().regex(/^\d{6,8}$/) });
export const PayoutBatchSchema = z.object({ payoutIds: z.array(z.string().uuid()).min(1).max(200) });
```

---

# 9. Ролі та доступ (RBAC матриця)

| Ресурс | Public | STUDENT | PARENT | ADMIN |
|---|---|---|---|---|
| `/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `GET /products`, `/products/{slug}` | ✅ | ✅ | ✅ | ✅ |
| `POST /orders` | ✅ | ✅ | ✅ | ✅ |
| `/kyc/*` (magic-link) | ✅ | — | ✅ | — |
| `/student/products/*` | ❌ | ✅ | ❌ | ❌ |
| `/student/finance/*` | ❌ | ✅ | ❌ | ❌ |
| `DELETE /users/me` | ❌ | ✅ | ✅ | ❌ |
| `/admin/*` | ❌ | ❌ | ❌ | ✅ |
| `/admin/payouts/execute` | ❌ | ❌ | ❌ | ✅ + TOTP |
| `/webhooks/*` | signature-only | — | — | — |

Бекенд-default — **deny**. Кожен endpoint має explicit `@PreAuthorize` або `permitAll`.

---

# 10. Версіонування і зворотна сумісність

- API під префіксом `/api/v1`.
- Будь-яке breaking-change → новий префікс (`/api/v2`); v1 житиме до явного оголошення EOL.
- Фронт зобов'язаний обробляти **нові поля** в response (поліморфно ігноруючи) і **нові enum-значення** (default-fallback у UI).

---

**Контакти / документація:**
- Swagger UI: `<API_BASE>/swagger-ui.html`
- OpenAPI JSON: `<API_BASE>/v3/api-docs`
- Backend repo: `lyceum-157-backend/` (див. `docs/api-contract.md`, `docs/security-threat.md`)
