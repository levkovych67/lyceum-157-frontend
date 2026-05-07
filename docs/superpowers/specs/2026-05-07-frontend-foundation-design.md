# Frontend Foundation Design — `lyceum-157-frontend`

> **Дата:** 2026-05-07
> **Версія:** 1.0
> **Статус:** approved (потребує user review перед planning)
> **Source-of-truth:** `FRONTEND-API.md` (API контракт), `MASTER-design-spec.md` (візуальна мова)

---

## 0. Контекст і scope

### 0.1 Що ми будуємо

Архітектурний фундамент Next.js + FSD-проєкту `lyceum-157-frontend` для платформи Ліцею №157 (Київ, Оболонь). Платформа — маркетплейс учнівських робіт з ролями Public / Student / Parent / Admin, KYC-флоу батьків через magic-link, S3-upload зображень, 2FA-payouts.

Фундамент має бути **самодостатнім і запускатися** — `pnpm dev` піднімає сайт із паперовим фоном, header-листівкою, всіма UI-атомами в `/_kitchen`, route-stubs усіх 12 сторінок, 8 живими формами які проганяють proти живого беку.

### 0.2 In scope

1. FSD-структура з вирішеною колізією Next App Router.
2. Дизайн-система як код (CSS vars + Tailwind v3 + 3 шрифти + paper-noise + stamp-keyframes).
3. `shared/api` повний HTTP-клієнт (auto-refresh, idempotency, ProblemDetail, RSC server-client).
4. `shared/ui` атоми за MASTER spec (Stamp, Polaroid, PillButton, EditorialLabel, FormField, Sticker, PaperClip, PostageStamp, HandArrow, EditorialDivider, Confetti) + shadcn-themed primitives.
5. Глобальні віджети — Header (top-bar + nav + cart-badge) + Footer-postcard.
6. App-shell провайдери — QueryClient, AuthContext, Toaster.
7. RBAC middleware-skeleton + role-precise layouts.
8. Cart Zustand+persist store з cart-item revalidation contract.
9. 12 route-stubs (кожен path існує, рендериться editorial placeholder).
10. 8 живих форм: LoginForm, RegisterForm, CheckoutForm, KycSubmitForm, CreateProductForm, RejectProductForm, RefundForm, PayoutExecuteForm.
11. `useUploadProductImage` hook (без widget UI).
12. Render-стратегія per-route (SSG/ISR/RSC/CSR матриця, sitemap, robots).
13. Error/404 paper-pages.
14. Verify-pipeline (typecheck + lint + test + build + smoke Playwright).

### 0.3 Out of scope (наступні брейнштормами)

- Editorial-полірування 12 сторінок (heroes, photo-interludes, manifesto, marquee, gallery walls).
- UploadDropzone widget (UX drag&drop, multi-file, reorder, primary-toggle).
- Аналітика, Sentry, real cookie-banner.
- i18n-фреймворк (поки uk-only через t()-helper з mapping).
- Search/filter UI поверх каталогу.
- Easter-egg модалка випусків 1-47.

### 0.4 Кластери для майбутніх брейнштормів

1. **Public catalog cluster:** Home, Catalog, Product detail, Author profile, Collections, About, Contacts.
2. **Checkout cluster:** Cart, Checkout, Success, Failure (editorial polish + edge cases).
3. **Auth cluster:** Login, Register, Parent KYC, Card update (paper postcard UX).
4. **Student cluster:** Dashboard, products list/new/edit, finance + UploadDropzone widget.
5. **Admin cluster:** Dashboard, 2FA, products review, orders, payouts (з 2FA UX), tax report download.

---

## 1. Технологічні рішення

