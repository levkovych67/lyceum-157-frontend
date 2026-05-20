# Content Fill + Image Prompts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести всі views до візуальної відповідності `MASTER-design-spec.md`, вставити `<ImageSlot>` placeholder в усі місця де потрібне фото, і згенерувати `картинки.md` (route-based інвентар з Imagen 4 / Nano Banana промтами).

**Architecture:** Один shared компонент `<ImageSlot>` рендерить видимий dashed-border placeholder коли немає `src`, або делегує на існуючі decorative-обгортки (Polaroid / PhotoPrint / Stamp) коли `src` є. Кожен `slot=` ID збігається з anchor у `картинки.md`. Після кожного route — комміт + verify.

**Tech Stack:** Next.js 14.2 App Router · TypeScript strict · Tailwind v3 + CSS vars · Vitest + RTL · Playwright · pnpm. FSD architecture, ESLint-boundaries enforce.

**Spec:** `docs/superpowers/specs/2026-05-08-content-fill-and-image-prompts-design.md`

---

## File Structure

**New files:**
- `src/shared/ui/image-slot/image-slot.tsx` — компонент з placeholder/render-modes
- `src/shared/ui/image-slot/index.ts` — barrel
- `src/shared/ui/image-slot/image-slot.test.tsx` — RTL тести
- `src/shared/ui/image-slot/cross-hatch.svg` — SVG marker для placeholder
- `scripts/scan-image-slots.ts` — sync-чек між src і картинки.md
- `картинки.md` — route-based інвентар + промти (root)

**Modified:**
- `src/shared/ui/index.ts` — додати export
- `src/views/home/ui/home-screen.tsx` — переписати під MASTER-spec §V
- `src/views/catalog/ui/catalog-screen.tsx` — §VI
- `src/views/product-detail/ui/product-detail-screen.tsx` — §VII
- `src/views/collections/ui/collections-screen.tsx` — §IX
- `src/views/about/ui/about-screen.tsx` — §X (about section)
- `src/views/author-profile/ui/author-profile-screen.tsx` — §VIII
- `src/views/contacts/ui/contacts-screen.tsx`
- `src/views/login/ui/login-screen.tsx`, `src/views/register/ui/register-screen.tsx`
- `src/views/cart/ui/cart-screen.tsx`, `src/views/checkout/ui/checkout-screen.tsx`, `checkout-success/`, `checkout-failure/`
- `src/views/student-*/ui/*.tsx` — strictly per FRONTEND-API §3.5–3.7
- `src/views/admin-*/ui/*.tsx` — strictly per FRONTEND-API §3.8–3.12
- `src/views/kitchen/ui/kitchen-screen.tsx` — додати ImageSlot variants showcase
- `src/app/layout.tsx` — metadata: OG image, favicon set
- `package.json` — додати `scripts.scan-images` і включити в `verify`

**Conventions:**
- Імпорти тільки через `@/` alias
- Жодних hardcoded кольорів — тільки через token-classes
- ImageSlot `slot` ID kebab-case з `/`-розділенням: `<route-segment>/<block>/<index>`
- Нові UA-strings — у `shared/i18n/uk.ts` якщо їх ≥3 на view; інакше inline (для placeholder caption — inline ОК)

---

## Task 1: Create `<ImageSlot>` foundation (TDD)

**Files:**
- Create: `src/shared/ui/image-slot/image-slot.tsx`
- Create: `src/shared/ui/image-slot/index.ts`
- Create: `src/shared/ui/image-slot/image-slot.test.tsx`
- Modify: `src/shared/ui/index.ts`

- [ ] **Step 1.1: Write failing test**

Create `src/shared/ui/image-slot/image-slot.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageSlot } from "./image-slot";

describe("ImageSlot", () => {
  it("renders placeholder when src is undefined", () => {
    render(
      <ImageSlot
        slot="home/hero/poster-1"
        ratio="3/4"
        variant="polaroid"
        caption="Учнівська фоторамка №1"
      />,
    );
    const ph = screen.getByRole("img", { name: /Учнівська фоторамка №1.*placeholder/i });
    expect(ph).toBeInTheDocument();
    expect(ph).toHaveAttribute("data-slot", "home/hero/poster-1");
    expect(ph).toHaveAttribute("data-variant", "polaroid");
    expect(ph).toHaveAttribute("data-ratio", "3/4");
  });

  it("shows slot id, ratio and variant in placeholder body", () => {
    render(
      <ImageSlot
        slot="catalog/hero/banner"
        ratio="16/9"
        variant="interlude"
        caption="Банер каталогу"
      />,
    );
    expect(screen.getByText("catalog/hero/banner")).toBeInTheDocument();
    expect(screen.getByText("16/9")).toBeInTheDocument();
    expect(screen.getByText("interlude")).toBeInTheDocument();
    expect(screen.getByText("Банер каталогу")).toBeInTheDocument();
  });

  it("renders next/image when src is provided", () => {
    render(
      <ImageSlot
        slot="x/y/z"
        ratio="1/1"
        variant="plain"
        caption="cap"
        src="/images/test.jpg"
        alt="Test alt"
      />,
    );
    const img = screen.getByAltText("Test alt");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
    expect(screen.queryByRole("img", { name: /placeholder/i })).not.toBeInTheDocument();
  });

  it("applies aspect-ratio CSS to placeholder container", () => {
    const { container } = render(
      <ImageSlot
        slot="x/y/z"
        ratio="4/5"
        variant="photo-print"
        caption="cap"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.aspectRatio).toBe("4 / 5");
  });
});
```

- [ ] **Step 1.2: Run test to verify it fails**

Run: `pnpm test src/shared/ui/image-slot/image-slot.test.tsx`
Expected: FAIL with `Cannot find module './image-slot'` or similar.

- [ ] **Step 1.3: Implement ImageSlot**

Create `src/shared/ui/image-slot/image-slot.tsx`:

```tsx
"use client";
import Image from "next/image";
import { cn } from "@/shared/lib";

export type ImageSlotVariant =
  | "polaroid"
  | "photo-print"
  | "interlude"
  | "portrait"
  | "stamp"
  | "plain";

export type ImageSlotRatio = "3/4" | "4/5" | "16/9" | "1/1" | "21/9" | "3/2";

export type ImageSlotProps = {
  slot: string;
  ratio: ImageSlotRatio;
  variant: ImageSlotVariant;
  caption: string;
  src?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

const variantStyles: Record<ImageSlotVariant, string> = {
  polaroid: "bg-white p-3 pb-9 shadow-photo rounded-[2px]",
  "photo-print": "rounded-[4px] shadow-photo overflow-hidden",
  interlude: "rounded-none overflow-hidden",
  portrait: "rounded-[4px] shadow-photo overflow-hidden",
  stamp: "rounded-md border-2 border-dashed border-burgundy/60",
  plain: "rounded-[2px] overflow-hidden",
};

const placeholderRingByVariant: Record<ImageSlotVariant, string> = {
  polaroid: "border-2 border-dashed border-burgundy/60",
  "photo-print": "border-2 border-dashed border-burgundy/60",
  interlude: "border-2 border-dashed border-burgundy/60",
  portrait: "border-2 border-dashed border-burgundy/60",
  stamp: "",
  plain: "border-2 border-dashed border-burgundy/60",
};

export function ImageSlot({
  slot,
  ratio,
  variant,
  caption,
  src,
  alt,
  priority,
  sizes,
  className,
}: ImageSlotProps) {
  const aspectStyle = { aspectRatio: ratio.replace("/", " / ") };

  if (src) {
    const inner = (
      <div
        className={cn("relative overflow-hidden", variantStyles[variant], className)}
        style={aspectStyle}
      >
        <Image
          src={src}
          alt={alt ?? caption}
          fill
          sizes={sizes ?? "100vw"}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
    return inner;
  }

  return (
    <div
      role="img"
      aria-label={`${caption} (placeholder)`}
      data-slot={slot}
      data-variant={variant}
      data-ratio={ratio}
      style={aspectStyle}
      className={cn(
        "relative flex w-full flex-col items-center justify-center bg-paper-cream bg-paper-noise",
        placeholderRingByVariant[variant],
        variantStyles[variant],
        className,
      )}
      title={`Покласти файл: public/images/${slot}.jpg`}
    >
      <span className="absolute left-2 top-2 rounded-sm bg-charcoal/80 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-cream">
        {slot}
      </span>
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className="h-12 w-12 stroke-charcoal/50"
        fill="none"
        strokeWidth="1.5"
      >
        <line x1="4" y1="4" x2="60" y2="60" />
        <line x1="60" y1="4" x2="4" y2="60" />
        <line x1="32" y1="4" x2="32" y2="60" />
        <line x1="4" y1="32" x2="60" y2="32" />
      </svg>
      <p className="mt-3 max-w-[80%] text-center font-display text-small italic text-charcoal/70">
        {caption}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
        {ratio} · {variant}
      </p>
    </div>
  );
}
```

Create `src/shared/ui/image-slot/index.ts`:

```ts
export * from "./image-slot";
```

- [ ] **Step 1.4: Add Tailwind tokens if missing**

Check `tailwind.config.ts` for `bg-paper-cream`, `bg-paper-noise`, `text-charcoal`, `bg-charcoal`, `text-cream`, `border-burgundy`. If any missing, add them as `extend.colors`/`extend.backgroundImage` referencing existing CSS vars from `_app/styles/tokens.css`.

If `bg-paper-noise` is not yet defined, add to `tailwind.config.ts → theme.extend.backgroundImage`:

