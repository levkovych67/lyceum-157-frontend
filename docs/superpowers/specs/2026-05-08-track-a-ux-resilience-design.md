# Track A — UX Resilience (Loading + Error Boundaries + Cookie Banner + Legal Stubs + blurDataURL prop)

**Дата:** 2026-05-08
**Скоп:** Track A з декомпозиції UX/Polish ініціативи. Tracks B (Legal Content) та C (Animations + Image Pipeline + E2E hardening) — окремими циклами.

## 1. Контекст і мотивація

Проєкт без `loading.tsx` файлів — кожен API-fetch на роутах catalog / cabinets дає білий екран до моменту RSC-готовності. Granular error boundaries відсутні (є лише кореневий `app/error.tsx`) — крах одного widget'у валить усю сторінку. Cookie banner / Privacy / Terms відсутні — блокер для підключення WayForPay та інших платіжок. `next.config.mjs` має `images.unoptimized: true` (свідоме рішення в комміті c244375), що блокує Next-вбудовану blur-генерацію — тож blur йде через окремий sharp pre-build pipeline у Track C; Track A лише розкриває `blurDataURL` prop.

## 2. Зовнішній скоп

**В Track A:**
1. `loading.tsx` файли по route segments з editorial-skeleton primitive
2. Granular error boundaries (segment-level + widget-level)
3. Cookie banner (dismiss-only, тонка стрічка)
4. Stub-сторінки `/privacy` та `/terms` (placeholder Stamp + контактний email)
5. `blurDataURL?` prop в `ImageSlot` та `Polaroid` (інтерфейс без генерації)

**НЕ в Track A:**
- Реальні юридичні тексти Privacy/ToS (Track B)
- Sharp WebP/blur pipeline (Track C — **WebP only, no AVIF** — див. project memory)
- Реалізація String Carousel widget (Track C)
- Paper Noise tuning з реальних моніторів (Track C)
- E2E checkout / 2FA payouts hardening (Track C)
- Sentry/observability інтеграція

## 3. Архітектура (FSD layers)

```
src/
├─ shared/
│  ├─ ui/
│  │  ├─ paper-skeleton/
│  │  │  ├─ paper-skeleton.tsx          // base + variants: Grid, Form, Profile, Article, Page
│  │  │  └─ paper-skeleton.test.tsx
│  │  └─ error-boundary/
│  │     ├─ widget-error-boundary.tsx   // wrapper around react-error-boundary
│  │     ├─ widget-error-fallback.tsx   // shared visual (Stamp "ВІДБИТОК ЗМАЗАВСЯ")
│  │     └─ widget-error-boundary.test.tsx
│  ├─ lib/
│  │  └─ consent/
│  │     ├─ consent.ts                   // getConsentDismissed / setConsentDismissed
│  │     ├─ use-consent.ts               // React hook
│  │     └─ consent.test.ts
│  └─ i18n/uk.ts                         // нові секції: cookies, legal
├─ widgets/
│  └─ cookie-banner/
│     ├─ cookie-banner.tsx               // mounted в root layout
│     └─ cookie-banner.test.tsx
└─ app/
   ├─ loading.tsx                        // root fallback (PaperSkeletonPage)
   ├─ (public)/
   │  ├─ loading.tsx
   │  ├─ error.tsx
   │  ├─ catalog/loading.tsx             // PaperSkeletonGrid
   │  ├─ collections/loading.tsx         // PaperSkeletonGrid
   │  ├─ p/[slug]/loading.tsx            // PaperSkeletonArticle
   │  ├─ login/loading.tsx               // PaperSkeletonForm
   │  ├─ register/loading.tsx            // PaperSkeletonForm
   │  ├─ cart/loading.tsx                // PaperSkeletonForm
   │  ├─ checkout/loading.tsx            // PaperSkeletonForm
   │  ├─ privacy/page.tsx                // STUB
   │  └─ terms/page.tsx                  // STUB
   ├─ account/{loading,error}.tsx
   ├─ student/{loading,error}.tsx
   ├─ admin/{loading,error}.tsx
   └─ parent/{loading,error}.tsx
```