| Слот | Вибір | Чому |
|---|---|---|
| Framework | **Next.js 14.2 App Router** | Дефолт для нових проєктів, RSC + ISR + Server Actions |
| Mode | **TypeScript strict** | Безпека за замовчуванням |
| Package manager | **pnpm** | Швидкість, workspace-ready |
| Styling | **Tailwind v3 + CSS vars** | Стабільний (vs v4), CSS vars читаються з MASTER spec токенів через `theme.extend` |
| Architecture | **FSD** з ренеймом FSD `app/` → `_app/` | Уникає колізії з Next routing-folder |
| Routing | **Next App Router у `src/app/`** | Тонкі page.tsx, композиція з `pages/` FSD-screens |
| Public read data | **RSC + ISR** (`revalidate`, `tags`) | Безкоштовно дзеркаль Redis-кешу беку на edge |
| Role-based / mutations | **TanStack Query v5** | Auto-refresh, abort, retry, single-flight, optimistic |
| Forms | **react-hook-form + Zod** (zodResolver) | Native + spec-Zod-схеми 1-в-1 |
| UI primitives | **shadcn/ui (heavy themed)** на Radix | a11y вирішено, paper-aesthetic через override |
| Auth state | **Context + module-level token holder** + useSyncExternalStore | API-client читає sync, React реактивно |
| Cart state | **Zustand + persist** | Селектори, persist localStorage, cross-route survive |
| Idempotency | **sessionStorage** | Той самий ключ для retry із тим самим body |
| Animations | **CSS keyframes + IntersectionObserver** | Stamp-drop, scroll-reveal — без бібліотек |
| Toasts | **Sonner** з paper-style override | shadcn-сумісно |
| Tests | **Vitest + RTL + Playwright (smoke)** | Unit + component + e2e через одну команду |
| Mocking | **MSW** | Component tests з API-mocks |
| Lint | **ESLint + eslint-plugin-boundaries** | Enforce FSD-шарів |
| Format | **Prettier** | |
| Money math | **decimal.js** через `shared/lib/money.ts` | Bek шле BigDecimal-strings |
| i18n | **uk-only без фреймворку**, реєстр у `shared/i18n/uk.ts` | Мінімум boilerplate сьогодні |

---

## 2. FSD-структура

```
lyceum-157-frontend/
├── src/
│   ├── app/                          ← Next App Router (routing only, тонкі page.tsx)
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              ← "/" → renders <HomeScreen/>
│   │   │   ├── catalog/page.tsx
│   │   │   ├── p/[slug]/page.tsx
│   │   │   ├── authors/[id]/page.tsx
│   │   │   ├── collections/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   ├── cart/page.tsx
│   │   │   ├── checkout/page.tsx
│   │   │   ├── checkout/success/page.tsx
│   │   │   ├── checkout/failure/page.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── parent/
│   │   │   ├── layout.tsx            ← noindex, force-dynamic, bg-warm
│   │   │   ├── kyc/[token]/page.tsx
│   │   │   └── card-update/[token]/page.tsx
│   │   ├── student/
│   │   │   ├── layout.tsx            ← role-gate STUDENT
│   │   │   ├── page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/edit/page.tsx
│   │   │   └── finance/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx            ← role-gate ADMIN
│   │   │   ├── page.tsx
│   │   │   ├── 2fa/page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   ├── payouts/page.tsx
│   │   │   └── reports/tax/page.tsx
│   │   ├── account/page.tsx
│   │   ├── _kitchen/page.tsx         ← dev-only
│   │   ├── api/
│   │   │   └── revalidate/route.ts   ← internal POST /api/revalidate
│   │   ├── layout.tsx                ← root: html/body/fonts/providers
│   │   ├── globals.css
│   │   ├── error.tsx                 ← global ErrorBoundary, paper 500
│   │   ├── not-found.tsx             ← paper 404
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── _app/                         ← FSD app-layer (renamed)
│   │   ├── providers/{query,auth,toast,index}.tsx
│   │   ├── styles/{globals,tokens,paper-noise,stamps,paper-cursor}.css
│   │   ├── fonts.ts                  ← next/font/google
│   │   └── middleware.ts
│   │
│   ├── processes/
│   │   ├── auth-bootstrap/           ← silent refresh on app boot
│   │   └── checkout-flow/            ← cart → form → POST /orders → LiqPay
│   │
│   ├── pages/                        ← FSD-pages (screens) — composes widgets
│   │   ├── home/, catalog/, product-detail/, author-profile/,
│   │   ├── collections/, about/, contacts/,
│   │   ├── cart/, checkout/, checkout-success/, checkout-failure/,
│   │   ├── login/, register/, account/,
│   │   ├── parent-kyc/, parent-card-update/,
│   │   ├── student-dashboard/, student-products/, student-product-new/,
│   │   ├── student-product-edit/, student-finance/,
│   │   ├── admin-dashboard/, admin-2fa/, admin-products/,
│   │   ├── admin-order/, admin-payouts/, admin-tax-report/,
│   │   └── kitchen/
│   │
│   ├── widgets/
│   │   ├── header/                   ← top-bar + nav + cart-badge (sticky scroll)
│   │   ├── footer/                   ← postcard footer
│   │   ├── cart-mini-popover/
│   │   ├── product-card/
│   │   ├── product-grid/
│   │   ├── stamp-decoration-row/
│   │   └── editorial-page-shell/
│   │
│   ├── features/                     ← user actions
│   │   ├── auth/                     ← login, register, logout
│   │   ├── cart/                     ← add/remove/update + store
│   │   ├── checkout/                 ← checkout-form + cart-revalidator
│   │   ├── kyc-submit/, kyc-card-update/,
│   │   ├── product-create/, product-edit/,
│   │   ├── product-image-upload/     ← hook only
│   │   ├── product-submit-for-review/, product-hide-unhide/, product-delete/,
│   │   ├── admin-product-approve/, admin-product-reject/,
│   │   ├── admin-order-refund/,
│   │   ├── admin-2fa-enroll/, admin-2fa-verify/,
│   │   ├── admin-payout-execute/,
│   │   ├── admin-tax-report-download/,
│   │   └── account-delete/
│   │
│   ├── entities/
│   │   ├── user/, product/, cart/, order/, kyc/,
│   │   ├── student-finance/, admin-product/, payout/
│   │   └── (each: model/types.ts, api/queries.ts, ui/<presentational>.tsx)
│   │
│   └── shared/
│       ├── api/{client,server-client,auth-token,refresh,idempotency,
│       │       errors,error-messages,api-error-to-form,constants,upload-s3}.ts
│       ├── api/modules/{auth,catalog,orders,kyc,student,users,admin}.ts
│       ├── ui/                       ← атоми (повний список — Розділ 4)
│       ├── lib/{money,cn,date,reduced-motion,hash}.ts
│       ├── lib/forms/use-app-form.ts
│       ├── hooks/{use-intersection,use-stamp-drop,use-paper-cursor,use-disclosure,
│       │         use-scroll-to-first-error}.ts
│       ├── i18n/uk.ts                ← string registry
│       └── config/{env,routes}.ts
│
├── public/
│   ├── textures/{paper-noise.svg, film-grain-1024.png}
│   ├── illustrations/school-building.svg
│   ├── stamps/, icons/
│
├── tests/
│   ├── unit/, component/, e2e/
│
├── .claude/{settings.json, CLAUDE.md}
├── tailwind.config.ts, postcss.config.mjs, next.config.mjs
├── tsconfig.json (strict, paths "@/*" → "./src/*")
├── package.json, vitest.config.ts, playwright.config.ts
├── .eslintrc.cjs (+ plugin-boundaries), .prettierrc
└── README.md
```

