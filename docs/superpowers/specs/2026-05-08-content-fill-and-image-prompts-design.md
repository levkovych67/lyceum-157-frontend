# Frontend Content Fill + Image Prompts — Design Spec

**Date:** 2026-05-08
**Status:** Approved (brainstorming) → ready for implementation plan
**Author:** brainstorming session with user
**Related:**
- `MASTER-design-spec.md` — наративна дизайн-біблія (truth-source для візуалу)
- `DESIGN.md` — token-spec (`@google/design.md`)
- `FRONTEND-API.md` — контракт бекенда (truth-source для функціоналу)
- `docs/superpowers/specs/2026-05-07-frontend-foundation-design.md` — попередня foundation spec

## 1. Problem & Goal

Усі views (`src/views/**`) фізично існують, ESLint-boundaries вибудувано, токени і shared-UI готові, але **візуально жодна сторінка не відповідає опису в `MASTER-design-spec`**. У `public/textures/` лежать тільки paper-noise.svg і film-grain — жодних реальних фото для editorial-блоків (Hero polaroids, Manifesto B&W, Photo Interlude full-bleed, Author Hero, Featured Collection, Moodboard).

**Goal:**
1. Довести всі views до візуальної відповідності `MASTER-design-spec` — typography, layout, editorial-блоки, paper-noise, stamp-drop, polaroid-нитка, photo-interlude.
2. Усі місця де потрібне фото / ілюстрація отримують **видимий placeholder** (`<ImageSlot>`), щоб одразу було видно що порожньо.
3. Згенерувати `картинки.md` у корені — route-based інвентар усіх слотів з prose-промтами під Imagen 4 / Nano Banana і єдиним Style Anchor.

**Граничні умови:**
- **Feature-set строго за `FRONTEND-API.md`.** Не вигадуємо UI для функцій, яких немає в API. Особливо для admin (тільки 2FA, products approve/reject, orders refund, payouts execute, tax-report export).
- Жодних реальних зображень не комітимо — placeholder’и видимі, користувач замінить файли пізніше.

## 2. Out of Scope

- Реальна генерація AI-зображень (робота користувача).
- Нові API-ендпоінти, нові ролі, нові адмін-функції поза `FRONTEND-API.md`.
- MSW handlers для демо-продуктів (можливо окремий план пізніше).
- Performance-tuning картинок (responsive image-set, blur placeholder, AVIF) — підключиться коли реальні файли з’являться.

## 3. Architecture

### 3.1 Один shared компонент `<ImageSlot>`

**Файл:** `src/shared/ui/image-slot/image-slot.tsx`

**API:**

```tsx
type ImageSlotVariant =
  | 'polaroid'      // біла рамка з підписом, тінь sh-photo, легкий tilt
  | 'photo-print'   // сухий друк без рамки, гострі кути, sh-photo
  | 'interlude'     // full-bleed cinematic, vignette + bottom gradient
  | 'portrait'      // ч/б duotone burgundy, для author/about hero
  | 'stamp'         // декоративна печатка (квадрат, штамп-обводка)
  | 'plain';        // звичайне фото без рамки

type ImageSlotProps = {
  slot: string;            // глобально-унікальний ID, співпадає з anchor у картинки.md (e.g. "home/hero/poster-1")
  ratio: `${number}/${number}`; // "3/4" | "16/9" | "4/5" | "1/1" | "21/9"
  variant: ImageSlotVariant;
  caption: string;         // opisовий лейбл (UA), показується в placeholder
  src?: string;            // якщо існує — рендеримо <Image>; інакше — placeholder
  alt?: string;            // alt для реального фото (UA, з shared/i18n коли є)
  priority?: boolean;
  sizes?: string;
  className?: string;
};
```

**Поведінка:**
- Якщо `src` undefined або `<Image>` ловить `onError` → рендеримо placeholder.
- Інакше → `next/image` з пробросом `priority`/`sizes`.

