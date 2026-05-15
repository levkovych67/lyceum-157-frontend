# FE↔BE Contract Sync Sprint — Design

> **Дата:** 2026-05-15
> **Скоуп:** Усунути drift між frontend і backend контрактом, що накопичився після BE `feat/delivery-nova-poshta-backend` + P0-9..P0-18 fix-серії. Розгорнути на FE delivery UX і нову сторінку "Мої продажі". Запровадити process-гігієну (`BACKEND-CHANGES.md` + CI drift guard).
> **Залежності:** BE-гілка `feat/delivery-nova-poshta-backend` має бути merged у `main` (або щонайменше доступна для локального запуску) перед PR #1.
> **Окремий source of truth для Workflow B (delivery UX):** [`2026-05-13-nova-poshta-delivery-design.md`](../../../../lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md) — у backend-репо. Цей документ не дублює, а лише lifecycle і integration points.

---

## 0. Контекст і проблема

Аудит FE↔BE інтеграції виявив п'ять груп проблем:

| # | Категорія | Severity | Симптом |
|---|---|---|---|
| 1 | Delivery API + DTO відсутні на FE | **Прод-блокер** після BE merge | Будь-яке замовлення фізичного товару падає `DeliveryRequiredException` 400 |
| 2 | `recaptchaToken` відсутній у `CreateOrderRequest` (FE) | Прод-блокер за `app.captcha.enabled=true` | BE повертає 403 на всі замовлення |
| 3 | `Student · Orders` endpoint відсутній у FE | UX-діра | Студент не має сторінки "Мої продажі" |
| 4 | `api.json` застарів на ~50 BE-комітів | Контракт-drift | 8+ endpoint-ів і полів не видні FE |
| 5 | Дрібні баги | Косметика, але видимі | "WayForPay" у LiqPay-формі, `parentEmailMasked` ігнорується, dirty git tree |

Корінь — відсутність `BACKEND-CHANGES.md` (заявлений у CLAUDE.md, але не існує) і відсутність CI-гарду на drift `api.json` ↔ live swagger.

### Поточний дисонанс на FE
`src/shared/api/` містить дві паралельні системи:
- `modules/*.ts` — handwritten thin wrappers, використовуються features.
- `generated/**` — orval-generated React Query hooks і моделі, фактично не імпортуються нікуди.

Це і є джерело drift-у — типи в `generated/` синхронні з `api.json`, а handwritten не синхронні ні з чим.

---

## 1. Скоуп

### 1.1 In scope
- **Workflow A** — Регенерація `api.json` з BE-swagger; міграція всіх FE call-sites з handwritten `modules/*` на orval-generated hooks; видалення `modules/`.
- **Workflow B** — Delivery UX (детально — у [нова поштовій спеці](../../../../lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md), §4). Інтегрується ПІСЛЯ A.
- **Workflow C** — Нова сторінка `/student/orders` поверх `GET /api/v1/student/orders`.
- **Workflow D** — Bugfix batch: LiqPay copy, `parentEmailMasked`, `delivery` echo на success-page, dirty git tree.
- **Workflow E** — `BACKEND-CHANGES.md` + CI drift guard (BE-сайд).

### 1.2 Out of scope
- ReCAPTCHA v3 implementation детально (тільки conditional stub-через-env у Workflow B).
- Pact contract tests (опційно, у follow-up; описано в delivery-спеці §5.3).
- Зміна `SameSite=Strict` cookie policy (працює доки FE і BE під одним registrable domain).
- Експоновання `OrderStatus`/`PayoutStatus` як OpenAPI enum schemas BE-стороною (drift-небезпечно, але follow-up).

### 1.3 Послідовність PR

```
PR #2 (E: BACKEND-CHANGES.md + CI)  ─── merged first ─────────────────┐
                                                                       ↓
PR #1 (A: regen api.json + migrate to orval) ───┬──> PR #3 (D: bugfix batch)
                                                ├──> PR #4 (B: delivery UX)
                                                └──> PR #5 (C: student orders)
```

PR #2 — паралельно з #1, але мерджиться першим, щоб CI відловив drift одразу на PR #1.

---

## 2. Workflow A — Регенерація + міграція на orval

### 2.1 Кроки