### 2.1 FSD-правила (enforced ESLint-плагіном)

- Шари йдуть зверху-вниз: `app → processes → pages → widgets → features → entities → shared`. Імпорт «вгору» заборонений.
- Слайси одного шару НЕ імпортують один одного напряму (тільки через public API `index.ts` сусіднього шару нижче). Виняток: `entities/<a>` може використати `entities/<b>` тільки через `shared`.
- `app/` Next-folder імпортує з усього `src/`, але **тільки** через index.ts слайсу.

### 2.2 Чому `pages/` (FSD) існує паралельно з Next-`app/`

Next `app/page.tsx` — тонкий: робить server-side fetch (RSC), потім імпортує `<HomeScreen/>` з `pages/home`. Це screen-component на client/server boundary, з усією композицією widgets/features. Це дає переваги: переносимо routing-агностичну композицію в FSD-структуру, легко тестується, не залежить від Next-routing.

---

## 3. Дизайн-токени як код

### 3.1 `src/_app/styles/tokens.css`

Буквальний transcription з MASTER spec §2.1–2.5. Кольори, spacing 12-step, radii, shadows (теплі бордові, не чорні), easings (включно з `--ease-stamp`), durations.

```css
:root {
  /* Brand */
  --c-burgundy: #6e273d;       --c-burgundy-deep: #4d1a2a;     --c-burgundy-soft: #f5e6ea;
  --c-green: #0c6633;          --c-green-deep: #00662a;        --c-green-soft: #d8e6dc;
  /* Surfaces */
  --c-bg: #fafaf7;             --c-bg-warm: #f3ead6;           --c-bg-card: #ffffff;
  --c-bg-yellow: #fef3c7;      --c-bg-blue: #dbeafe;           --c-bg-noir: #1a1612;
  /* Ink */
  --c-ink: #1e1e1e;            --c-ink-soft: #6b6b6b;          --c-ink-fade: #a8a8a8;
  --c-line: #ececec;           --c-line-strong: #c9c0b3;
  /* Functional */
  --c-link: #1e73be;           --c-stamp: #6e273d;             --c-error: #b03030;

  /* Spacing */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-5: 24px;  --s-6: 32px;  --s-7: 48px;  --s-8: 64px;
  --s-9: 96px;  --s-10: 120px; --s-11: 160px; --s-12: 200px;

  --container-max: 1280px;
  --container-pad: 24px;
  --container-pad-mob: 20px;

  /* Radii */
  --r-sm: 6px;   --r-md: 12px;   --r-lg: 20px;   --r-pill: 999px;

  /* Shadows — теплі бордові, не чорні */
  --sh-paper: 0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(110,39,61,0.06);
  --sh-lift:  0 8px 32px rgba(110,39,61,0.12);
  --sh-photo: 0 12px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10);
  --sh-deep:  0 32px 64px rgba(0,0,0,0.24);

  /* Easings */
  --ease-paper:  cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-quart:  cubic-bezier(0.25, 1, 0.5, 1);
  --ease-stamp:  cubic-bezier(0.5, -0.6, 0.5, 1.6);

  /* Durations */
  --d-1: 120ms; --d-2: 200ms; --d-3: 280ms;
  --d-4: 480ms; --d-5: 800ms; --d-6: 1200ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --d-1: 1ms; --d-2: 1ms; --d-3: 1ms;
    --d-4: 200ms; --d-5: 200ms; --d-6: 200ms;
  }
}
```