**Placeholder-візуал:**
- Background: `--c-cream-100` + paper-noise overlay (через `bg-paper` token-class)
- Border: `2px dashed var(--c-burgundy-400)` з radius з `--r-md|--r-lg|0` залежно від variant
- Центральний marker: монограма ✕ (cross-hatch SVG) у `--c-charcoal` 60% opacity
- Зверху-зліва: `<MuseumLabel>` з ID-слоту (для звірки з картинки.md)
- Знизу: caption + ratio + variant
- Hover: tooltip з alt-чернеткою (якщо передано) і шляхом куди покласти файл

**A11y:**
- Placeholder: `role="img" aria-label="${caption} (placeholder)"`.
- Реальне фото: alt пробивається без модифікацій.

**Тест (RTL):**
- `image-slot.test.tsx` — рендерить placeholder без `src`, рендерить `<Image>` з `src`, accessible name відповідає caption у плейсхолдері.

### 3.2 Глобальний Style Anchor

Один спільний prose-prefix що використовується в кожному промті в `картинки.md`. Витягнуто з `MASTER-design-spec` (palette, mood, texture). Лежить у `картинки.md` верхньою секцією. Для кожного слоту повний промт = `Style Anchor + slot-specific scene description + framing + negative prompt`.

### 3.3 Inventory file `картинки.md`

**Розташування:** `<repo-root>/картинки.md`

**Структура:**
```
# Картинки — інвентар і AI-промти

## Style Anchor
<base prompt prefix, ~80 слів>

## Negative prompts (global)
<що ніколи не повинно з'являтися>

## TOC
- Public
- Student cabinet
- Admin cabinet
- Brand assets
- Demo product set

## /  (home)
### slot-id-1 · 3:4 · polaroid
**Path:** public/images/...
**Component:** <ImageSlot ... />
**Used in:** src/views/...
**Prompt:** > Style Anchor + scene
**Negative:** ...

### slot-id-2 ...

## /catalog
...
```

**Synchronization:** скрипт `scripts/scan-image-slots.ts` грепає `slot="..."` з усього `src/`, порівнює з заголовками-якорями `картинки.md`, виходить з ненульовим кодом якщо є orphan/missing. Підв’язується в `pnpm verify`.

## 4. Image Inventory (route-based)

### 4.1 Public views (~38 слотів)

| Route | View file | Slots |
|---|---|---|
| `/` | `src/views/home/ui/home-screen.tsx` | hero/poster-1 (3:4 polaroid), hero/poster-2 (3:4 polaroid), hero/poster-3 (3:4 polaroid), manifesto/bw (4:5 photo-print), interlude/main (16:9 interlude), featured/cover (21:9 interlude), moodboard/scattered-1..3 (1:1 photo-print), authors/thumb (1:1 portrait) |
| `/catalog` | `src/views/catalog/ui/catalog-screen.tsx` | hero/banner (16:9 interlude), intermission/quote (21:9 interlude), category/tile-1..3 (4:5 photo-print), empty-state/illustration (1:1 stamp) |
| `/p/[slug]` | `src/views/product-detail/ui/product-detail-screen.tsx` | product/main (4:5 photo-print), product/thumb-1..3 (1:1 plain), authors/mini (1:1 portrait) — **demo-set на 3 sample-товари** |
| `/collections` | `src/views/collections/ui/collections-screen.tsx` | hero (16:9 interlude), tile-1..4 (4:5 photo-print), decorative/stamp (1:1 stamp) |
| `/about` | `src/views/about/ui/about-screen.tsx` | hero/portrait (16:9 interlude), spread-1 (4:5 photo-print), spread-2 (4:5 photo-print), sign/photo (1:1 polaroid) |
| `/authors/[id]` | `src/views/author-profile/ui/author-profile-screen.tsx` | hero/big (16:9 portrait), work/thumb-1..3 (1:1 photo-print) |
| `/contacts` | `src/views/contacts/ui/contacts-screen.tsx` | map/paper (3:2 plain), building/photo (4:5 photo-print) |
| `/login`, `/register` | відповідні views | decorative/stamp кожному (1:1 stamp) |
| `/cart` | `src/views/cart/ui/cart-screen.tsx` | empty-state (4:5 stamp) |
| `/checkout` | `src/views/checkout/ui/checkout-screen.tsx` | trust/seal (1:1 stamp) |
| `/checkout/success` | `src/views/checkout-success/ui/checkout-success-screen.tsx` | success/confetti-bg (16:9 interlude) |
| `/checkout/failure` | `src/views/checkout-failure/ui/checkout-failure-screen.tsx` | failure/rain-bg (16:9 interlude) |