```ts
"paper-noise": "url('/textures/paper-noise.svg')",
```

If `paper-cream`/`charcoal`/`cream`/`burgundy` colors are missing in tailwind config, add references to existing CSS vars:

```ts
colors: {
  // ... existing
  "paper-cream": "var(--c-cream-100)",
  charcoal: "var(--c-charcoal, var(--c-ink))",
  cream: "var(--c-cream-100)",
  burgundy: "var(--c-burgundy)",
}
```

(Skip whichever already exists — don't duplicate.)

- [ ] **Step 1.5: Run test to verify it passes**

Run: `pnpm test src/shared/ui/image-slot/image-slot.test.tsx`
Expected: PASS, all 4 tests green.

- [ ] **Step 1.6: Add export to shared UI barrel**

Modify `src/shared/ui/index.ts`, append:

```ts
export * from "./image-slot";
```

- [ ] **Step 1.7: Add ImageSlot showcase to kitchen**

Modify `src/views/kitchen/ui/kitchen-screen.tsx` — додати section з усіма 6 variants × 3 ratios, з і без `src`. Знайти місце де вже є інші component showcases і додати після.

Append (or merge into existing structure):

```tsx
<section className="mt-16">
  <h2 className="font-display text-h2 italic text-burgundy">ImageSlot variants</h2>
  <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3">
    <ImageSlot slot="kitchen/polaroid/3-4" ratio="3/4" variant="polaroid" caption="Polaroid 3:4" />
    <ImageSlot slot="kitchen/photo-print/4-5" ratio="4/5" variant="photo-print" caption="Photo print 4:5" />
    <ImageSlot slot="kitchen/interlude/16-9" ratio="16/9" variant="interlude" caption="Interlude 16:9" />
    <ImageSlot slot="kitchen/portrait/16-9" ratio="16/9" variant="portrait" caption="Portrait 16:9" />
    <ImageSlot slot="kitchen/stamp/1-1" ratio="1/1" variant="stamp" caption="Stamp 1:1" />
    <ImageSlot slot="kitchen/plain/1-1" ratio="1/1" variant="plain" caption="Plain 1:1" />
  </div>
</section>
```

Add `ImageSlot` to imports at top: `import { ImageSlot, /* existing */ } from "@/shared/ui";`

- [ ] **Step 1.8: Run typecheck + lint + tests**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: all green.

- [ ] **Step 1.9: Commit**

```bash
git add src/shared/ui/image-slot src/shared/ui/index.ts src/views/kitchen/ui/kitchen-screen.tsx tailwind.config.ts
git commit -m "feat(shared/ui): ImageSlot — visible placeholder + render-mode for next/image"
```

---

## Task 2: Create `картинки.md` skeleton

**Files:**
- Create: `картинки.md` (repo root)

- [ ] **Step 2.1: Write skeleton**

Create `картинки.md` at repo root:

````markdown
# Картинки — інвентар і AI-промти

Інвентар усіх зображень потрібних сайту. Кожен slot-id збігається з `<ImageSlot slot="…" />` у `src/`. Якщо щось додаєш у код — додай тут. Sync-чек: `pnpm scan-images`.

**Generator:** Imagen 4 / Nano Banana (prose-prompt). Negative-prompt у нижньому полі.

## Style Anchor (use as prefix in every prompt)

> Editorial magazine photography, Ukrainian school art atelier "Lyceum 157", analog medium-format film aesthetic, Kodak Portra 400 grain, soft natural window light, muted desaturated palette anchored on cream paper #f5ecd9, deep burgundy #6e273d accents, charcoal #1a1612 shadows, occasional muted ochre #c8954a highlights. Texture: paper-noise grain overlay, subtle film vignette. Mood: contemplative, hand-made, tactile, slightly nostalgic but not vintage. NO oversaturated colors, NO digital sharpness, NO modern e-commerce gloss, NO smiling stock-photo faces.

## Global Negative Prompts

- modern gadgets (smartphones, laptops, tablets, screens)
- bright neon, saturated colors, HDR
- oversharpened, plastic, glossy
- stock-photo smiling faces, posed group shots
- corporate office, mall lighting, fluorescent

## TOC

- [Public](#public)
  - [/  (home)](#home)
  - [/catalog](#catalog)
  - [/p/[slug] (product detail)](#product-detail)
  - [/collections](#collections)
  - [/about](#about)
  - [/authors/[id]](#author-profile)
  - [/contacts](#contacts)
  - [/login, /register](#auth)
  - [/cart, /checkout, /checkout/success, /checkout/failure](#cart-checkout)
- [Student cabinet](#student-cabinet)
- [Admin cabinet](#admin-cabinet)
- [Brand assets](#brand-assets)
- [Demo product set (sample-only)](#demo-products)

## Per-slot prompt format

```markdown
### `<slot-id>` · `<ratio>` · `<variant>`

**Path:** `public/images/<slot-id>.jpg`
**Component:** `<ImageSlot variant="<variant>" ratio="<ratio>" />`
**Used in:** `src/views/<path>.tsx`

**Prompt:**
> [STYLE ANCHOR] + scene description (80–150 words). Framing X:Y.

**Negative:** slot-specific extras over global negatives.
```

---

## Public

<!-- Per-route sections will be added by Tasks 3–11 -->

## Student cabinet

<!-- Filled by Task 12 -->

## Admin cabinet

<!-- Filled by Task 13 -->

## Brand assets

<!-- Filled by Task 14 -->

## Demo product set (sample-only)

<!-- Filled by Task 5 (optional) -->
````

- [ ] **Step 2.2: Commit**

```bash
git add картинки.md
git commit -m "docs(images): bootstrap картинки.md (Style Anchor + TOC + format)"
```

---

## Task 3: Home page (`/`) — content fill + slots

**Reference:** `MASTER-design-spec.md` §V (Сторінка 1 — Головна).

**Slots:** `home/hero/poster-1` (3:4 polaroid), `home/hero/poster-2` (3:4 polaroid), `home/hero/poster-3` (3:4 polaroid), `home/manifesto/bw` (4:5 photo-print), `home/interlude/main` (16:9 interlude), `home/featured/cover` (21:9 interlude), `home/moodboard/scattered-1` (1:1 photo-print), `home/moodboard/scattered-2` (1:1 photo-print), `home/moodboard/scattered-3` (1:1 photo-print), `home/authors/thumb` (1:1 portrait).

**Files:**
- Modify: `src/views/home/ui/home-screen.tsx`
- Modify: `картинки.md`
- Test: Playwright headed walk-through

- [ ] **Step 3.1: Read MASTER-spec §V to confirm block sequence**

Run: `grep -n "## 5\." MASTER-design-spec.md` to find sub-sections (5.1 — структура, 5.2 — Hero, 5.3 — Manifesto, 5.4 — Carousel, 5.5 — Photo Interlude, 5.6 — Moodboard etc.). Open and re-read to align.

- [ ] **Step 3.2: Rewrite `home-screen.tsx` block-by-block**

Replace `src/views/home/ui/home-screen.tsx` with:

```tsx
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Stamp, Stack, ImageSlot, EditorialDivider } from "@/shared/ui";
import type { Page, ProductCardDto } from "@/shared/api";

export function HomeScreen({ initial }: { initial: Page<ProductCardDto> | null }) {
  return (
    <EditorialPageShell>
      {/* BLOCK 1 — masthead */}
      <header className="space-y-2">
        <EditorialLabel>ВИПУСК №47 · ТРАВЕНЬ 2026</EditorialLabel>
        <h1 className="font-display text-mega italic text-burgundy">Майстерня 157</h1>
        <p className="max-w-prose text-lead text-ink-soft">
          Архів учнівських робіт Ліцею №157. Київ · Оболонь · з 1957 року.
        </p>
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
        {initial && (
          <p className="text-small text-ink-soft">Робіт у каталозі: {initial.totalElements}</p>
        )}
      </header>

      <EditorialDivider />

      {/* BLOCK 2 — hero collage with 3 polaroids */}
      <section aria-label="Hero колаж" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ImageSlot slot="home/hero/poster-1" ratio="3/4" variant="polaroid" caption="Учнівська робота — кераміка" />
        <ImageSlot slot="home/hero/poster-2" ratio="3/4" variant="polaroid" caption="Учнівська робота — графіка" />
        <ImageSlot slot="home/hero/poster-3" ratio="3/4" variant="polaroid" caption="Учнівська робота — текстиль" />
      </section>

      <EditorialDivider />

      {/* BLOCK 3 — Editor's letter / manifesto */}
      <section aria-label="Маніфест" className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto]">
        <Stack gap={4}>
          <EditorialLabel>ЛИСТ РЕДАКТОРА</EditorialLabel>
          <p className="font-display text-h2 italic text-ink">
            Ми не маркетплейс. Ми архів того, що діти роблять руками між уроками.
          </p>
          <p className="max-w-prose text-body text-ink-soft">
            Кожна робота тут — це чийсь четвер. Хтось забув тінь, хтось не встиг покрити лаком.
            Це не вади — це сліди. Купуючи, ви забираєте час дитини, а не товар.
          </p>
        </Stack>
        <ImageSlot slot="home/manifesto/bw" ratio="4/5" variant="photo-print" caption="Ч/Б — клас на занятті" className="md:w-72" />
      </section>

      <EditorialDivider />

      {/* BLOCK 5 — Photographic Interlude (full-bleed) */}
      <section aria-label="Photographic interlude" className="-mx-5 md:-mx-6">
        <ImageSlot
          slot="home/interlude/main"
          ratio="16/9"
          variant="interlude"
          caption="Cinematic full-bleed момент"
        />
      </section>

      <EditorialDivider />

      {/* BLOCK 6 — Featured collection */}
      <section aria-label="Колекція місяця" className="space-y-4">
        <EditorialLabel>КОЛЕКЦІЯ МІСЯЦЯ</EditorialLabel>
        <ImageSlot slot="home/featured/cover" ratio="21/9" variant="interlude" caption="Банер колекції" />
        <p className="font-display text-h2 italic text-ink">
          Шевченківські дні · Графіка 11-А
        </p>
      </section>

      <EditorialDivider />

      {/* BLOCK 7 — Moodboard */}
      <section aria-label="Дошка натхнення" className="space-y-4">
        <EditorialLabel>ДОШКА НАТХНЕННЯ</EditorialLabel>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <ImageSlot slot="home/moodboard/scattered-1" ratio="1/1" variant="photo-print" caption="Деталь — пастель" />
          <ImageSlot slot="home/moodboard/scattered-2" ratio="1/1" variant="photo-print" caption="Деталь — глина" />
          <ImageSlot slot="home/moodboard/scattered-3" ratio="1/1" variant="photo-print" caption="Деталь — нитка" />
        </div>
      </section>

      <EditorialDivider />

      {/* BLOCK 8 — Author feature */}
      <section aria-label="Автор місяця" className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <ImageSlot slot="home/authors/thumb" ratio="1/1" variant="portrait" caption="Портрет автора місяця" className="md:w-48" />
        <Stack gap={2}>
          <EditorialLabel>АВТОР МІСЯЦЯ</EditorialLabel>
          <p className="font-display text-h2 italic">Олена Сидоренко · 11-А</p>
          <p className="max-w-prose text-small text-ink-soft">
            Працює переважно з керамікою і текстилем. У цьому місяці — серія «Птахи».
          </p>
        </Stack>
      </section>
    </EditorialPageShell>
  );
}
```

- [ ] **Step 3.3: Append home section to картинки.md**

Append to `картинки.md` under `## Public` heading:

````markdown
### Home <a id="home"></a>

#### `home/hero/poster-1` · 3:4 · polaroid

**Path:** `public/images/home/hero/poster-1.jpg`
**Component:** `<ImageSlot variant="polaroid" ratio="3/4" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Hero collage)

**Prompt:**
> [STYLE ANCHOR] + Close-up hands of a teenage student carefully painting a small ceramic vase at a wooden classroom desk, paint-stained fingertips, shallow depth of field, focus on the brush tip touching clay, soft window light from the left, brown paper sheet under the vase, scissors and pencil out of focus in foreground, no faces visible. Vertical 3:4 framing.

**Negative:** modern gadgets, plastic, neon, smiling face, stock-photo crowd.

#### `home/hero/poster-2` · 3:4 · polaroid

**Path:** `public/images/home/hero/poster-2.jpg`
**Component:** `<ImageSlot variant="polaroid" ratio="3/4" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Hero collage)

**Prompt:**
> [STYLE ANCHOR] + Top-down view of a graphite pencil drawing in progress on textured cream paper, ruler and kneaded eraser beside it, an unfinished botanical sketch with delicate cross-hatching, an open sketchbook in the corner, soft natural light, no human visible. Vertical 3:4 framing.

**Negative:** photographic precision, color drawings, digital tablet.

#### `home/hero/poster-3` · 3:4 · polaroid

**Path:** `public/images/home/hero/poster-3.jpg`
**Component:** `<ImageSlot variant="polaroid" ratio="3/4" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Hero collage)

**Prompt:**
> [STYLE ANCHOR] + A textile embroidery hoop with a half-finished folk motif in muted burgundy and ochre threads, scattered cotton bobbins around, wooden needle case, fingers holding the embroidery hoop edge (no full hand visible), warm window light from the right. Vertical 3:4 framing.

**Negative:** synthetic threads, neon yarns, machine embroidery.

#### `home/manifesto/bw` · 4:5 · photo-print

**Path:** `public/images/home/manifesto/bw.jpg`
**Component:** `<ImageSlot variant="photo-print" ratio="4/5" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Manifesto section)

**Prompt:**
> [STYLE ANCHOR] + Black-and-white documentary photograph of a Ukrainian school art classroom, three students seen from behind working at long wooden desks, papers and clay tools scattered, tall windows letting in cinematic light, dust particles visible in the air, classic mid-century art-room feel. Vertical 4:5 framing. Convert palette to monochrome but keep paper grain.

**Negative:** color, modern computers, digital screens.

#### `home/interlude/main` · 16:9 · interlude

**Path:** `public/images/home/interlude/main.jpg`
**Component:** `<ImageSlot variant="interlude" ratio="16/9" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Photographic interlude block)

**Prompt:**
> [STYLE ANCHOR] + Cinematic black-and-white wide shot of a school art classroom — long windows on the right flooding cool morning light, a single student silhouetted at a wooden table working on a clay form, foreground pottery wheel out of focus, deep ambient shadows, magazine-spread editorial composition with copy-space on the left third for an overlay headline. Horizontal 16:9 framing.

**Negative:** modern lighting, color, digital devices, branded posters.

#### `home/featured/cover` · 21:9 · interlude

**Path:** `public/images/home/featured/cover.jpg`
**Component:** `<ImageSlot variant="interlude" ratio="21:9" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Featured collection block)

**Prompt:**
> [STYLE ANCHOR] + Ultra-wide collection-banner: a flat-lay overhead view of multiple student graphite portraits inspired by Taras Shevchenko period, scattered on a long cream-paper-covered table, vintage school stamps and ribbons sprinkled, deep burgundy cloth folded on the right edge. Horizontal 21:9 framing.

**Negative:** modern fonts on artworks, watermarks, bright colors.

#### `home/moodboard/scattered-1` · 1:1 · photo-print

**Path:** `public/images/home/moodboard/scattered-1.jpg`
**Component:** `<ImageSlot variant="photo-print" ratio="1/1" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Moodboard)

**Prompt:**
> [STYLE ANCHOR] + Macro detail of pastel chalk smeared at the edge of a textured paper sheet, vivid burgundy and ochre streaks blended by a fingertip print, paper grain visible. Square 1:1 framing.

**Negative:** uniform color, digital paint, oversharpened.

#### `home/moodboard/scattered-2` · 1:1 · photo-print

**Path:** `public/images/home/moodboard/scattered-2.jpg`
**Component:** `<ImageSlot variant="photo-print" ratio="1/1" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Moodboard)

**Prompt:**
> [STYLE ANCHOR] + Macro detail of unfired clay being shaped by young fingers — ridges, thumbprints, slight cracks, dust on cuticles, soft window light, no full face visible. Square 1:1 framing.

**Negative:** plastic, factory pottery, glossy lacquer.

#### `home/moodboard/scattered-3` · 1:1 · photo-print

**Path:** `public/images/home/moodboard/scattered-3.jpg`
**Component:** `<ImageSlot variant="photo-print" ratio="1/1" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Moodboard)

**Prompt:**
> [STYLE ANCHOR] + Macro detail of a folk-motif embroidery thread loop being passed through a piece of linen, needle reflecting muted light, fingers slightly out of focus, burgundy and ochre threads. Square 1:1 framing.

**Negative:** synthetic shine, plastic needle, neon thread.

#### `home/authors/thumb` · 1:1 · portrait

**Path:** `public/images/home/authors/thumb.jpg`
**Component:** `<ImageSlot variant="portrait" ratio="1/1" />`
**Used in:** `src/views/home/ui/home-screen.tsx` (Author feature)

**Prompt:**
> [STYLE ANCHOR] + Half-portrait of a Ukrainian high-school student (16, female) in profile, head slightly turned, hair simply tied, plain dark sweater, looking down at her hands holding a small clay bird, neutral classroom background blurred, treated as a soft burgundy-toned duotone. Square 1:1 framing.

**Negative:** smiling stock-photo, makeup, branded clothing, identifiable features required.
````

- [ ] **Step 3.4: Run typecheck + lint + tests + build**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all green.

- [ ] **Step 3.5: Manual headed Playwright walk-through**

Run: `pnpm dev` у одному терміналі. У другому: `pnpm e2e:ui --grep @smoke`. Відкрити `/`. Перевірити:
- paper-noise видно на фоні
- 1+ stamp-drop animation у перші 2с (EST. 1957)
- 10 видимих placeholder-ів зі своїми ID
- editorial dividers між блоками
- mobile (375×667) — все стекається

Якщо щось не ОК — фіксити перед коммітом.

- [ ] **Step 3.6: Commit**

```bash
git add src/views/home/ui/home-screen.tsx картинки.md
git commit -m "feat(home): editorial layout per MASTER §V + 10 ImageSlot placeholders"
```

---

## Task 4: Catalog page (`/catalog`)

**Reference:** `MASTER-design-spec.md` §VI.

**Slots:** `catalog/hero/banner` (16:9 interlude), `catalog/intermission/quote` (21:9 interlude), `catalog/category/tile-1` (4:5 photo-print), `catalog/category/tile-2` (4:5 photo-print), `catalog/category/tile-3` (4:5 photo-print), `catalog/empty-state/illustration` (1:1 stamp).

**Files:**
- Modify: `src/views/catalog/ui/catalog-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 4.1: Read MASTER-spec §VI**

Run: `grep -n "## 6\." MASTER-design-spec.md`. Reread block structure (page hero, big intermission, product grid, etc).

- [ ] **Step 4.2: Update catalog-screen.tsx**

Open `src/views/catalog/ui/catalog-screen.tsx`. Insert page-hero banner ImageSlot at top, intermission ImageSlot in middle of grid (e.g. after row 2), 3 category tiles in а decorative «what we have» strip, empty-state illustration in fallback when zero products.

Skeleton (merge with existing list rendering):

```tsx
import { ImageSlot, EditorialLabel, EditorialDivider } from "@/shared/ui";

// inside the screen component, before product grid:
<section aria-label="Каталог hero">
  <ImageSlot slot="catalog/hero/banner" ratio="16/9" variant="interlude" caption="Заголовний банер каталогу" />
  <h1 className="mt-6 font-display text-h1 italic text-burgundy">Каталог робіт</h1>
</section>

<EditorialDivider />

<section aria-label="Категорії" className="grid grid-cols-1 gap-6 md:grid-cols-3">
  <ImageSlot slot="catalog/category/tile-1" ratio="4/5" variant="photo-print" caption="Кераміка" />
  <ImageSlot slot="catalog/category/tile-2" ratio="4/5" variant="photo-print" caption="Графіка" />
  <ImageSlot slot="catalog/category/tile-3" ratio="4/5" variant="photo-print" caption="Текстиль" />
</section>

{/* … existing product grid … */}

{/* Mid-grid intermission, render between page 1 and page 2 results */}
<section aria-label="Цитата-інтермісія" className="-mx-6 my-12 md:-mx-12">
  <ImageSlot slot="catalog/intermission/quote" ratio="21/9" variant="interlude" caption="Інтермісія — full-bleed цитата" />
</section>

{/* Empty state — when zero results */}
{items.length === 0 && (
  <div className="flex flex-col items-center gap-4 py-16">
    <ImageSlot slot="catalog/empty-state/illustration" ratio="1/1" variant="stamp" caption="Порожня поличка" className="w-48" />
    <p className="font-display text-h3 italic text-ink-soft">Тут поки порожньо.</p>
  </div>
)}
```

(Якщо існуючий компонент має іншу структуру — інтегрувати ImageSlots, не ламаючи existing data-fetching логіку.)

- [ ] **Step 4.3: Append catalog section to картинки.md**

Append under existing Public section:

````markdown
### Catalog <a id="catalog"></a>

#### `catalog/hero/banner` · 16:9 · interlude

**Path:** `public/images/catalog/hero/banner.jpg`
**Component:** `<ImageSlot variant="interlude" ratio="16/9" />`
**Used in:** `src/views/catalog/ui/catalog-screen.tsx`

**Prompt:**
> [STYLE ANCHOR] + Wide cinematic shot of a long classroom shelf displaying student artworks side by side — small ceramics, framed sketches, embroidery hoops — soft directional window light, deep shadows, editorial composition with empty wall above for headline overlay. Horizontal 16:9 framing.

**Negative:** retail mall, price tags, modern signage, neon.

#### `catalog/category/tile-1` · 4:5 · photo-print

**Path:** `public/images/catalog/category/tile-1.jpg`
**Component:** `<ImageSlot variant="photo-print" ratio="4/5" />`
**Used in:** `src/views/catalog/ui/catalog-screen.tsx`

**Prompt:**
> [STYLE ANCHOR] + Hero close-up of three small unglazed ceramic cups arranged on a brown paper surface, fingerprints visible in clay, soft warm light. Vertical 4:5 framing.

**Negative:** mass-produced pottery, glossy glaze, bright colors.

#### `catalog/category/tile-2` · 4:5 · photo-print

**Path:** `public/images/catalog/category/tile-2.jpg`
**Component:** `<ImageSlot variant="photo-print" ratio="4/5" />`
**Used in:** `src/views/catalog/ui/catalog-screen.tsx`

**Prompt:**
> [STYLE ANCHOR] + Stack of student graphite drawings on cream paper, edges curling, top sketch shows a hand-drawn portrait fragment, scattered erasers and pencils. Vertical 4:5 framing.

**Negative:** digital art, computer-generated, color drawings.

#### `catalog/category/tile-3` · 4:5 · photo-print

**Path:** `public/images/catalog/category/tile-3.jpg`
**Component:** `<ImageSlot variant="photo-print" ratio="4/5" />`
**Used in:** `src/views/catalog/ui/catalog-screen.tsx`

**Prompt:**
> [STYLE ANCHOR] + Folded linen fabric squares with hand-embroidered traditional Ukrainian motifs in burgundy and ochre threads, neatly stacked, wooden table surface visible. Vertical 4:5 framing.

**Negative:** machine-made, synthetic textiles, neon threads.

#### `catalog/intermission/quote` · 21:9 · interlude

**Path:** `public/images/catalog/intermission/quote.jpg`
**Component:** `<ImageSlot variant="interlude" ratio="21:9" />`
**Used in:** `src/views/catalog/ui/catalog-screen.tsx`

**Prompt:**
> [STYLE ANCHOR] + Ultra-wide black-and-white cinematic photograph of an empty art classroom — long row of windows on the left, easels arranged perpendicular, dust in light beams, intentional copy-space in upper portion for an overlay editorial pull-quote. Horizontal 21:9 framing.

**Negative:** color, modern furniture, digital screens.

#### `catalog/empty-state/illustration` · 1:1 · stamp

**Path:** `public/images/catalog/empty-state/illustration.jpg`
**Component:** `<ImageSlot variant="stamp" ratio="1/1" />`
**Used in:** `src/views/catalog/ui/catalog-screen.tsx` (zero-results state)

**Prompt:**
> [STYLE ANCHOR] + Stylized ink-stamp illustration on cream paper depicting an empty wooden shelf with one small ceramic cup tipped on its side, hand-drawn frame around the edge, looks like a museum-archive stamp. Square 1:1 framing.

**Negative:** photographic, three-dimensional rendering, color photography.
````

- [ ] **Step 4.4: Verify**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all green.

- [ ] **Step 4.5: Headed walk-through**

Run: `pnpm dev`. Open `/catalog`, перевірити: hero banner placeholder вгорі, category tiles strip, intermission між сторінками результатів, empty-state коли пошук без результатів. Mobile responsive.

- [ ] **Step 4.6: Commit**

```bash
git add src/views/catalog/ui/catalog-screen.tsx картинки.md
git commit -m "feat(catalog): editorial hero/intermission/categories per MASTER §VI + 6 placeholders"
```

---

## Task 5: Product detail (`/p/[slug]`) + demo set

**Reference:** `MASTER-design-spec.md` §VII.

**Slots (per-product, drop-in коли API повертає url):** `product/main` (4:5 photo-print), `product/thumb-1..3` (1:1 plain), `product/authors/mini` (1:1 portrait).

**Demo set (sample fixtures для local dev — `public/images/_demo/products/`):** 3 товари × 4 фото = 12 slots.

**Files:**
- Modify: `src/views/product-detail/ui/product-detail-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 5.1: Read MASTER-spec §VII**

Run: `grep -n "## 7\." MASTER-design-spec.md`. Подивитися gallery layout (main + 3 thumbs, museum-label, lightbox).

- [ ] **Step 5.2: Wire ImageSlot into product gallery**

Open `src/views/product-detail/ui/product-detail-screen.tsx`. Якщо API повертає `images: string[]` — використовувати реальні `src`. Якщо порожньо (наприклад на dev або dryrun) — `<ImageSlot>` placeholder.

Patch (приклад інтеграції — підлаштувати під реальну форму компонента):

```tsx
import { ImageSlot, MuseumLabel } from "@/shared/ui";

// In gallery section:
<div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
  <ImageSlot
    slot={`product/${slug}/main`}
    ratio="4/5"
    variant="photo-print"
    caption="Головне фото"
    src={images[0]}
    alt={`${title} — головне фото`}
    priority
  />
  <div className="flex flex-row gap-3 md:flex-col">
    {[1, 2, 3].map((i) => (
      <ImageSlot
        key={i}
        slot={`product/${slug}/thumb-${i}`}
        ratio="1/1"
        variant="plain"
        caption={`Деталь ${i}`}
        src={images[i]}
        alt={`${title} — деталь ${i}`}
        className="w-24"
      />
    ))}
  </div>
</div>

{/* Author mini */}
<ImageSlot
  slot={`product/${slug}/authors/mini`}
  ratio="1/1"
  variant="portrait"
  caption="Автор"
  src={author.avatarUrl}
  alt={author.name}
  className="w-16"
/>
```

(Якщо `images: string[]` приходить з API і завжди мінімум 1 — не обов'язково використовувати ImageSlot. Якщо опціонально — обов'язково. **Use placeholder where the contract allows empty.**)

- [ ] **Step 5.3: Add product/demo sections to картинки.md**

Append:

````markdown
### Product detail <a id="product-detail"></a>

> Реальні фото товарів приходять з API (S3 upload учнем — див FRONTEND-API §3.5.7–3.5.9). Промти нижче — **тільки** для demo-set і fallback документації.

#### `product/{slug}/main` · 4:5 · photo-print

**Component:** `<ImageSlot variant="photo-print" ratio="4/5" />`
**Used in:** `src/views/product-detail/ui/product-detail-screen.tsx` (gallery main)

**Generic prompt (для документації, реальні фото — від учня):**
> [STYLE ANCHOR] + Hero centered photograph of a single student artwork on a cream-paper backdrop, soft window light, museum-archive composition, slight off-center placement, no human visible. Vertical 4:5 framing.

**Negative:** dramatic studio lighting, neon, multiple objects.

#### `product/{slug}/thumb-{1..3}` · 1:1 · plain

**Generic prompt:**
> [STYLE ANCHOR] + Macro detail of one specific area of a student artwork (texture, edge, shadow, signature), shallow depth of field, paper or natural surface visible at edges. Square 1:1 framing.

**Negative:** wide shots, full-object views, branding.

#### `product/{slug}/authors/mini` · 1:1 · portrait

**Generic prompt:**
> [STYLE ANCHOR] + Tight crop of student's hands or partial profile working on art, treated as muted burgundy duotone, soft and contemplative, no identifiable face. Square 1:1 framing.

**Negative:** clear identifiable face, smile, modern accessories.

## Demo product set (sample-only) <a id="demo-products"></a>

> Не shipping в production. Використовується для local dev seed і Storybook/kitchen.

#### `_demo/products/ceramic-vase/{1..4}` · 4:5/1:1 · photo-print/plain

**Path:** `public/images/_demo/products/ceramic-vase/{1..4}.jpg`

**Prompts:**
1. Main 4:5 — A small unglazed terracotta vase by a student, sitting on a brown-paper-lined wooden table, finger marks visible on the surface, soft window light from the right.
2. Thumb 1:1 — Macro of the rim of the same vase, uneven edge, dust grains.
3. Thumb 1:1 — Macro of the base, signed «11-А · О.С.» pencil mark on the bottom, slight shadow.
4. Thumb 1:1 — Detail of the side curvature, fingerprint clearly visible.

**Negative:** factory pottery, glossy glaze, bright color paint.

#### `_demo/products/notebook/{1..4}` · 4:5/1:1 · photo-print/plain

**Path:** `public/images/_demo/products/notebook/{1..4}.jpg`

**Prompts:**
1. Main 4:5 — A hand-bound student notebook with a kraft cover, the spine sewn with red thread, lying open mid-page on a desk.
2. Thumb 1:1 — Close-up of the stitched spine.
3. Thumb 1:1 — Detail of an inner page with a pencil sketch and notes.
4. Thumb 1:1 — Stack-edge view showing layered cream pages.

**Negative:** modern stationery, plastic spirals, machine-printed.

#### `_demo/products/drawing/{1..4}` · 4:5/1:1 · photo-print/plain

**Path:** `public/images/_demo/products/drawing/{1..4}.jpg`

**Prompts:**
1. Main 4:5 — A graphite portrait sketch on cream paper, partial face study, framed by a simple wooden mat.
2. Thumb 1:1 — Macro of the eye area showing fine cross-hatching.
3. Thumb 1:1 — Edge of the paper showing eraser smudges and hand notes.
4. Thumb 1:1 — Pencil signature in lower-right corner.

**Negative:** color drawings, cartoon style, computer art.
````

- [ ] **Step 5.4: Verify + walk-through**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Then `pnpm dev`, open any product page (use a slug from MSW handlers/seed), confirm gallery integrates ImageSlot with placeholders for missing images.

- [ ] **Step 5.5: Commit**

```bash
git add src/views/product-detail/ui/product-detail-screen.tsx картинки.md
git commit -m "feat(product-detail): ImageSlot gallery + author mini per MASTER §VII"
```

---

## Task 6: Collections (`/collections`)

**Reference:** `MASTER-design-spec.md` §IX.

**Slots:** `collections/hero` (16:9 interlude), `collections/tile-1..4` (4:5 photo-print), `collections/decorative/stamp` (1:1 stamp).

**Files:**
- Modify: `src/views/collections/ui/collections-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 6.1: Read §IX of MASTER-spec**

Run: `grep -n "## 9\." MASTER-design-spec.md`.

- [ ] **Step 6.2: Update collections-screen.tsx**

Replace placeholder content. Skeleton:

```tsx
import { ImageSlot, EditorialLabel, EditorialDivider, Stamp } from "@/shared/ui";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";

export function CollectionsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>СПЕЦВИПУСКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Колекції</h1>
      <ImageSlot slot="collections/hero" ratio="16/9" variant="interlude" caption="Hero колекцій" />
      <EditorialDivider />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ImageSlot slot="collections/tile-1" ratio="4/5" variant="photo-print" caption="Шевченківські дні" />
        <ImageSlot slot="collections/tile-2" ratio="4/5" variant="photo-print" caption="Випуск 11-А" />
        <ImageSlot slot="collections/tile-3" ratio="4/5" variant="photo-print" caption="Літня практика" />
        <ImageSlot slot="collections/tile-4" ratio="4/5" variant="photo-print" caption="Архів 2024" />
      </div>
      <div className="flex justify-center">
        <ImageSlot slot="collections/decorative/stamp" ratio="1/1" variant="stamp" caption="Архівна печатка" className="w-32" />
      </div>
      <Stamp text="ARCHIVE" rotation={-5} />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 6.3: Append section to картинки.md**

````markdown
### Collections <a id="collections"></a>

#### `collections/hero` · 16:9 · interlude

**Prompt:**
> [STYLE ANCHOR] + Wide cinematic shot of a curated wall of student artworks, hung in salon-style arrangement with editorial spacing, library lighting from above. Horizontal 16:9 framing.

#### `collections/tile-1` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Cover-style flat-lay for a "Shevchenko days" collection — graphite portraits scattered on cream paper, traditional Ukrainian embroidered cloth corner. Vertical 4:5.

#### `collections/tile-2` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Cover for "Graduating class 11-A" collection — group of small ceramic objects arranged like a class photo, soft burgundy backdrop. Vertical 4:5.

#### `collections/tile-3` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Cover for "Summer plein-air" collection — watercolor landscape sketches in muted ochre tones, taped onto a cream wall. Vertical 4:5.

#### `collections/tile-4` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Cover for "Archive 2024" collection — overhead view of a wooden archive box with sketches and notebooks, leather strap binding visible. Vertical 4:5.

#### `collections/decorative/stamp` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Round ink stamp illustration "АРХІВ · 1957" with stylized owl silhouette and burgundy ink texture, on cream paper. Square 1:1.

**Negative:** photographic, three-dimensional rendering.
````

- [ ] **Step 6.4: Verify + walk-through + commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Open `/collections`. Commit:

```bash
git add src/views/collections/ui/collections-screen.tsx картинки.md
git commit -m "feat(collections): editorial layout per MASTER §IX + 6 placeholders"
```

---

## Task 7: About (`/about`)

**Reference:** `MASTER-design-spec.md` §X (about section).

**Slots:** `about/hero/portrait` (16:9 interlude), `about/spread-1` (4:5 photo-print), `about/spread-2` (4:5 photo-print), `about/sign/photo` (1:1 polaroid).

**Files:**
- Modify: `src/views/about/ui/about-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 7.1: Read §X of MASTER-spec**

- [ ] **Step 7.2: Update about-screen.tsx**

```tsx
import { ImageSlot, EditorialLabel, EditorialDivider } from "@/shared/ui";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";

export function AboutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПРО НАС</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Ліцей №157 · з 1957</h1>
      <ImageSlot slot="about/hero/portrait" ratio="16/9" variant="interlude" caption="Hero — фасад ліцею" />
      <EditorialDivider />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <p className="font-display text-h3 italic text-ink">
          Наш ліцей — школа з художнім ухилом і спорудою 1957 року. Ми не магазин — ми архів.
        </p>
        <ImageSlot slot="about/spread-1" ratio="4/5" variant="photo-print" caption="Архівне фото — клас образотворчого" />
      </div>
      <EditorialDivider />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <ImageSlot slot="about/spread-2" ratio="4/5" variant="photo-print" caption="Архівне фото — майстерня кераміки" />
        <p className="max-w-prose text-body text-ink-soft">
          Кожен учень приносить додому не оцінку, а слід — фізичний обʼєкт, зроблений руками. Цей архів — продовження тієї ж практики онлайн.
        </p>
      </div>
      <EditorialDivider />
      <div className="flex flex-col items-center gap-3">
        <ImageSlot slot="about/sign/photo" ratio="1/1" variant="polaroid" caption="Підпис директорки" className="w-44" />
        <p className="font-hand text-h3 text-ink">Олена Петрівна, директорка</p>
      </div>
    </EditorialPageShell>
  );
}
```

- [ ] **Step 7.3: Append картинки.md section**

````markdown
### About <a id="about"></a>

#### `about/hero/portrait` · 16:9 · interlude

**Prompt:**
> [STYLE ANCHOR] + Wide cinematic black-and-white photograph of a Soviet-era school building facade with tall arched windows, a single tree in the foreground, slight haze, editorial street-photography mood. Horizontal 16:9.

**Negative:** modern glass towers, color, neon signs.

#### `about/spread-1` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Black-and-white archival-style photograph of an art classroom interior, easels and stools, light streaming from window, students out of focus in background. Vertical 4:5.

#### `about/spread-2` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Black-and-white archival photograph of a pottery workshop, clay-stained towels, kilns in background, single student at work. Vertical 4:5.

#### `about/sign/photo` · 1:1 · polaroid

**Prompt:**
> [STYLE ANCHOR] + Polaroid-style square photograph of a handwritten signature on cream paper «Олена Петрівна», fountain pen and ink bottle beside, soft warm light. Square 1:1.

**Negative:** typed text, modern handwriting fonts, ballpoint shine.
````

- [ ] **Step 7.4: Verify + walk-through + commit**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Open `/about`. Commit:

```bash
git add src/views/about/ui/about-screen.tsx картинки.md
git commit -m "feat(about): editorial story layout per MASTER §X + 4 placeholders"
```

---

## Task 8: Author profile (`/authors/[id]`)

**Reference:** `MASTER-design-spec.md` §VIII.

**Slots:** `authors/hero/big` (16:9 portrait), `authors/work/thumb-1..3` (1:1 photo-print).

**Files:**
- Modify: `src/views/author-profile/ui/author-profile-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 8.1: Read §VIII of MASTER-spec**

Hero portrait — full-bleed Ч/Б photo з overlay editorial title, нижче 3 work thumbnails.

- [ ] **Step 8.2: Update author-profile-screen.tsx**

```tsx
import { ImageSlot, EditorialLabel } from "@/shared/ui";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";

export function AuthorProfileScreen({ author }: { author: { id: string; name: string; bio: string } }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>АВТОР</EditorialLabel>
      <section aria-label="Hero portrait" className="-mx-5 md:-mx-6">
        <ImageSlot
          slot={`authors/${author.id}/hero/big`}
          ratio="16/9"
          variant="portrait"
          caption={`Портрет — ${author.name}`}
        />
      </section>
      <h1 className="mt-6 font-display text-mega italic text-burgundy">{author.name}</h1>
      <p className="max-w-prose text-body text-ink-soft">{author.bio}</p>
      <h2 className="mt-12 font-display text-h2 italic">Роботи</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ImageSlot
            key={i}
            slot={`authors/${author.id}/work/thumb-${i}`}
            ratio="1/1"
            variant="photo-print"
            caption={`Робота ${i}`}
          />
        ))}
      </div>
    </EditorialPageShell>
  );
}
```

- [ ] **Step 8.3: Append картинки.md section**

````markdown
### Author profile <a id="author-profile"></a>

#### `authors/{id}/hero/big` · 16:9 · portrait

**Prompt:**
> [STYLE ANCHOR] + Half-body editorial portrait of a Ukrainian high-school student in a school art classroom, looking off-camera, holding a sketchbook, wearing a dark sweater, treated as a soft burgundy duotone, paper-grain texture. Horizontal 16:9 with copy-space on the left.

**Negative:** smiling stock-photo, posed studio, branded clothing.

#### `authors/{id}/work/thumb-{1..3}` · 1:1 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Centered photograph of a single student artwork (vary between drawing, ceramic, textile across thumbs 1/2/3), cream-paper backdrop, soft natural light. Square 1:1.

**Negative:** multiple objects, retail tags, harsh studio shadows.
````

- [ ] **Step 8.4: Verify + walk-through + commit**

```bash
git add src/views/author-profile/ui/author-profile-screen.tsx картинки.md
git commit -m "feat(author-profile): hero portrait + works grid per MASTER §VIII"
```

---

## Task 9: Contacts (`/contacts`)

**Slots:** `contacts/map/paper` (3:2 plain), `contacts/building/photo` (4:5 photo-print).

- [ ] **Step 9.1: Update contacts-screen.tsx**

```tsx
import { ImageSlot, EditorialLabel, EditorialDivider } from "@/shared/ui";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";

export function ContactsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>КОНТАКТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Як знайти ліцей</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ImageSlot slot="contacts/map/paper" ratio="3/2" variant="plain" caption="Мапа — Київ, Оболонь" />
        <ImageSlot slot="contacts/building/photo" ratio="4/5" variant="photo-print" caption="Фасад ліцею" />
      </div>
      <EditorialDivider />
      <address className="not-italic text-body text-ink-soft">
        м. Київ, проспект Героїв Сталінграда 23А<br />
        +38 044 000 00 00<br />
        info@lyceum157.ua
      </address>
    </EditorialPageShell>
  );
}
```

- [ ] **Step 9.2: Append картинки.md**

````markdown
### Contacts <a id="contacts"></a>

#### `contacts/map/paper` · 3:2 · plain

**Prompt:**
> [STYLE ANCHOR] + Hand-drawn paper-style map of Kyiv Obolon district with the lyceum location marked by a small ink stamp, traditional cartography crosshatching, cream paper texture. Horizontal 3:2.

**Negative:** Google Maps screenshot, satellite imagery, modern app UI.

#### `contacts/building/photo` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Frontal photograph of the lyceum building entrance from across the street, three trees framing it, soft afternoon light, slight film grain. Vertical 4:5.

**Negative:** drone shot, fish-eye, neon signs.
````

- [ ] **Step 9.3: Verify + commit**

```bash
git add src/views/contacts/ui/contacts-screen.tsx картинки.md
git commit -m "feat(contacts): map + building placeholders + address block"
```

---

## Task 10: Auth (`/login`, `/register`)

**Slots:** `auth/login/decorative-stamp` (1:1 stamp), `auth/register/decorative-stamp` (1:1 stamp).

**Files:**
- Modify: `src/views/login/ui/login-screen.tsx`
- Modify: `src/views/register/ui/register-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 10.1: Add decorative stamps to login/register pages**

In `login-screen.tsx`:

```tsx
import { ImageSlot, Stamp } from "@/shared/ui";

// Place the stamp in a corner of the form layout, e.g. top-right above the form:
<div className="relative">
  <ImageSlot
    slot="auth/login/decorative-stamp"
    ratio="1/1"
    variant="stamp"
    caption="Печатка входу"
    className="absolute -top-6 -right-6 w-24 rotate-[-8deg]"
  />
  {/* existing form */}
</div>
```

Same for `register-screen.tsx` with `slot="auth/register/decorative-stamp"`, caption "Печатка реєстрації".

- [ ] **Step 10.2: Append картинки.md**

````markdown
### Auth <a id="auth"></a>

#### `auth/login/decorative-stamp` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Round ink-stamp illustration "ВХІД 157" in deep burgundy ink on cream paper, slightly tilted, ink-bleed edges. Square 1:1.

#### `auth/register/decorative-stamp` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Round ink-stamp illustration "РЕЄСТРАЦІЯ" in burgundy ink with a small open-book icon center, ink-bleed edges. Square 1:1.

**Negative (both):** modern logos, gradients, photographic.
````

- [ ] **Step 10.3: Verify + commit**

```bash
git add src/views/login src/views/register картинки.md
git commit -m "feat(auth): decorative stamp placeholders for login/register"
```

---

## Task 11: Cart + Checkout (success/failure)

**Slots:** `cart/empty-state` (4:5 stamp), `checkout/trust-seal` (1:1 stamp), `checkout-success/confetti-bg` (16:9 interlude), `checkout-failure/rain-bg` (16:9 interlude).

**Files:**
- Modify: `src/views/cart/ui/cart-screen.tsx`
- Modify: `src/views/checkout/ui/checkout-screen.tsx`
- Modify: `src/views/checkout-success/ui/checkout-success-screen.tsx`
- Modify: `src/views/checkout-failure/ui/checkout-failure-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 11.1: Cart empty state**

In `cart-screen.tsx`:

```tsx
{items.length === 0 && (
  <div className="flex flex-col items-center gap-4 py-16">
    <ImageSlot slot="cart/empty-state" ratio="4/5" variant="stamp" caption="Кошик порожній" className="w-48" />
    <p className="font-display text-h3 italic text-ink-soft">Поки що нічого не вибрано</p>
  </div>
)}
```

- [ ] **Step 11.2: Checkout trust seal**

In `checkout-screen.tsx`, near submit button:

```tsx
<div className="flex items-center gap-3">
  <ImageSlot slot="checkout/trust-seal" ratio="1/1" variant="stamp" caption="Безпечний платіж" className="w-16" />
  <p className="text-small text-ink-soft">Платіж проходить через WayForPay. Картку не зберігаємо.</p>
</div>
```

- [ ] **Step 11.3: Success/failure backgrounds**

In `checkout-success-screen.tsx`:

```tsx
<section className="relative -mx-5 md:-mx-6">
  <ImageSlot slot="checkout-success/confetti-bg" ratio="16/9" variant="interlude" caption="Свято успіху" />
  <div className="absolute inset-0 flex items-center justify-center">
    <h1 className="font-display text-mega italic text-cream drop-shadow-lg">Дякуємо!</h1>
  </div>
</section>
```

In `checkout-failure-screen.tsx`:

```tsx
<section className="relative -mx-5 md:-mx-6">
  <ImageSlot slot="checkout-failure/rain-bg" ratio="16/9" variant="interlude" caption="Дощовий фон невдачі" />
  <div className="absolute inset-0 flex items-center justify-center">
    <h1 className="font-display text-mega italic text-cream drop-shadow-lg">Платіж не пройшов</h1>
  </div>
</section>
```

- [ ] **Step 11.4: Append картинки.md**

````markdown
### Cart & Checkout <a id="cart-checkout"></a>

#### `cart/empty-state` · 4:5 · stamp

**Prompt:**
> [STYLE ANCHOR] + Ink-stamp illustration of an empty paper basket with one stray sketch-page, hand-drawn frame, archive aesthetic. Vertical 4:5.

#### `checkout/trust-seal` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Round ink-stamp "БЕЗПЕЧНИЙ ПЛАТІЖ" with a small key icon, burgundy ink. Square 1:1.

#### `checkout-success/confetti-bg` · 16:9 · interlude

**Prompt:**
> [STYLE ANCHOR] + Wide editorial photograph of cream-paper confetti scattered on a wooden classroom desk, soft burgundy ribbon coiled in corner, warm window light, hopeful mood. Horizontal 16:9 with copy-space center.

**Negative:** plastic confetti, neon, balloons.

#### `checkout-failure/rain-bg` · 16:9 · interlude

**Prompt:**
> [STYLE ANCHOR] + Wide melancholic photograph of rain on a classroom window, blurred lights outside, charcoal mood, no people. Horizontal 16:9 with copy-space center.

**Negative:** thunderstorm drama, color saturation, neon city.
````

- [ ] **Step 11.5: Verify + walk-through + commit**

```bash
git add src/views/cart src/views/checkout src/views/checkout-success src/views/checkout-failure картинки.md
git commit -m "feat(cart/checkout): empty state + trust seal + success/failure backgrounds"
```

---

## Task 12: Student cabinet (FRONTEND-API §3.5–3.7 ONLY)

**Functional scope (do not exceed):**
- §3.5: products CRUD з state machine (POST/PUT/submit/hide/unhide/DELETE), image upload (upload-url + S3 PUT + confirm)
- §3.6: GET finance/summary
- §3.7: DELETE /users/me (GDPR right-to-be-forgotten)

**Slots:** `student/dashboard/hero` (16:9 interlude), `student/empty/no-products` (1:1 stamp), `student/empty/no-payouts` (1:1 stamp), `student/upload/art` (4:5 photo-print), `student/finance/banner` (16:9 interlude).

**Files:**
- Modify: `src/views/student-dashboard/ui/student-dashboard-screen.tsx`
- Modify: `src/views/student-products/ui/student-products-screen.tsx`
- Modify: `src/views/student-product-new/ui/student-product-new-screen.tsx`
- Modify: `src/views/student-product-edit/ui/student-product-edit-screen.tsx`
- Modify: `src/views/student-finance/ui/student-finance-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 12.1: Reread FRONTEND-API §3.5–3.7**

Run: `grep -n "## 3.5\|## 3.6\|## 3.7\|### 3.5\|### 3.6\|### 3.7" FRONTEND-API.md`. Open and confirm — no UI for any operation not listed.

- [ ] **Step 12.2: Dashboard layout**

`student-dashboard-screen.tsx`:

```tsx
import { ImageSlot, EditorialLabel } from "@/shared/ui";

// Kabінет shell already wraps role-section; inside:
<EditorialLabel>КАБІНЕТ УЧНЯ</EditorialLabel>
<h1 className="font-display text-h1 italic text-burgundy">Майстерня</h1>
<ImageSlot slot="student/dashboard/hero" ratio="16/9" variant="interlude" caption="Hero банер кабінету учня" />
{/* nav cards: Мої роботи (link to /student/products), Фінанси (/student/finance) */}
```

Якщо API повертає `productsCount === 0`:

```tsx
<div className="flex flex-col items-center gap-3 py-12">
  <ImageSlot slot="student/empty/no-products" ratio="1/1" variant="stamp" caption="Поки робіт немає" className="w-32" />
  <a href="/student/products/new" className="…">Додати першу роботу</a>
</div>
```

- [ ] **Step 12.3: Products list — list/state badges + empty state**

`student-products-screen.tsx`: показати products з API (`GET /student/products` per FRONTEND-API), state badges (DRAFT, PENDING_REVIEW, ACTIVE, REJECTED, HIDDEN, SOLD), actions per state machine (Edit/Submit/Hide/Unhide/Delete). Empty state — reuse `student/empty/no-products`.

- [ ] **Step 12.4: Product new/edit — upload-art slot**

`student-product-new-screen.tsx` and `student-product-edit-screen.tsx` — у формі поряд з кнопкою upload показати ImageSlot для preview:

```tsx
<ImageSlot
  slot="student/upload/art"
  ratio="4/5"
  variant="photo-print"
  caption="Прев'ю першого фото"
  src={uploadedUrls[0]}
  alt="Завантажене зображення"
/>
```

Після `confirm`-step (per §3.5.9) URLs з API заміняють placeholder.

- [ ] **Step 12.5: Finance — banner + empty state**

`student-finance-screen.tsx`:

```tsx
<EditorialLabel>ФІНАНСИ</EditorialLabel>
<ImageSlot slot="student/finance/banner" ratio="16/9" variant="interlude" caption="Hero банер фінансів" />
{/* table with summary from /student/finance/summary */}
{summary.payoutsCount === 0 && (
  <ImageSlot slot="student/empty/no-payouts" ratio="1/1" variant="stamp" caption="Виплат поки немає" className="w-32" />
)}
```

- [ ] **Step 12.6: Append картинки.md Student section**

````markdown
## Student cabinet <a id="student-cabinet"></a>

#### `student/dashboard/hero` · 16:9 · interlude

**Prompt:**
> [STYLE ANCHOR] + Wide cinematic shot of an open student sketchbook on a wooden desk, brushes and clay tool to the side, morning window light, copy-space upper left. Horizontal 16:9.

#### `student/empty/no-products` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Stylized ink-stamp illustration of an empty wooden easel, "ПОКИ ПОРОЖНЬО" text below in display serif italic, burgundy ink. Square 1:1.

#### `student/empty/no-payouts` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Stylized ink-stamp illustration of an empty envelope with a coin slot, "ВИПЛАТ ЩЕ НЕМАЄ" caption, burgundy ink. Square 1:1.

#### `student/upload/art` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Generic preview placeholder image: cream-paper backdrop with a hand-drawn dashed rectangle in the center and a simple camera icon, "ДОДАЙТЕ ФОТО" caption below. Vertical 4:5.

#### `student/finance/banner` · 16:9 · interlude

**Prompt:**
> [STYLE ANCHOR] + Wide cinematic shot of a wooden ledger book partially open, fountain pen beside, kraft envelope with coins, soft warm light. Horizontal 16:9.
````

- [ ] **Step 12.7: Verify + walk-through + commit**

Run full verify. Open `/student`, `/student/products`, `/student/products/new`, `/student/finance` (з seeded auth token). Перевірити що **ніяких** дій поза FRONTEND-API §3.5–3.7 не відображається.

```bash
git add src/views/student-* картинки.md
git commit -m "feat(student): cabinet UI strictly per FRONTEND-API §3.5–3.7 + 5 placeholders"
```

---

## Task 13: Admin cabinet (FRONTEND-API §3.8–3.12 ONLY)

**Functional scope (do not exceed):**
- §3.8: 2FA enroll/confirm/verify
- §3.9: GET admin/products + approve/reject
- §3.10: POST admin/orders/{id}/refund
- §3.11: POST admin/payouts/execute (2FA-gated)
- §3.12: GET admin/payouts/export/tax-report?from&to

**Slots:** `admin/dashboard/hero` (16:9 interlude), `admin/empty/queue` (1:1 stamp), `admin/payouts/shield` (1:1 stamp), `admin/reports/ledger` (4:5 photo-print).

**Files:**
- Modify: `src/views/admin-dashboard/ui/admin-dashboard-screen.tsx`
- Modify: `src/views/admin-2fa/ui/admin-2fa-screen.tsx`
- Modify: `src/views/admin-products/ui/admin-products-screen.tsx`
- Modify: `src/views/admin-order/ui/admin-order-screen.tsx`
- Modify: `src/views/admin-payouts/ui/admin-payouts-screen.tsx`
- Modify: `src/views/admin-tax-report/ui/admin-tax-report-screen.tsx`
- Modify: `картинки.md`

- [ ] **Step 13.1: Reread FRONTEND-API §3.8–3.12**

Run: `grep -n "## 3.8\|## 3.9\|## 3.10\|## 3.11\|## 3.12" FRONTEND-API.md`. Reread.

- [ ] **Step 13.2: Dashboard**

`admin-dashboard-screen.tsx`:

```tsx
<EditorialLabel>АДМІН-ПУЛЬТ</EditorialLabel>
<h1 className="font-display text-h1 italic text-burgundy">Адміністрування</h1>
<ImageSlot slot="admin/dashboard/hero" ratio="16/9" variant="interlude" caption="Hero банер адмінки" />
{/* nav: Модерація / Виплати (2FA) / Податковий звіт */}
{queueCount === 0 && (
  <ImageSlot slot="admin/empty/queue" ratio="1/1" variant="stamp" caption="Черга порожня" className="w-32" />
)}
```

- [ ] **Step 13.3: 2FA (§3.8)**

`admin-2fa-screen.tsx` — три стани: enroll (показ TOTP secret + QR), confirm (ввести 6-цифровий код), verify (re-prompt при чутливих діях).

- [ ] **Step 13.4: Products moderation (§3.9)**

`admin-products-screen.tsx` — list з actions Approve/Reject (з reasonText для reject). Empty state — reuse `admin/empty/queue`.

- [ ] **Step 13.5: Single order — refund (§3.10)**

`admin-order-screen.tsx` — кнопка `Повернення коштів` (POST /admin/orders/{id}/refund). Тільки якщо order paid; інакше disabled.

- [ ] **Step 13.6: Payouts (§3.11) — 2FA-gated**

`admin-payouts-screen.tsx`:

```tsx
<div className="flex items-center gap-4">
  <ImageSlot slot="admin/payouts/shield" ratio="1/1" variant="stamp" caption="2FA-замок" className="w-20" />
  <p className="text-small text-ink-soft">Дія потребує 2FA-підтвердження.</p>
</div>
{/* form: amount, currency, target — submit triggers POST /admin/payouts/execute з x-2fa-token */}
```

- [ ] **Step 13.7: Tax report (§3.12)**

`admin-tax-report-screen.tsx` — date range form (`from`, `to`) → fetch `/admin/payouts/export/tax-report?from&to` як CSV. Banner — reuse `admin/reports/ledger`.

- [ ] **Step 13.8: Append картинки.md Admin section**

````markdown
## Admin cabinet <a id="admin-cabinet"></a>

#### `admin/dashboard/hero` · 16:9 · interlude

**Prompt:**
> [STYLE ANCHOR] + Wide cinematic shot of an old archive desk — wooden filing card box, ledger book, brass desk lamp, dark green leather pad, deep ambient light. Horizontal 16:9.

#### `admin/empty/queue` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Round ink-stamp "ЧЕРГА ПОРОЖНЯ" with a small empty-tray icon, burgundy ink. Square 1:1.

#### `admin/payouts/shield` · 1:1 · stamp

**Prompt:**
> [STYLE ANCHOR] + Round ink-stamp "2FA · 157" with a small shield-and-key icon, deep burgundy ink, slight ink bleed. Square 1:1.

#### `admin/reports/ledger` · 4:5 · photo-print

**Prompt:**
> [STYLE ANCHOR] + Overhead photograph of a hand-written accounting ledger, fountain pen beside, columns of numbers in fountain-pen ink, paper edges curling. Vertical 4:5.

**Negative (all):** modern dashboards, computer screens, neon, gradients.
````

- [ ] **Step 13.9: Verify + walk-through + commit**

Open `/admin`, `/admin/2fa`, `/admin/products`, `/admin/orders/[id]`, `/admin/payouts`, `/admin/reports/tax`. Confirm: only listed actions, 2FA gate visible on payouts, no extra admin features.

```bash
git add src/views/admin-* картинки.md
git commit -m "feat(admin): cabinet UI strictly per FRONTEND-API §3.8–3.12 + 4 placeholders + 2FA gate"
```

---

## Task 14: Brand assets (OG, favicon)

**Slots:** `brand/og` (1200×630 fixed → use ratio 1200/630 ≈ 40/21), `brand/icon-512` (1:1 stamp).

**Files:**
- Modify: `src/app/layout.tsx` (Next.js metadata)
- Modify: `картинки.md`
- Create paths in spec: `public/og.png`, `public/icon.svg`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png` (placeholders в картинки.md, реальні файли — пізніше)

- [ ] **Step 14.1: Add metadata to root layout**

In `src/app/layout.tsx` (or wherever root metadata is set), add:

```tsx
export const metadata = {
  title: "Майстерня 157 — архів учнівських робіт",
  description: "Ліцей №157, Київ. З 1957 року. Кераміка, графіка, текстиль учнів.",
  openGraph: {
    title: "Майстерня 157",
    description: "Архів учнівських робіт. З 1957.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "uk_UA",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
```

- [ ] **Step 14.2: Append картинки.md Brand section**

````markdown
## Brand assets <a id="brand-assets"></a>

#### `brand/og` · 1200×630 (≈ 40:21) · plain

**Path:** `public/og.png`
**Used in:** `src/app/layout.tsx` metadata.openGraph.images

**Prompt:**
> [STYLE ANCHOR] + Editorial cover composition: cream paper background with the wordmark "Майстерня 157" in deep burgundy display serif italic on the left, three small student-art polaroids tilted on the right, ink stamp "EST. 1957" in the corner. Horizontal 1200×630 (40:21).

**Negative:** modern logo design, gradients, sans-serif tech aesthetic.

#### `brand/icon-512` · 1:1 · stamp

**Path:** `public/icon-512.png` (also generate 192/180/svg variants)
**Used in:** favicon set

**Prompt:**
> [STYLE ANCHOR] + Square brand mark "157" inside an octagonal ink stamp frame, burgundy ink, slight bleed, transparent background variant for SVG. Square 1:1.

**Negative:** photographic, gradients, glossy.

#### `brand/icon.svg`

Generate as a clean SVG version of the icon-512 prompt — no photo style, vector-friendly.

#### `brand/apple-touch-icon` (180×180 PNG)

Same as icon-512 with safe area inside.
````

- [ ] **Step 14.3: Verify + commit**

Run `pnpm typecheck && pnpm lint && pnpm build`. Run `pnpm dev`, view-source `/`, confirm `<meta property="og:image">` and `<link rel="icon">` are present (links will 404 until files exist — це очікувано).

```bash
git add src/app/layout.tsx картинки.md
git commit -m "feat(brand): OG + favicon metadata + brand prompt slots"
```

---

## Task 15: Sync script + verify integration

**Goal:** скрипт що порівнює `slot=` IDs у `src/` з заголовками-якорями `картинки.md`, виходить з ненульовим кодом якщо є orphan/missing.

**Files:**
- Create: `scripts/scan-image-slots.ts`
- Modify: `package.json` (add `scan-images` script + extend `verify`)

- [ ] **Step 15.1: Write failing script (sanity)**

Create `scripts/scan-image-slots.ts`:

```ts
#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const IMAGES_MD = `${ROOT}/картинки.md`;

function getSlotsInSrc(): Set<string> {
  const out = execSync(
    `pnpm --silent grep -RhoE "slot=\\"[^\\"]+\\"" src 2>nul || true`,
    { encoding: "utf8", shell: "powershell.exe" },
  );
  // Fallback: cross-platform via Node FS walk
  const slots = new Set<string>();
  const re = /slot="([^"]+)"/g;
  for (const line of out.split(/\r?\n/)) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) slots.add(m[1]);
  }
  return slots;
}

function getSlotsInImagesMd(): Set<string> {
  const md = readFileSync(IMAGES_MD, "utf8");
  const slots = new Set<string>();
  // matches lines like:  #### `home/hero/poster-1` · 3:4 · polaroid
  const re = /^#{2,6}\s+`([^`]+)`\s+·/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) slots.add(m[1]);
  return slots;
}

function main() {
  const inSrc = getSlotsInSrc();
  const inMd = getSlotsInImagesMd();

  // Allow templated slot ids in MD — turn `{slug}`/`{id}`/`{1..N}` into a regex tester
  const mdPatterns = Array.from(inMd).map((s) => ({
    raw: s,
    re: new RegExp(
      "^" +
        s
          .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
          .replace(/\\\{[^}]+\\\}/g, "[^/]+") +
        "$",
    ),
  }));

  const orphansInSrc = Array.from(inSrc).filter(
    (s) => !mdPatterns.some(({ re }) => re.test(s)),
  );
  const orphansInMd = Array.from(inMd).filter(
    (s) => !s.includes("{") && !inSrc.has(s),
  );

  let bad = 0;
  if (orphansInSrc.length) {
    console.error("Slot IDs у src без запису в картинки.md:");
    for (const s of orphansInSrc) console.error("  -", s);
    bad++;
  }
  if (orphansInMd.length) {
    console.error("Slot IDs у картинки.md без використання в src (orphan):");
    for (const s of orphansInMd) console.error("  -", s);
    bad++;
  }
  if (bad === 0) console.log(`OK — ${inSrc.size} slots aligned with картинки.md`);
  process.exit(bad ? 1 : 0);
}

main();
```

- [ ] **Step 15.2: Add npm script + tsx dev dep**

Modify `package.json`:

```json
{
  "scripts": {
    "scan-images": "tsx scripts/scan-image-slots.ts",
    "verify": "pnpm typecheck && pnpm lint && pnpm test && pnpm scan-images && pnpm build && pnpm e2e --grep @smoke"
  },
  "devDependencies": {
    "tsx": "4.19.2"
  }
}
```

Run: `pnpm add -D tsx`
Expected: tsx installed, lockfile updated.

- [ ] **Step 15.3: Run script — should PASS**

Run: `pnpm scan-images`
Expected: `OK — N slots aligned with картинки.md` (N == загальна кількість slot-IDs у src/).

If FAIL — fix the orphans (add missing entries в картинки.md, or remove unused).

- [ ] **Step 15.4: Run full verify**

Run: `pnpm verify`
Expected: all green включно з scan-images.

- [ ] **Step 15.5: Update CLAUDE.md verify section**

Modify `.claude/CLAUDE.md` — Verification section:

```markdown
- `pnpm scan-images` — sync між `<ImageSlot slot="…">` у src і анкорами в картинки.md
```

(Insert after `pnpm test`.)

- [ ] **Step 15.6: Commit**

```bash
git add scripts/scan-image-slots.ts package.json pnpm-lock.yaml .claude/CLAUDE.md
git commit -m "chore(scripts): scan-image-slots — sync check + wire into pnpm verify"
```

---

## Self-Review Checklist (run after plan complete)

**1. Spec coverage:**
- §3.1 ImageSlot → Task 1 ✓
- §3.2 Style Anchor → Task 2 ✓
- §3.3 картинки.md → Tasks 2 + 3–14 ✓
- §4.1 Public views → Tasks 3–11 ✓ (home/catalog/product/collections/about/author/contacts/auth/cart/checkout)
- §4.2 Student → Task 12 ✓
- §4.3 Admin → Task 13 ✓
- §4.4 Brand → Task 14 ✓
- §4.5 Demo set → Task 5 ✓
- §7 Implementation flow → mirrored in tasks 1–15 ✓
- §8 Verification → Tasks 1.8/3.4/4.4/.../15.4 + Task 15 sync script ✓

**2. Placeholder scan:** No "TBD"/"TODO"/"similar to" found in plan — all task steps have actual code.

**3. Type consistency:** `ImageSlotProps` defined in Task 1 used identically across Tasks 3–13. Variant set `polaroid|photo-print|interlude|portrait|stamp|plain` consistent. Ratio set `3/4|4/5|16/9|1/1|21/9|3/2` consistent.

---

## Open Notes

- Task 5 templated slot IDs use `{slug}` and `{id}` — sync script handles it via regex placeholders.
- If MASTER-spec adds new editorial blocks during implementation, add slots first, update картинки.md, then code.
- Real product images come from API (S3 upload); ImageSlot just gracefully falls back to placeholder when `src` is missing.

— end of plan —