**Нова dev-залежність:** `react-error-boundary` (~4kb gzipped).

**ESLint-boundaries (.eslintrc.cjs):** дозволяють `widgets → shared/{ui,lib,i18n}` та `app → widgets`. Нові імпорти не порушують FSD.

## 4. `<PaperSkeleton/>` — Loading primitive

### 4.1 Базовий API

```ts
// shared/ui/paper-skeleton/paper-skeleton.tsx
type PaperSkeletonProps = {
  variant?: "block" | "line" | "circle";
  width?: string | number;
  height?: string | number;
  ratio?: "4/5" | "1/1" | "16/9" | "3/4";
  className?: string;
};
```

### 4.2 Візуальна мова

- Punктирна рамка `border-2 border-dashed border-burgundy/40` на фоні `bg-bg-warm` з paper-noise
- БЕЗ shimmer-градієнта (суворо редакційно — стилістично узгоджено з існуючим `placeholderRingByVariant` в `ImageSlot`)
- Опційно cross-hatch через `bg-[image:repeating-linear-gradient(...)]` для текст-блоків
- Анімований центральний `<Stamp text="ДРУКУЄТЬСЯ" rotation={-3} animateOn="load"/>` з CSS `@keyframes stamp-pulse` — rotation -3°→2°→-3° loop 1.4s, БЕЗ opacity-fade
- `prefers-reduced-motion: reduce` → `animation: none`

### 4.3 Готові композиції (one-shot exports)

| Component | Призначення | Структура |
|---|---|---|
| `<PaperSkeletonGrid cols={3} rows={2}/>` | catalog/collections | grid полароїд-плейсхолдерів 4/5 |
| `<PaperSkeletonProfile/>` | cabinet home | header-block + 3 секції stub |
| `<PaperSkeletonForm fields={5}/>` | login/register/checkout/2fa/cart | label-line + input-block × N |
| `<PaperSkeletonArticle/>` | product page, about/contacts | photo + paragraph-lines |
| `<PaperSkeletonPage/>` | universal fallback | повноекранний центральний Stamp без структури |

**Обґрунтування one-shot замість SkeletonBuilder factory:** мала кількість сценаріїв (5), стабільні layout, легше підтримувати + тестувати + читати diff.

### 4.4 Mapping route → variant

| Route | loading.tsx file | Variant |
|---|---|---|
| `/` (root) | `app/loading.tsx` | `<PaperSkeletonPage/>` |
| `(public)` group fallback | `app/(public)/loading.tsx` | `<PaperSkeletonPage/>` |
| `(public)/catalog` | `app/(public)/catalog/loading.tsx` | `<PaperSkeletonGrid/>` |
| `(public)/collections` | `app/(public)/collections/loading.tsx` | `<PaperSkeletonGrid/>` |
| `(public)/p/[slug]` | `app/(public)/p/[slug]/loading.tsx` | `<PaperSkeletonArticle/>` |
| `(public)/login`, `/register`, `/cart`, `/checkout` | per-route `loading.tsx` | `<PaperSkeletonForm/>` |
| `account`, `student`, `admin`, `parent` (segment) | per-segment `loading.tsx` | `<PaperSkeletonProfile/>` |

## 5. Error Boundaries

### 5.1 Segment-level `error.tsx`

Кожен Client Component (Next API), приймає `{ error, reset }`. Структурно копіює root `app/error.tsx`, role-aware копірайтинг:

| File | Stamp text | Headline | Дія |
|---|---|---|---|
| `app/error.tsx` (існує) | "ВИПУСК ПОШКОДЖЕНО" | "Сторінка не друкується" | reset |
| `app/(public)/error.tsx` | "АРКУШ ЗІМ'ЯВСЯ" | "Не вдалось викласти випуск" | reset + Link на `/` |
| `app/account/error.tsx` | "КАБІНЕТ ЗАЧИНЕНИЙ" | "Не виходить відкрити кабінет" | reset + Link на `/login` |
| `app/student/error.tsx` | "ЗОШИТ ЗАГУБЛЕНО" | "Робочий зошит недоступний" | reset + Link на `/student` |
| `app/admin/error.tsx` | "ШТАМП-ВІДДІЛ ЗАЧИНЕНО" | "Адмінка тимчасово недоступна" | reset + Link на `/admin/2fa` якщо error name === "ApiError" і `(error as ApiError).status === 401` (тип з `shared/api/errors`) |
| `app/parent/error.tsx` | "КОРЕСПОНДЕНЦІЯ ЗАГУБЛЕНА" | "Сторінка батьків недоступна" | reset only |

Усі тексти через `shared/i18n/uk.ts`.
Логування: `useEffect(() => console.error(error), [error])` — Sentry в TODO.md.

### 5.2 Widget-level `<WidgetErrorBoundary/>`

```tsx
// shared/ui/error-boundary/widget-error-boundary.tsx
"use client";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  resetKeys?: unknown[];
  label?: string;
  onError?: (e: Error) => void;
};
```

**Default fallback** `<WidgetErrorFallback label={label}/>`:
- `<Stamp text="ВІДБИТОК ЗМАЗАВСЯ" rotation={-2}/>`
- `<p className="font-hand text-hand-s">Не вдалось показати: {label}</p>`
- `<PillButton variant="ghost" onClick={resetErrorBoundary}>Друкувати знову</PillButton>`
- Punктирна рамка burgundy/40 — та сама візуальна мова що `<PaperSkeleton/>` (loading і error читаються як "ще не готове" з одного словника)

### 5.3 Куди ставити widget boundaries

| Widget folder | Чому |
|---|---|
| `widgets/catalog-grid/` (якщо існує — інакше TODO) | TanStack Query fetch може фейлити |
| `widgets/cart/` (якщо існує — інакше TODO) | client state + API sync |
| `widgets/admin-payouts-table/` (якщо існує — інакше TODO) | sensitive admin data |
| `widgets/string-carousel/` | placeholder зараз, реальний код Track C |
| `widgets/admin-tax-report/` (якщо існує — інакше TODO) | server aggregations |

**Discovery-крок у плані:** перший крок implementation — grep на існуючі widgets. Якщо потрібний widget ще не виділений у `widgets/`, **не виносимо в Track A** — додаємо в `TODO.md` з прив'язкою до Track A item, а тимчасово ставимо `<WidgetErrorBoundary>` інлайном на page-рівні.

## 6. Cookie Banner + Consent

### 6.1 `shared/lib/consent/`

```ts
// consent.ts (SSR-safe, no React)
export const CONSENT_COOKIE = "consent_dismissed";
export function getConsentDismissed(cookieJar?: string): boolean { /* parse */ }
export function setConsentDismissed(): void {
  document.cookie = `${CONSENT_COOKIE}=1; max-age=31536000; path=/; sameSite=lax`;
}
```

```ts
// use-consent.ts
"use client";
export function useConsent() {
  const [dismissed, setDismissed] = useState<boolean | null>(null); // null = pre-hydration
  useEffect(() => setDismissed(getConsentDismissed(document.cookie)), []);
  const dismiss = useCallback(() => { setConsentDismissed(); setDismissed(true); }, []);
  return { dismissed, dismiss };
}
```

**Чому `null` як initial:** уникаємо flash на SSR/hydration race — поки не визначено стан, banner не рендериться.

### 6.2 `widgets/cookie-banner/cookie-banner.tsx`