### 3.2 Шрифти (`src/_app/fonts.ts`)

Fraunces (display з opsz/SOFT/WONK), Manrope (body), Caveat (hand) — всі через `next/font/google` з cyrillic subset. У `tokens.css` робимо semantic alias `--f-display/--f-body/--f-hand` поверх `--f-*-raw`.

### 3.3 Tailwind config

`tailwind.config.ts` extends читає всі токени через `var(--...)`. fontSize має `clamp()` для responsive. keyframes `stamp-drop` і `page-turn` декларовані тут.

### 3.4 Paper-noise (must-have)

`body::before` з SVG turbulence (256×256 tile), bordeaux-tinted feColorMatrix, opacity 0.04, mix-blend-mode multiply, pointer-events none, z-index 1.
`.photo-grainy::after` — film-grain overlay для ч/б фото.
`.surface-warm-grainy` — посилена текстура для postcard back / sticker note.

### 3.5 Stamp animation

Keyframes у Tailwind. Окремі класи: `[data-smudge="true"]` дає ink-smudge after-pseudo, `[data-trail="true"]` — shadow trail під час падіння.

### 3.6 Custom cursor

CSS-only через `cursor: url(...)`. Hover-states через `data-cursor="zoom|arrow|drag"`. Touch — вимкнено.

### 3.7 Verification

`/_kitchen/page.tsx` рендерить «Token sheet» — всі кольори, шрифти, spacing, shadows, easing, paper-noise toggle, stamp playground. Дозволяє візуальну regression-перевірку без e2e.

---

## 4. Атоми `shared/ui` (повний інвентар)

Кожен — окрема папка з `index.ts`, `<name>.tsx`, опц. test.

| Атом | Призначення | Ключові props |
|---|---|---|
| **Stamp** | Печатка з turbulence-displacement + stamp-drop | text (union literal з MASTER §3.1), shape, size, rotation discrete, color, animateOn, smudge, trail, delayMs, onClick |
| **Polaroid** | Фото з білою рамкою + caption + rotation | src, caption, rotation discrete, ratio, paperClip, hoverInteractive |
| **PhotoPrint** | Фото без рамки, з grain overlay | src, ratio, paperClip, grainy |
| **PaperClip** | Декоративна металева кліпса | position tl/tr, rotation |
| **PillButton** | 4 варіанти (primary, outline-d, outline-l, ghost) × 4 розміри | variant, size, asChild, loading, startIcon, endIcon |
| **EditorialLabel** | Manrope 700 11px UPPERCASE з ▌ префіксом | color (green/burgundy/white), as |
| **EditorialDivider** | 4 варіанти: dashed, stamp-line, number, marks | variant, number? |
| **FormField** | Wrapper з label НАД полем, error, hint | label, hint, error, required, htmlFor, children |
| **Sticker** | Жовтий/блакитний з tilt-into-place animation | color, rotation, signature, children |
| **PostageStamp** | Зубчаста марка з гербом | size? |
| **HandArrow** | SVG-стрілки «олівцем» з drawOnReveal | dir, size, color, drawOnReveal |
| **MuseumLabel** | Композитний presentational, ширина 220 | title, author, meta, price |
| **Confetti** | Paper-cut трикутники replacement | count, trigger, onDone |
| **Container, Section, Stack, Row, Grid** | Layout primitives | tone, pad, gap, align, justify |