1. Підняти BE з гілки `feat/delivery-nova-poshta-backend`:
   ```bash
   cd lyceum-157-backend
   make up               # postgres, redis, minio, mailhog
   ./mvnw spring-boot:run
   ```
2. Стягнути swagger зі стабільним сортуванням ключів:
   ```bash
   curl -fsS http://localhost:8080/v3/api-docs | jq -S . > ../lyceum-157-frontend/api.json
   ```
3. Згенерувати клієнт:
   ```bash
   cd ../lyceum-157-frontend
   pnpm orval
   ```
4. Запустити `pnpm typecheck` — побачимо красний список call-sites, що використовують застарілі handwritten типи.
5. По одному файлу замінити імпорти `from "@/shared/api/modules/<x>"` → `from "@/shared/api/generated/<tag>/<tag>"`. Викликати orval-hook замість handwritten function.
6. **Адаптерний шар** — `src/shared/api/types.ts` тримає алиаси (`Page<T>`, `Role`) — оновити, щоб re-export-или з `generated/models/`. Це збереже існуючі імпорти у views/widgets.
7. Видалити `src/shared/api/modules/` (повністю).
8. `pnpm verify` — typecheck + lint + test + scan-images + build + e2e smoke. Зелений.

### 2.2 Орієнтири на нові імпорти

| Старий handwritten | Новий orval hook |
|---|---|
| `authApi.login(body)` | `useLoginMutation()` (з `generated/auth/auth`) |
| `authApi.refresh()` | `useRefreshMutation()` |
| `authApi.register(body)` | `useRegisterMutation()` |
| `authApi.logout()` | `useLogoutMutation()` |
| `catalogApi.list(q)` | `useListProductCardsQuery(q)` (rename per actual orval slug) |
| `catalogApi.bySlug(slug)` | `useGetProductBySlugQuery(slug)` |
| `ordersApi.create(body, idemKey)` | `useCreateOrderMutation()` + idemKey через `Idempotency-Key` header у mutator |

`shared/api/refresh.ts` стає тонким wrapper-ом над згенерованим `useRefreshMutation` (бо ми тримаємо custom dedup `inflight`-логіку — це FE-only concern). Залишається.

### 2.3 Risk + mitigation

- **Diff на ~30 файлів зразу** — приймаємо. Альтернатива (handwritten → @deprecated → видалення в наступному sprint) була розглянута, але `Generated витісняє handwritten` обрано через ризик постійного drift-у.
- **Idempotency-Key** — переконатися, що `orval-mutator.ts` додає header автоматично для всіх mutating запитів (POST/PUT/PATCH/DELETE). Якщо ні — додати у mutator. Альтернатива (передавати через `mutate({ ..., meta: { idemKey } })`) — гірша DX.
- **Cookie credentials** — `client.ts:28` логіка `credentials: path.startsWith("/auth/") ? "include" : "same-origin"`. У orval-mutator має бути та сама поведінка. Перевірити.