```tsx
"use client";
export function CookieBanner() {
  const { dismissed, dismiss } = useConsent();
  if (dismissed !== false) return null;
  return (
    <div role="region" aria-label={uk.cookies.ariaLabel}
         className="fixed inset-x-0 bottom-0 z-banner border-t border-burgundy/30 bg-bg-warm/95 backdrop-blur-sm">
      <Container>
        <div className="flex items-center justify-between gap-4 py-2">
          <p className="font-hand text-hand-s text-ink">
            {uk.cookies.notice}{" "}
            <Link href="/privacy" className="underline">{uk.cookies.policyLink}</Link>
          </p>
          <PillButton variant="ghost" size="sm" onClick={dismiss} aria-label={uk.cookies.dismiss}>
            ✕
          </PillButton>
        </div>
      </Container>
    </div>
  );
}
```

**Маунт:** в `app/layout.tsx` (root) одразу після children.

### 6.3 i18n додаток

```ts
// shared/i18n/uk.ts (нові секції)
cookies: {
  ariaLabel: "Cookie повідомлення",
  notice: "Ми використовуємо cookies для роботи сайту й аналітики.",
  policyLink: "Політика конфіденційності",
  dismiss: "Закрити повідомлення про cookies",
},
legal: {
  privacyTitle: "Політика конфіденційності",
  termsTitle: "Угода користувача",
  stubBody: "Документ редагується. Повна версія з'явиться найближчим часом.",
  stubContact: "Питання щодо обробки даних:",
}
```

**A11y:** `role="region"` + `aria-label`, `<button aria-label>` для X. Не модалка — Tab-trap не потрібен.

## 7. Privacy / Terms stubs

```tsx
// app/(public)/privacy/page.tsx
export const revalidate = 21600; // 6 годин

export const metadata = {
  title: "Політика конфіденційності — Ліцей 157",
  description: "Як ми збираємо й обробляємо персональні дані.",
};

export default function PrivacyPage() {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text="ДОКУМЕНТ ГОТУЄТЬСЯ" rotation={-4} animateOn="load"/>
        <h1 className="font-display text-display italic text-burgundy">{uk.legal.privacyTitle}</h1>
        <p className="text-lead text-ink-soft">{uk.legal.stubBody}</p>
        <p className="font-hand text-hand-s text-ink-soft">
          {uk.legal.stubContact}{" "}
          <a href="mailto:legal@157.kyiv.ua" className="underline">legal@157.kyiv.ua</a>
        </p>
      </Stack>
    </Container>
  );
}
```

`/terms/page.tsx` — структурно ідентична, інші Stamp-text та заголовок. **Не виносимо в `<LegalStub/>` shared компонент** (YAGNI: 2 використання).

**Email `legal@157.kyiv.ua` — placeholder.** Підтвердити з замовником → TODO.md.

## 8. blurDataURL prop в `ImageSlot` + `Polaroid`

Track A додає **тільки інтерфейс**:

```ts
// shared/ui/image-slot/image-slot.tsx — type addition
export type ImageSlotProps = {
  // ... існуючі поля
  blurDataURL?: string;  // base64 LQIP, передається в next/image
};
```

Pass-through:
```tsx
<Image
  src={src}
  alt={alt ?? caption}
  fill
  sizes={sizes ?? "100vw"}
  priority={priority}
  placeholder={blurDataURL ? "blur" : "empty"}
  blurDataURL={blurDataURL}
  className="object-cover"
/>
```

Те ж саме в `Polaroid`. `<Image>` з `unoptimized: true` поважає `placeholder="blur"` — Next рендерить base64 inline до hot-swap. Підготовка для Track C працює і на поточному режимі.

**Manual blur для editorial-фото — НЕ в Track A.** Track C наповнить sharp pipeline (WebP only — див. memory) + автогенерація `*.blur.txt` поряд з `*.webp`.

## 9. TODO.md (новий файл, persistent backlog)