### 4.1 Shadcn-themed primitives (`shared/ui/`)

`Dialog, Sheet, Popover, Select, Tabs, Tooltip, DropdownMenu, RadioGroup, Switch, Checkbox, Toast (Sonner), Alert` — всі themed: --radius → var(--r-md), focus-ring 2px burgundy, font Manrope, padding через наші токени, z-index toast нижче paper-noise overlay.

### 4.2 Stamp text type (TS-enforced)

```ts
export type StampText =
  | "АРХІВ ЛІЦЕЮ 157" | "MAYSTERNYA · KYIV · 1957" | "СХВАЛЕНО КУРАТОРОМ"
  | "ЛІМІТОВАНА СЕРІЯ" | "ПЕРЕДАНО З ОБОЛОНІ" | "EST. 1957"
  | "ВРУЧЕНО" | "ВІДКРИТО" | "#listy" | "ВИПУСК ПОШКОДЖЕНО"
  | "🔐 АДМІН-ВЕРИФІКАЦІЯ" | "✓ ВІРНО";
```

Спроба передати інший текст → TS error. Це enforce-ить правило MASTER §3.1.

---

## 5. Інфраструктура `shared/api`

### 5.1 Файлова мапа

```
shared/api/
├── constants.ts (API_BASE, TTLs, REFRESH_PROACTIVE_MS=60_000)
├── auth-token.ts (module-level holder + pub/sub)
├── errors.ts (ApiError, ProblemDetail)
├── error-messages.ts (uk localization map)
├── api-error-to-form.ts (invalidParams → RHF setError)
├── idempotency.ts (sessionStorage key store)
├── refresh.ts (single-flight tryRefresh)
├── client.ts (api<T>() — browser)
├── server-client.ts (serverApi<T>() — RSC, з cookies())
├── upload-s3.ts (XHR-based uploadToS3 з progress + abort)
└── modules/{auth,catalog,orders,kyc,student,users,admin}.ts
```

### 5.2 Контракти

- **`getAccessToken()`** — sync read для api-client.
- **`setSnapshot(s)`** — auth-mutations call це після login/refresh.
- **`subscribe(fn)`** — для useSyncExternalStore.
- **`tryRefresh(): Promise<boolean>`** — single-flight, кеш inflight.
- **`api<T>(path, opts)`** — auto-Bearer, auto-Idempotency-Key на mutating, auto-401-retry-once-after-refresh, ApiError throw на не-ok, 204 → undefined, CSV stream → res.body.
- **`serverApi<T>(path, init)`** — RSC варіант з `cookies()` forwarding + `next.revalidate/tags`.
- **`getOrCreateIdemKey(scope, body)`** — sessionStorage-backed.
- **`applyApiErrorToForm(err, setError): boolean`** — true якщо validation мапилось, false для інших ApiError.
- **`messageFor(err): string`** — uk-text fallback.

### 5.3 TanStack QueryClient defaults

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: (count, err) =>
        err instanceof ApiError ? err.isTransient && count < 2 : count < 1,
      retryDelay: (a) => Math.min(1000 * 2 ** a, 8000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
      onError: (err) => {
        if (err instanceof ApiError && !err.isValidation) toast.error(messageFor(err));
      },
    },
  },
});
```

Query-keys стандарт: `["catalog","list",{params}]`, `["product","bySlug",slug]`, `["student","finance","summary"]`, `["admin","products",{status,page}]`, тощо.

---

## 6. App-shell, providers, RBAC, layouts

### 6.1 Root `app/layout.tsx`

`<html lang="uk">` + fonts variables. body class `bg-bg text-ink font-body antialiased`. `<AppProviders>` обгортає children.

### 6.2 `_app/providers/index.tsx`

```
<QueryProvider>
  <AuthProvider>
    <AuthBootstrap/>          ← runs once on mount: tryRefresh()
    <ToastProvider>
      {children}
    </ToastProvider>
  </AuthProvider>