### 4.2 Student cabinet (~6 слотів)

Відповідно до FRONTEND-API §3.5–3.7. Жодного UI поза цим скоупом.

| Route | Slots |
|---|---|
| `/student` | dashboard/hero (16:9 interlude), empty/no-products (1:1 stamp), empty/no-payouts (1:1 stamp) |
| `/student/products/new` | upload/art (4:5 photo-print) |
| `/student/products/[id]/edit` | (reuse upload/art) |
| `/student/finance` | header/banner (16:9 interlude), empty/no-payouts (reuse) |

### 4.3 Admin cabinet (~5 слотів)

Відповідно до FRONTEND-API §3.8–3.12. Тільки описані функції.

| Route | Slots |
|---|---|
| `/admin` | dashboard/hero (16:9 interlude), empty/queue (1:1 stamp) |
| `/admin/products` | empty/queue (reuse) |
| `/admin/payouts` | shield/2fa (1:1 stamp) — підкреслення 2FA-gate |
| `/admin/reports/tax` | ledger/illustration (4:5 photo-print) |

### 4.4 Brand assets (~4)

- `/og.png` — Open Graph 1200×630
- `/icon.svg`, `/icon-192.png`, `/icon-512.png` — favicon set
- `/apple-touch-icon.png` — 180×180

### 4.5 Demo product set (sample-only, NOT shipping in prod)

3 фейкові товари × 4 фото = 12 слотів. Лежать у `public/images/_demo/products/{ceramic-vase,notebook,drawing}/{1..4}.jpg`. Використовуються тільки в local dev seed і Storybook/kitchen.

**Total: ~65 промтів.**

## 5. Style Anchor (draft)

```
Editorial magazine photography, Ukrainian school art atelier "Lyceum 157",
analog medium-format film aesthetic, Kodak Portra 400 grain, soft natural
window light, muted desaturated palette anchored on cream paper #f5ecd9,
deep burgundy #6e273d accents, charcoal #1a1612 shadows, occasional muted
ochre #c8954a highlights. Texture: paper-noise grain overlay, subtle film
vignette. Mood: contemplative, hand-made, tactile, slightly nostalgic but
not vintage. NO oversaturated colors, NO digital sharpness, NO modern
e-commerce gloss, NO smiling stock-photo faces.
```

**Global negatives:**
- modern gadgets, smartphones, laptops, tablets
- bright neon / saturated colors
- HDR, oversharpened
- stock-photo smiling faces, posed group shots
- corporate office, mall lighting

## 6. Per-slot prompt format

```markdown
### `<slot-id>`  ·  `<ratio>`  ·  `<variant>`

**Path:** `public/images/<slot-id>.jpg`
**Component:** `<ImageSlot variant="<variant>" ratio="<ratio>" />`
**Used in:** `src/views/<...>.tsx`

**Prompt:**
> [STYLE ANCHOR]
> <80–150 слів prose, що саме на сцені, framing, light direction, focus,
> emotion, NO faces of identifiable people unless explicitly intended>.
> Vertical/Horizontal `<ratio>` framing.

**Negative:** <slot-specific extras over global negatives>
```