```markdown
# TODO

Backlog знайденого під час Track A що виходить за scope. Не блокери для merge.

## Track B — Legal Content
- [ ] Real Privacy Policy text (юрист) — placeholder зараз `app/(public)/privacy/page.tsx`
- [ ] Real ToS text (юрист) — placeholder зараз `app/(public)/terms/page.tsx`
- [ ] Підтвердити `legal@157.kyiv.ua` як офіційний contact (інакше замінити в `shared/i18n/uk.ts`)

## Track C — Animations + Image Pipeline + E2E hardening
- [ ] String Carousel widget — реальна реалізація (зараз `widgets/string-carousel/` — placeholder з WidgetErrorBoundary)
- [ ] Paper Noise tuning — viewport-test на 4K/retina/zoom, можливо adjust opacity per breakpoint
- [ ] Sharp pre-build pipeline → WebP-only variants + base64 LQIP (no AVIF)
- [ ] Інтеграція blur токенів в `ImageSlot` (prop додано в Track A)
- [ ] E2E checkout: cart → checkout → success з тест-API
- [ ] E2E admin 2FA payouts/execute hardening tests

## Інше
- [ ] Catalog grid widget — виділити з `app/(public)/catalog/page.tsx` в `widgets/catalog-grid/` (для WidgetErrorBoundary mount)
- [ ] Cart widget — те ж саме
- [ ] Admin payouts table widget — те ж саме
- [ ] Sentry/observability — error.tsx логи зараз тільки в console.error
```

## 10. Тестування

### 10.1 Unit / RTL (Vitest)

- `paper-skeleton.test.tsx`: рендер кожного variant, punктирна рамка (data-testid), Stamp-child присутній, `prefers-reduced-motion` → animation none (mock matchMedia)
- `widget-error-boundary.test.tsx`: throw з child → fallback з `label`; click "Друкувати знову" → resetKey reset → fallback зникає; `onError` викликається
- `consent.test.ts`: cookie parsing, set/get round-trip, відсутність cookie → false
- `cookie-banner.test.tsx`: 4 кейси — рендериться без cookie / не рендериться з cookie / click X → cookie set + зникає / SSR snapshot empty (dismissed === null)

**Segment-level error.tsx — НЕ юніт-тестуємо** (Next-native, краще через E2E).

### 10.2 E2E (Playwright, `@smoke` де можливо)

- `tests/e2e/loading-states.spec.ts`: route handler delay 800ms на `/api/catalog` → під час pending видно `[data-testid="paper-skeleton"]` + `text=ДРУКУЄТЬСЯ`
- `tests/e2e/cookie-banner.spec.ts`: чистий context → banner видно → click X → зник + cookie set → reload → НЕ з'являється
- `tests/e2e/legal-stubs.spec.ts`: `/privacy` + `/terms` повертають 200, мають `<h1>` і Stamp; cookie banner лінк навігує на `/privacy`
- `tests/e2e/error-boundary.spec.ts`: route handler 500 на `/catalog` → segment fallback "АРКУШ ЗІМ'ЯВСЯ" з reset → click → re-fetch ОК → реальний контент

### 10.3 Verification (CLAUDE.md `## Verification`)

Перед merge — `pnpm verify` зеленим:
1. `pnpm typecheck`
2. `pnpm lint` (FSD boundaries)
3. `pnpm test` (Vitest unit + RTL)
4. `pnpm scan-images` (перевірка що `blurDataURL` prop не зламав scanner)
5. `pnpm build` (Next App Router строгий до error.tsx/loading.tsx co-location)
6. `pnpm e2e --grep @smoke`

UI manual:
- `pnpm dev`, Playwright headed
- Catalog: paper-skeleton (без shimmer) → grid
- Cookie banner: visit → видно → dismiss → reload → не з'являється
- Force-error на `/admin/payouts` → "ШТАМП-ВІДДІЛ ЗАЧИНЕНО"

## 11. Open questions / risks

- **`legal@157.kyiv.ua`** — placeholder, треба підтвердити з замовником
- **Discovery widget folders** — частина widget boundaries може зрушитись у TODO.md якщо widgets ще не виділені (catalog-grid, cart, payouts-table)
- **Sentry/observability** — поза скопом, але error.tsx логи зараз "губляться" в console.error
- **Track C блокування** — blurDataURL prop без real values марний до Track C; в Track A це prep-only робота