</QueryProvider>
```

### 6.3 AuthProvider

- `useSyncExternalStore(subscribe, getSnapshot, () => null)` — реактивна підписка.
- Listen `auth:logout-required` event від api-client → setSnapshot(null) → redirect /login.
- Proactive refresh — setTimeout за `REFRESH_PROACTIVE_MS` до expiry.
- Exposes `useAuth(): { user, role, isAuthenticated, logout }`.

### 6.4 AuthBootstrap process

`useEffect`-once: `tryRefresh()` (HttpOnly cookie невидиме → тригеримо завжди, refresh сам впорається з 401).

### 6.5 `middleware.ts` (Next Edge)

- `parent/*` — додає `X-Robots-Tag: noindex, nofollow` + no-cache headers.
- `student/*`, `admin/*`, `account` — coarse cookie-check (`refresh_token` присутній?). Якщо ні → redirect `/login?from=...`.
- Точна role-перевірка — у layout (бо middleware не бачить role).

### 6.6 Role layouts (`app/student/layout.tsx`, `app/admin/layout.tsx`)

Client-component layout: `useAuth()` → якщо `!isAuthenticated || role !== "STUDENT"` → router.replace + RoleGateSplash. Якщо ok → `<RoleSectionShell role>{children}</RoleSectionShell>`.

### 6.7 Public layout

Header-public + main + Footer-postcard. min-h-[calc(100vh-124px)].

### 6.8 Parent layout

`force-dynamic`, bg-warm, без header/footer, `<Container narrow>`.

### 6.9 Error/404 paper-pages

`app/error.tsx` — Stamp «ВИПУСК ПОШКОДЖЕНО», display title, lead, PillButton reset.
`app/not-found.tsx` — Stamp «EST. 1957», EditorialLabel «▌ СТОРІНКА №404», display title, link до головної.

### 6.10 Page-stub pattern

```tsx
// app/(public)/catalog/page.tsx
import { CatalogScreen } from "@/pages/catalog";
export const metadata = { title: "Каталог" };
export const revalidate = 300;

export default async function Page({ searchParams }) {
  const data = await serverApi("/products", { revalidate: 300, tags: ["catalog"] });
  return <CatalogScreen initialData={data} />;
}
```

`pages/catalog/ui/catalog-screen.tsx` рендерить editorial shell + `<PageStubBanner cluster="public-catalog"/>` (dev-only жовтий стікер «🚧 Цю сторінку буде полірувати в брейнштормі «public-catalog»»).

### 6.11 Sticky header behaviour

`useScroll`-based: scrollY > 200 → `data-collapsed=true` → top-bar hidden, header height 88 → 64.

---

## 7. Render-стратегія

### 7.1 Per-route матриця

| Route | Render | Strategy |
|---|---|---|
| `/` | SSG + ISR 300s | RSC fetch топ-сторінки каталогу + featured collection |
| `/catalog` | ISR 300s, dynamic searchParams | `tags: ["catalog"]` |
| `/p/[slug]` | SSG + ISR 600s, generateStaticParams топ-100 | `tags: [`product:${slug}`]` |
| `/authors/[id]` | ISR 600s | без generateStaticParams (велика кардинальність) |
| `/collections` | SSG + ISR 3600s | змінюється рідко |
| `/about`, `/contacts` | force-static | без fetch (MDX/markdown content) |
| `/cart` | CSR-only | Zustand-persist |
| `/checkout` | force-dynamic | sensitive |
| `/checkout/{success,failure}` | SSR no-store | per-request |
| `/login`, `/register` | SSG + CSR form | shell static |
| `/parent/kyc/[token]` | force-dynamic + noindex | sensitive magic-link |
| `/parent/card-update/[token]` | force-dynamic + noindex | те саме |
| `/student/*` | CSR-only | per-user, Bearer-token |
| `/admin/*` | CSR-only | per-user + 2FA |
| `/account` | CSR-only | per-user |

### 7.2 Tag-based revalidation

| Подія | Tags інвалідуємо |
|---|---|
| Admin approve/reject | `["catalog", "product:<slug>"]` |
| Student hide/unhide | `["catalog", "product:<slug>"]` |
| Order created | `["product:<slug>"]` для кожного item |

`app/api/revalidate/route.ts` — internal POST, на MVP відкритий + middleware rate-limit (50/min/IP). У admin-кластері перенесемо на Server Actions.

### 7.3 next.config.mjs

`headers()` — `/parent/*` → noindex+nostore, `/textures|stamps|illustrations|fonts/*` → max-age=31536000 immutable.
`images.remotePatterns` — S3 + CDN.

### 7.4 generateMetadata для `/p/[slug]`

RSC fetch product → returns title + description (HTML stripped, slice 160) + openGraph.images.

### 7.5 sitemap.ts + robots.ts

sitemap включає public routes + всі products (page=0, size=1000). robots disallow `/parent/, /student/, /admin/, /account, /_kitchen, /api/`.

---

## 8. 8 живих форм

### 8.1 Спільний паттерн через `useAppForm`

```ts
// shared/lib/forms/use-app-form.ts
export function useAppForm<S extends z.ZodType>(opts: {
  schema: S;
  defaultValues: z.input<S>;
  onSubmit: (data: z.output<S>) => Promise<void> | void;
}) {
  const form = useForm<z.input<S>>({
    resolver: zodResolver(opts.schema),
    defaultValues: opts.defaultValues,
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    criteriaMode: "all",
  });

  useScrollToFirstError(form.formState.errors, form.formState.isSubmitted);

  const handleSubmit = form.handleSubmit(
    async (data) => {
      try { await opts.onSubmit(data as z.output<S>); }
      catch (e) { if (!applyApiErrorToForm(e, form.setError)) throw e; }
    },
    () => { toast.error("Перевірте форму — є незаповнені поля"); },
  );

  return { ...form, handleSubmit };
}
```

### 8.2 Scroll-to-first-error

```ts
// shared/hooks/use-scroll-to-first-error.ts
const HEADER_OFFSET = 120;
export function useScrollToFirstError(errors, isSubmitted) {
  useEffect(() => {
    if (!isSubmitted) return;
    const firstName = Object.keys(errors)[0];
    if (!firstName) return;
    const el = document.querySelector<HTMLElement>(`[name="${firstName}"], #field-${firstName}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  }, [isSubmitted, JSON.stringify(errors)]);
}
```

### 8.3 FormErrorSummary (для довгих форм, ≥3 помилок)

Top-of-form banner з clickable anchors на конкретні поля. Animation `stamp-drop` з `--final-rotation: 0deg`. Використовується в RegisterForm, KycSubmitForm, CreateProductForm.

### 8.4 FormField з anchors

Враппер має `id={`field-${name}`}` + label `htmlFor` + input `aria-invalid`/`aria-describedby` коли error.

### 8.5 Перелік 8 форм

| Form | Schema | Mutation | Special UX |
|---|---|---|---|
| **LoginForm** | email, password | authApi.login → setSnapshot → redirect from? | 401 → setError password «Неправильний email або пароль» |
| **RegisterForm** | email, password, firstName, lastName, grade (regex 9-А), parentEmail (refine ≠ email) | authApi.register | 409 → setError email; success → magic-postcard «Лист надіслано» |
| **CheckoutForm** | buyerEmail, buyerName, buyerPhone (+380 mask) | pre-flight cart-revalidate → ordersApi.create з idemKey → redirect paymentUrl | 409 stock → inline alert + force re-revalidate |
| **KycSubmitForm** | parentName, parentRnokpp (10), payoutCard (Luhn 13–19) | kycApi.submit(token) → redirect Vchasno | bg-warm + sticker «КОНФІДЕНЦІЙНО» |
| **CreateProductForm** | title, description, priceUah (50–50000), type, stockQty (refine PHYSICAL>0) | studentApi.products.create → router.push edit | 409 KYC not approved → info-page |
| **RejectProductForm** | reason (10–500) | adminApi.products.reject → revalidateOnClient | modal-form |
| **RefundForm** | reason (5–500) | adminApi.orders.refund | hard-confirm checkbox перед enable |
| **PayoutExecuteForm** | payoutIds (1–200) + TOTP code (6/8 digits) | adminApi.payouts.execute з X-TOTP-Code | TotpVerifyModal two-step, 401 → setError code |

### 8.6 Spільні form-helpers

`shared/ui/form/`: `<Form>, <FormRow cols>, <FormFooter>, <FormError>, <FormSection>` для уніфікованої верстки.

---

## 9. Verify pipeline

### 9.1 `package.json` scripts

```json
"scripts": {
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "lint": "next lint && eslint . --ext .ts,.tsx --max-warnings 0",
  "format": "prettier --write \"src/**/*.{ts,tsx,css,json,md}\"",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:cov": "vitest run --coverage",
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "verify": "pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e -- --grep @smoke"
}
```

### 9.2 `.claude/settings.json`

Stop-hook ганяє `pnpm verify` після кожної задачі. Allowlist для pnpm/git read commands.

### 9.3 `.claude/CLAUDE.md`

Містить Stack, Архітектуру, Дані, Дизайн-систему, Форми, **Verification** секцію (типу як з глобального CLAUDE.md), Команди, Поза-проєктна довідка, Що НЕ робити.

### 9.4 Структура тестів

```
tests/
├── unit/
│   ├── api/{client,refresh,idempotency,api-error-to-form,error-messages}.test.ts
│   ├── lib/{money,cn}.test.ts
│   └── stores/{cart-store,auth-token}.test.ts
├── component/
│   ├── atoms/{stamp,pill-button,form-field,editorial-label}.test.tsx
│   ├── forms/{login,register,checkout,kyc-submit,create-product,reject,refund,payout-execute}-form.test.tsx
│   └── widgets/{header,cart-mini-popover}.test.tsx
└── e2e/
    ├── smoke.spec.ts                @smoke
    ├── public-routes.spec.ts        @smoke
    ├── role-redirects.spec.ts       @smoke
    └── form-error-ux.spec.ts        @smoke