## 7. Implementation Flow

1. **Foundation (1 комміт):** створити `src/shared/ui/image-slot/` з компонентом + RTL-тестом + index.ts. Підключити в `_app/styles` будь-які потрібні tokens (cross-hatch SVG, dashed-border var). Updateʼнути `views/kitchen` showcase прикладом усіх 6 variants.
2. **Public views (per-route коммітами).** По одному route за коміт:
   - переглянути відповідну секцію `MASTER-design-spec` (V—X)
   - доповнити layout, typography, editorial-блоки описані в spec (Manifesto, Photo Interlude, Moodboard, Featured Collection)
   - підв’язати paper-noise/stamp-drop де передбачено
   - вставити `<ImageSlot>` із slot-id з §4
   - оновити `картинки.md` (додати секції/слоти)
   - запустити Playwright headed і пройти golden path
3. **Auth/checkout/cart views (1–2 комміти):** легше — декоративні stamps, success/failure анімації.
4. **Student cabinet (1 комміт):** строго за FRONTEND-API §3.5–3.7. Products list/edit/new з S3 upload flow (вже описано), finance summary.
5. **Admin cabinet (1 комміт):** строго за FRONTEND-API §3.8–3.12. 2FA enroll/confirm/verify, products approve/reject, orders refund, payouts execute (з 2FA-gate UI), tax-report з date-range form.
6. **Brand assets (1 комміт):** додати слоти в `картинки.md` + посилання в `app/layout.tsx` метадані.
7. **Sync script (1 комміт):** `scripts/scan-image-slots.ts` + хук у `pnpm verify`.

## 8. Verification

Перед закриттям задачі:

- `pnpm typecheck` — TypeScript strict
- `pnpm lint` — ESLint + FSD boundaries
- `pnpm test` — Vitest unit + RTL component (включно з image-slot.test.tsx)
- `pnpm build` — Next production build
- `pnpm e2e --grep @smoke` — Playwright smoke
- `pnpm tsx scripts/scan-image-slots.ts` — 0 mismatches між src і картинки.md
- Manual headed Playwright walk-through:
  - `/` — paper-noise видно, ≥3 stamp-drop у перші 2с (per MASTER-spec III.221), polaroid-нитка скролиться, photo-interlude full-bleed
  - `/catalog` — page-hero, intermission, картки
  - `/p/<slug>` — product gallery, author mini
  - `/student/products/new` — image-slot для upload-art, S3 flow ОК
  - `/admin/payouts` — 2FA-gate видно, slot з shield-stamp

UI-задачі завжди з headed Playwright перед "готово".

## 9. Risks & Mitigations

| Ризик | Mitigation |
|---|---|
| Slot-IDs розходяться між src і картинки.md | Sync-скрипт у `pnpm verify` |
| Placeholder надто непомітний → користувач не розуміє що порожньо | Dashed border + cross-hatch + caption + ratio + museum-label з ID — overdesign навмисний |
| Admin/Student views отримують функціонал поза API | Перевірка кожного PR проти `FRONTEND-API.md` §9 (RBAC матриця) |
| MASTER-spec деталей багато, легко загубити blocks | План має чек-лист по секціях V–X з прив'язкою до route-комітів |
| Реальні фото пізніше будуть інших розмірів → CLS | `<ImageSlot ratio>` зафіксовує aspect-ratio CSS-style — coming images просто заповнять контейнер |
| Demo-set забирає час | Опційно — перенести в наступний план якщо foundation+public блокується |

## 10. Open Questions (до writing-plans)

- Чи запускати paralel-роботу по public views через subagent-driven-development (5–6 routes одночасно) — або послідовно?
- Чи Storybook/kitchen showcase для нових ImageSlot variants треба як окремий комміт чи частина foundation?
- `scripts/scan-image-slots.ts` — TypeScript з ts-node, чи bash з grep + node?

— end of spec —