### 2.4 Acceptance
- `pnpm verify` зелений.
- `src/shared/api/modules/` не існує.
- `grep -r "from \"@/shared/api/modules" src` → 0 hit-ів.
- E2E checkout-smoke зелений (digital cart — physical поки що падає, бо delivery UI ще не зроблений; це очікувано до PR #4).

---

## 3. Workflow E — `BACKEND-CHANGES.md` + CI drift guard

### 3.1 `BACKEND-CHANGES.md` (у корені BE-репо)

```markdown
# Backend Changes Log

Running log of FE↔BE contract gaps and changes.
**Update on every PR that touches API surface** (controllers, DTOs, swagger annotations).

## Convention
- Newest entry on top.
- Format: `### YYYY-MM-DD — <short title>`.
- Body: endpoint(s) added/changed, DTO shape diff, FE impact, owner.

## Open gaps (TBD on FE)
- (none, after current sprint completes)

## History

### 2026-05-14 — Delivery / Nova Poshta endpoints (BE branch feat/delivery-nova-poshta-backend)
- Added: GET /api/v1/delivery/methods, GET /api/v1/delivery/nova-poshta/cities,
  GET /api/v1/delivery/nova-poshta/cities/{cityRef}/branches.
- Changed: CreateOrderRequest now contains `delivery: DeliveryRequest` block,
  required for PHYSICAL-cart orders (OrderCreationService:115-116).
- Added: OrderCreationResponse.delivery echo field.
- FE impact: PR #4 (Workflow B).

### 2026-05-13 — Student · Orders read API (slice 1)
- Added: GET /api/v1/student/orders (paginated, status filter, sort whitelist paidAt,createdAt).
- FE impact: PR #5 (Workflow C).

### 2026-05-12 — RegisterResponse expanded
- Changed: RegisterResponse now returns 3 fields (added `parentEmailMasked`).
- FE impact: PR #3 (Workflow D).

[…history continues…]
```

### 3.2 CI drift guard (`lyceum-157-backend/scripts/check-api-contract.sh`)

```bash
#!/usr/bin/env bash
# Runs in CI after BE boots and exposes swagger. Diffs live swagger against committed api.json on FE side.
# Fails CI on drift unless current PR also updates BACKEND-CHANGES.md.
set -euo pipefail

SWAGGER_URL="${SWAGGER_URL:-http://localhost:8080/v3/api-docs}"
FE_API_JSON="${FE_API_JSON:-../lyceum-157-frontend/api.json}"

curl -fsS "$SWAGGER_URL" | jq -S . > /tmp/swagger-live.json
jq -S . "$FE_API_JSON" > /tmp/swagger-committed.json

if ! diff -u /tmp/swagger-committed.json /tmp/swagger-live.json; then
  echo "::error::api.json out of date relative to BE swagger."
  echo "Regenerate: curl \$SWAGGER_URL | jq -S . > lyceum-157-frontend/api.json"
  echo "Then update BACKEND-CHANGES.md."
  exit 1
fi
```

### 3.3 GitHub Actions wiring

Додати job у `.github/workflows/ci.yml` (BE-сайд):

```yaml
api-contract-drift:
  runs-on: ubuntu-latest
  needs: build
  services:
    postgres: { image: postgres:16, env: { POSTGRES_PASSWORD: postgres } }
    redis: { image: redis:7 }
  steps:
    - uses: actions/checkout@v4
      with: { fetch-depth: 0 }
    - uses: actions/checkout@v4
      with: { repository: ${{ github.repository_owner }}/lyceum-157-frontend, path: frontend, token: ${{ secrets.FE_REPO_TOKEN }} }
    - uses: actions/setup-java@v4
      with: { distribution: temurin, java-version: 21 }
    - run: ./mvnw spring-boot:run &
    - run: until curl -fsS http://localhost:8080/v3/api-docs > /dev/null; do sleep 2; done
    - run: bash scripts/check-api-contract.sh
      env: { FE_API_JSON: ./frontend/api.json }
```

Якщо репи в різних org-ах і немає cross-repo токена — простіше тримати `api.json` дзеркало у BE-репо (`src/main/resources/openapi-snapshot.json`) і diff проти нього. У PR #2 обираємо реалістичний варіант на основі того, чи є cross-repo доступ.

### 3.4 Acceptance
- `BACKEND-CHANGES.md` існує і має історію за період 2026-05-07 → today.
- Скрипт `scripts/check-api-contract.sh` запускається локально і повертає 0 на синхронному стані, 1 — на дрифті.
- CI job `api-contract-drift` падає на PR, що змінює controller без regen-у `api.json`.

---

## 4. Workflow D — Bugfix batch

### 4.1 LiqPay copy fix
`src/features/checkout/ui/checkout-form.tsx:108` (а після PR #4 — у `widgets/checkout-form/ui/checkout-form.tsx`):
```diff
- {m.isPending ? "Зʼєднання з WayForPay…" : `Сплатити ${totalUah} ₴`}
+ {m.isPending ? "Перенаправляємо на LiqPay…" : `Сплатити ${totalUah} ₴`}
```

### 4.2 `parentEmailMasked` на UI register-success
Сторінка `src/views/register/` (або `app/(public)/register/page.tsx` — підтвердити в коді).
- Після PR #1 у моделі `RegisterResponse` зʼявиться `parentEmailMasked: string`.
- Структуроване UI:
  ```tsx
  <p>Реєстрація успішна!</p>
  <p>Лист зі згодою надіслано батькам на <strong>{response.parentEmailMasked}</strong>.</p>
  <p className="hint">{response.message}</p>
  ```
- Fallback: якщо `parentEmailMasked` undefined (стара версія BE) — рендерити лише `response.message`.

### 4.3 `delivery` echo на success-page
Сторінка `src/views/checkout-success/`.
- Після PR #1 у моделі `OrderCreationResponse` зʼявиться `delivery: DeliveryRequest | null`.
- Якщо `delivery != null`:
  ```
  Доставка: Нова Пошта · {cityName} · відділення №{branchNumber}, {branchAddress}
  ```
- Не рендерити блок, якщо null (digital-only).

### 4.4 Working tree clean-up
- `git status -s public/` — якщо є `D public/*.docx` / `D public/*.pptx`:
  - Якщо файли більше не потрібні → commit-ом `chore(public): remove unused brand source assets` всередині PR #3.
  - Інакше `git restore public/`.

### 4.5 Acceptance
- 4 окремі коміти у PR #3.
- Vitest для register/success views: assert що `parentEmailMasked` показується, що `delivery` echo блок рендериться при наявному значенні.
- E2E smoke зелений.

---

## 5. Workflow B — Delivery UX (pointer)

**Повна специфікація:** [`2026-05-13-nova-poshta-delivery-design.md`](../../../../lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md) §4 (FE FSD структура), §5.2 (FE тести), §6 (verification).

### 5.1 Integration points цього sprint-у
- Запускати **після PR #1**, бо потребує:
  - `generated/delivery/delivery.ts` (orval-hooks для NP-lookup-ів).
  - `generated/models/deliveryRequest.ts`, `novaPoshtaDetailsRequest.ts`, `novaPoshtaCityDto.ts`, `novaPoshtaBranchDto.ts`.
  - Поле `delivery` у `generated/models/createOrderRequest.ts`.
- Cart store (`entities/cart`) розширюється полем `type: "PHYSICAL" | "DIGITAL"` per item. Цього вимагає `hasPhysical` cross-field rule (delivery-спека §4.3).
- ReCAPTCHA conditional integration:
  - Додати `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` у `src/shared/config/env.ts` (optional).
  - Новий слайс `features/recaptcha/model/use-recaptcha.ts`:
    - Якщо site-key є — динамічно імпортується `https://www.google.com/recaptcha/api.js?render=<KEY>`, експонує `execute(action: string): Promise<string>`.
    - Якщо ні — `execute` повертає `null`. BE з `app.captcha.enabled=false` ігнорує `null`.
  - Викликається у `useCreateOrder` pre-mutation: `const token = await recaptcha.execute("checkout");`.

### 5.2 Error mapping
`src/shared/api/dispatch-problem.ts` додає кейси:
- `urn:l157:delivery/required` → `form.setError("delivery", { message: "Оберіть місто і відділення Нової Пошти" })`.
- `urn:l157:delivery/invalid-ref` → `form.setError("delivery.details", { message: "Обране відділення недоступне. Виберіть інше." })` + `queryClient.invalidateQueries({ queryKey:["np-branches"] })`.
- `urn:l157:delivery/unexpected` → `form.setError("delivery", { message: "Кошик не містить фізичних товарів." })` (це shouldn't happen, але мапимо).
- `urn:l157:captcha/failed` → top-level toast "Не вдалось пройти captcha. Спробуйте ще раз."
- `urn:l157:novaposhta/unavailable` → `<NpUnavailableBanner/>` (delivery-спека §4.5).

### 5.3 Acceptance
- Всі acceptance з delivery-спеки §4-§7.
- Додатково: e2e сценарій `tests/e2e/checkout-physical.spec.ts` мокає `/cities` і `/branches` через MSW, проходить happy path, asserts POST `/orders` має `delivery` block.

---

## 6. Workflow C — Student "Мої продажі"

### 6.1 Route
`src/app/student/orders/page.tsx` — Server Component:
```tsx
import { StudentOrdersPage } from "@/views/student-orders";
export const dynamic = "force-dynamic";  // role-based, не ISR
export default function Page() { return <StudentOrdersPage />; }
```
`src/app/student/orders/loading.tsx` — skeleton.

Edge middleware `src/middleware.ts` уже redirect-ить `/student/*` без `refresh_token` cookie — нічого додавати не треба.

### 6.2 View (`src/views/student-orders`)

```
views/student-orders/
├── ui/
│   ├── orders-page.tsx           # composition root: filters + table + pagination
│   ├── status-filter-chips.tsx   # multi-select chips
│   ├── orders-table.tsx          # rows from useListStudentOrdersQuery
│   └── empty-state.tsx
├── model/
│   └── use-orders-query.ts       # thin wrapper над orval-hook + URL state sync
└── index.ts
```

### 6.3 UX
- **Filter chips:** `Всі` (default) | `PAID` | `FULFILLED` | `DELIVERED` | `REFUNDED` | `DISPUTED`. Multi-select. State у URL search params (`?status=PAID,DELIVERED`).
- **Sort dropdown:** `Дата оплати ↓` (default) | `Дата створення ↓`. Mapping → BE `sort=paidAt,desc` / `sort=createdAt,desc`.
- **Pagination:** prev/next, page size 20 (BE max 50, тримаємо 20).
- **Empty state:** «Поки що жодного продажу. Опубліковані товари з'являться тут після оплати покупцем.»
- **Error state:** `<ErrorBanner/>` + retry.

### 6.4 Таблиця колонок

| Дата оплати | № замовлення | Товар | К-сть | Статус | Сума gross | До виплати NET |

Колонки `gross` / `net` залежать від `StudentOrderItemDto` shape. Після PR #1 перевіримо в orval-моделі. Якщо `netAmount` відсутнє — рендеримо лише gross + інлайн коментар у view "TODO: BE додає netAmount у follow-up", і відкриваємо ticket. У дизайн-acceptance це не блокує.

### 6.5 Тести
- Vitest: `OrdersTable` — render N rows, chip toggle, sort change → reFetch.
- Vitest: URL state — `?status=PAID,DELIVERED` → правильні чіпи активні.
- Playwright e2e: студент-логін → перехід на `/student/orders` → ≥1 рядок (потребує seeded student-fixture).

### 6.6 Acceptance
- `pnpm verify` зелений.
- Ручна перевірка: student-юзер бачить таблицю своїх продажів, фільтри і пагінація працюють, redirects при logout — також.

---

## 7. Cross-cutting

### 7.1 Verification на кожний PR
**FE** (`cd lyceum-157-frontend`):
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test` (vitest unit + integration)
- `pnpm test src/views/student-orders` — швидкий цикл під час дев-у workflow C
- `pnpm e2e --grep @smoke` — e2e smoke
- `pnpm verify` — повний композит перед PR

**BE** для PR #2:
- `./mvnw spotless:apply`
- `./mvnw verify`
- `bash scripts/check-api-contract.sh` локально проти `make up` + `mvn spring-boot:run`

### 7.2 Залежності між workflow-ами
- PR #1 (A) блокує PR #3, #4, #5.
- PR #2 (E) merge-иться першим (не блокує A технічно, але CI guard з PR #2 ловить регресії у наступних).
- PR #4 (B) і PR #5 (C) — паралельні після A.

### 7.3 Rollback strategy
- PR #1: якщо typecheck падає у downstream feature після migrate — revert конкретного файлу і повернути handwritten module тимчасово. Один файл за раз — менший blast radius.
- PR #4: feature-flag не потрібен — delivery-блок рендериться тільки при `hasPhysical`. Якщо UI ламає digital flow — `hasPhysical` гарантовано false → блок не рендериться.

---

## 8. Summary table

| Workflow | PR | Файлів торкаємо | Залежність | Acceptance |
|---|---|---|---|---|
| A regen+migrate | #1 | ~30-40 | none | `pnpm verify` зелений, `modules/` видалено |
| E BACKEND-CHANGES + CI | #2 | ~3 (BE) | none, merge first | CI drift guard fail-on-drift |
| D bugfix batch | #3 | ~6 | A | LiqPay copy, parentEmailMasked, delivery echo, clean tree |
| B delivery UX | #4 | ~15 (per delivery-спека §4) | A | full delivery flow physical cart, 503 banner, e2e green |
| C student orders | #5 | ~8 | A | /student/orders page works |