```

MSW для component-tests з API-mocks.

### 9.5 Playwright smoke-spec мінімум

- `/` рендериться, paper-noise body::before opacity = 0.04.
- кожен public route → 200, `<h1>` exists.
- `/student` без cookie → redirect /login.
- `/parent/kyc/x` → header `X-Robots-Tag: noindex, nofollow`.
- `/login` submit empty → email focused, viewport scrolled.

### 9.6 ESLint FSD-boundaries

`.eslintrc.cjs` додає `eslint-plugin-boundaries`:

```js
{
  "boundaries/elements": [
    { type: "app",       pattern: "src/app/*" },
    { type: "_app",      pattern: "src/_app/*" },
    { type: "processes", pattern: "src/processes/*" },
    { type: "pages",     pattern: "src/pages/*" },
    { type: "widgets",   pattern: "src/widgets/*" },
    { type: "features",  pattern: "src/features/*" },
    { type: "entities",  pattern: "src/entities/*" },
    { type: "shared",    pattern: "src/shared/*" },
  ],
  "boundaries/rules": [
    { from: "app",       allow: ["_app", "processes", "pages", "widgets", "features", "entities", "shared"] },
    { from: "processes", allow: ["pages", "widgets", "features", "entities", "shared"] },
    { from: "pages",     allow: ["widgets", "features", "entities", "shared"] },
    { from: "widgets",   allow: ["features", "entities", "shared"] },
    { from: "features",  allow: ["entities", "shared"] },
    { from: "entities",  allow: ["shared"] },
    { from: "shared",    allow: [] },
  ]
}
```

### 9.7 Husky / lint-staged

Pre-commit: lint-staged (eslint+prettier на staged-files). Pre-push: `pnpm typecheck`.

### 9.8 README.md

Розділи: Stack · Quick start · FSD-структура · Скрипти · Tests · Дизайн-система link · API link · Conventions.

---

## 10. Прийняті обмеження і відомі компроміси

1. **`/api/revalidate` — open route з rate-limit**, не secret-protected (browser side може лише без secret). У admin-кластері перенесемо на Server Actions де можна secret з env.
2. **uk-only без i18n-фреймворку** — string registry в `shared/i18n/uk.ts`. Якщо додасться EN — refactor до next-intl.
3. **Image upload widget** відкладено — є тільки `useUploadProductImage` hook.
4. **PageStubBanner** — dev-only маркер, у prod NODE_ENV приховано.
5. **Cart revalidation** — pre-flight перед /cart і /checkout (один запит на product), не realtime.
6. **Magic-link KYC pages** — bg-warm shell, без editorial polish (полірується в auth-кластері).
7. **No analytics, no Sentry** на цьому етапі.

---

## 11. Готовність до планування

Всі 9 секцій узгоджені з користувачем. Цей spec є джерелом правди для наступного step — детального implementation plan через `writing-plans` skill.

План очікувано буде розбитий на phases:

1. **Phase 0 — Bootstrap:** pnpm init, Next-template, TS strict, Tailwind config з токенами, ESLint+boundaries, Prettier, Husky.
2. **Phase 1 — Tokens + atoms:** CSS tokens, fonts, paper-noise, stamps, atoms 1-by-1, /_kitchen showcase.
3. **Phase 2 — API infra:** shared/api все.
4. **Phase 3 — Providers + middleware:** Query, Auth, Toast, RBAC middleware, role layouts.
5. **Phase 4 — Stores + global widgets:** cart-store, header, footer-postcard.
6. **Phase 5 — Route stubs:** 12 page-stubs з editorial placeholder.
7. **Phase 6 — Forms:** useAppForm + 8 forms.
8. **Phase 7 — Render strategy:** ISR/sitemap/robots/revalidate route.
9. **Phase 8 — Verify pipeline:** tests, scripts, CLAUDE.md, hooks.

Кожна phase має review-checkpoint.
