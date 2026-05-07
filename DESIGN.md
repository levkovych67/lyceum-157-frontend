---
version: alpha
name: Lyceum 157 — Archive Edition №47
description: >-
  Visual identity of the Lyceum 157 student-works storefront. The site presents
  itself as the 47th annual edition of a hand-printed school archive
  (1957–2026): warm milky paper, burgundy stamps, deep green editorial accents,
  Fraunces display + Manrope body + Caveat handwriting. Tactile, archival,
  publication-grade — never SaaS-flat.

colors:
  # Brand
  primary: "#6e273d"           # burgundy — headlines, prices, stamps
  primary-deep: "#4d1a2a"      # hover/active for primary
  primary-soft: "#f5e6ea"      # tinted backgrounds, badges
  secondary: "#0c6633"         # editorial green — nav, success
  secondary-deep: "#00662a"    # deep accent, lines
  secondary-soft: "#d8e6dc"    # soft tinted bg

  # Surfaces
  surface: "#fafaf7"           # main milky paper
  surface-warm: "#f3ead6"      # postcard back, warm callouts
  surface-card: "#ffffff"      # cards, inputs
  surface-yellow: "#fef3c7"    # sticker notes, game accents
  surface-blue: "#dbeafe"      # alt sticker
  surface-noir: "#1a1612"      # top bar, deep contrast strips

  # Ink
  on-surface: "#1e1e1e"        # primary text
  on-surface-soft: "#6b6b6b"   # secondary text
  on-surface-fade: "#a8a8a8"   # tertiary, hints
  line: "#ececec"              # dividers
  line-strong: "#c9c0b3"       # accent lines on warm bg

  # Functional
  link: "#1e73be"
  stamp: "#6e273d"
  error: "#b03030"

typography:
  mega:
    fontFamily: Fraunces
    fontSize: 200px
    fontWeight: 700
    lineHeight: 0.88
    letterSpacing: -0.03em
    fontVariation: "'opsz' 144"
  display:
    fontFamily: Fraunces
    fontSize: 96px
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: -0.02em
    fontVariation: "'opsz' 96, 'ital' 1"
  h1:
    fontFamily: Fraunces
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: -0.015em
    fontVariation: "'opsz' 60"
  h2:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.01em
    fontVariation: "'opsz' 60, 'ital' 1"
  h3:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: 0em
    fontVariation: "'opsz' 24"
  quote:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.01em
    fontVariation: "'opsz' 48, 'ital' 1"
  lead:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0em
  body:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0em
  small:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0em
  label:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.12em
  hand-s:
    fontFamily: Caveat
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0em
  hand-m:
    fontFamily: Caveat
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0em
  hand-l:
    fontFamily: Caveat
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0em

rounded:
  none: 0px
  sm: 6px
  md: 12px
  lg: 20px
  full: 9999px

spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 24px
  "6": 32px
  "7": 48px
  "8": 64px
  "9": 96px
  "10": 120px
  "11": 160px
  "12": 200px
  container-pad: 24px
  container-pad-mobile: 20px
  section-y: 120px
  section-y-mobile: 64px
  grid-gap: 24px
  grid-gap-mobile: 16px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px 32px
  button-primary-hover:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.surface}"
  button-primary-active:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.surface}"

  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px 32px
  button-secondary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"

  card-paper:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 24px
  card-warm:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 24px

  sticker-note:
    backgroundColor: "{colors.surface-yellow}"
    textColor: "{colors.on-surface}"
    typography: "{typography.hand-m}"
    rounded: "{rounded.sm}"
    padding: 16px

  museum-label:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface-soft}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    padding: 12px 16px

  editorial-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 0px

  stamp:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.stamp}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 12px

  form-field:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
  form-field-error:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.error}"

  input-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.link}"
    typography: "{typography.body}"

  topbar:
    backgroundColor: "{colors.surface-noir}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    padding: 8px 24px
---

## Overview

The site is **the 47th annual edition of the Lyceum 157 Workshop archive**. The archive has been hand-printed on warm milky paper since 1957, illustrated with black-and-white documentary photography, and dedicated each year to current student work. Every page of the site is a page of that edition: the home is the cover plus opening spread; the catalog is a contact sheet; a product page is a feature article; checkout is a postal order form.

Three pillars hold the identity together:

1. **Paper.** Tactile surfaces. Photo-print shadows. Milky background. Yellow stickers. Carbon black accents. Hand-stamped marks. Visible traces of physical process — uneven edges, slight tilts, paper noise.
2. **Typography.** This is a publication, not a SaaS dashboard. Headlines are big, italic, with optical-size axis tuned. Body text is calm. Caveat handwriting lives in the margins. Editorial labels (▌) at 12% tracking. Numerals are oversized.
3. **School.** It is not "a shop *about* a school" — it is **the school showing its archive**. Stamps marked 157, school crest in hallmarks, photos of corridors, student handwriting, alumni quotes, addresses of physical buildings on postcards.

Tone shifts subtly across the site (editorial-formal on home/catalog/about, editorial-warm on author/work/thank-you, functional-paper on cart/checkout/login/account) but the visual language never changes — only the density of decoration.

## Colors

The 60-30-10 rule governs surface allocation:

- **60%** of any view is `surface` (#fafaf7 milky paper).
- **30%** is split across `primary` (burgundy) blocks and warm callouts (`surface-warm`, `surface-yellow`).
- **10%** is reserved for point accents — `secondary` (deep green) and `surface-noir`.

- **`primary` (#6e273d "Burgundy"):** the single brand voice. Headlines, prices, stamps, the most important call to action on each screen. Never used for body text.
- **`primary-deep` (#4d1a2a):** active/pressed state of primary surfaces; never a static fill.
- **`primary-soft` (#f5e6ea):** tinted backgrounds for badges and notification chips that need to read as "of the brand" without screaming.
- **`secondary` (#0c6633 "Editorial Green"):** navigation rest state, success states, and the inverted hover of `button-primary`. The green-burgundy alternation is intentional — it echoes printed-edition spot inks.
- **`surface` (#fafaf7):** the milky paper that anchors everything. Pure white (`surface-card`) is reserved for raised surfaces (cards, inputs) so that the page itself reads warmer.
- **`surface-warm` (#f3ead6):** the back of a postcard. Used for the footer composition and warm callouts.
- **`surface-yellow` / `surface-blue`:** sticker notes — handwritten margin commentary, never primary content.
- **`surface-noir` (#1a1612):** a near-black with a hint of warmth. Used only for the very top utility strip and the very bottom of the page; never as a generic dark background.
- **`on-surface` family (#1e1e1e → #a8a8a8):** type hierarchy. Body always `on-surface`; metadata uses `on-surface-soft`; hints, placeholders, disabled state use `on-surface-fade`.
- **`link` (#1e73be):** the only blue allowed, and only for prose-embedded hyperlinks. Buttons never use it.
- **`error` (#b03030):** a warmer, more burgundy-leaning red — sits within the palette rather than fighting it.

## Typography

Three typefaces, all variable, all from Google Fonts:

- **Fraunces** (display) — serif with `opsz` (optical size) and `WONK` axes. Carries the publication tone.
- **Manrope** (body) — neutral grotesque, weights 200–800.
- **Caveat** (handwriting) — margin notes, signatures, never running text.

Italic Fraunces is reserved for `display`, `h2`, and `quote` — never used as a generic emphasis style. The optical-size axis mirrors traditional print: `opsz 144` on the largest headlines (softer, higher-contrast curves) and `opsz 9–24` on smaller working type. Fake italic and synthetic obliques are forbidden.

The `label` token is uppercase Manrope at 12% tracking — this is the editorial-label voice that replaces the "▌ SECTION TITLE" device throughout the site. The handwriting tokens (`hand-s/m/l`) are used sparingly: marginalia, the editor's signature, occasional pull-quote attributions. Body text never uses Caveat.

## Layout

- **Container:** max-width 1280px, horizontal padding 24px (desktop) / 20px (mobile).
- **Vertical rhythm:** sections breathe at 120px on desktop, 64px on mobile. Anything tighter feels web-flat; anything wider breaks the page-turn rhythm.
- **Grid:** 12-column with 24px gap (16px mobile). The grid is *present* but **never symmetric** — content is intentionally weighted left or right, image-heavy on one side, type-heavy on the other.
- **Spacing scale:** dense in increments of 4–32px for component-internal spacing; jumps to 48–200px for editorial breathing room. Never use a value that isn't on the scale.

## Elevation & Depth

Shadows are warm, never neutral grey. Burgundy alpha layers stand in for ambient ink shadows you'd see on stacked paper.

- **Paper-rest** (`0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(110,39,61,0.06)`) — default for cards. Imitates a sheet resting on the page beneath it.
- **Lift** (`0 8px 32px rgba(110,39,61,0.12)`) — hover state for product cards, modal entry.
- **Photo-print** (`0 12px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10)`) — black-and-white photographs sitting on the page; intentionally cooler and harder than the paper shadow.
- **Deep** (`0 32px 64px rgba(0,0,0,0.24)`) — overlays and lightboxes only.

A faint burgundy vignette (`radial-gradient at center, transparent 60%, rgba(110,39,61,0.04) 100%`) is layered over photo sections. Glassmorphism is forbidden except on the sticky header.

## Shapes

- `rounded.sm` (6px) — tags, small badges, inputs.
- `rounded.md` (12px) — photographs, content cards.
- `rounded.lg` (20px) — large feature cards.
- `rounded.full` (9999px) — pill buttons, stamps.
- `rounded.none` — editorial labels, museum labels, divider rules. Sharp corners signal "printed".

Borders come in four flavors: thin (`1px solid line`) for default dividers, strong (`1.5px solid on-surface`) for emphasis, burgundy (`1.5px solid primary`) for brand surfaces, and dashed (`1.5px dashed on-surface`) for postal/form dividers.

## Components

The components in the front matter cover the foundational vocabulary. Each named state (`-hover`, `-active`, `-error`) is a sibling token, not a nested object — this keeps them addressable from Tailwind themes and DTCG exports.

Conventions:

- **Buttons** are pill-shaped, label-typed, full-width on mobile. The hover swaps `primary` ↔ `secondary` rather than darkening — this is the brand's signature interaction.
- **Cards** sit on `surface-card` (white) at `rounded.md` with `paper-rest` elevation. Warm callouts use `surface-warm` instead.
- **Stamps** are circular `rounded.full` blocks of `stamp` color, applied with the `stamp-drop` motion (scale 1.4 → 1, rotate ±10° from final, `cubic-bezier(0.5, -0.6, 0.5, 1.6)` over 280ms). Fade-in is forbidden on stamps.
- **Sticker notes** use `surface-yellow` and Caveat handwriting — they are decorative annotations, never the main content.
- **Form fields** use `surface-card`, `rounded.sm`, body type. Errors render text in `error` while keeping the surface unchanged — color drives the alert, not a red box.
- **Editorial labels** are uppercase Manrope `label` (11px, 12% tracking) preceded by the ▌ glyph; rounded.none, no padding, sit flush above headings.

## Do's and Don'ts

**Do**

- Do reserve `primary` (burgundy) for the single most important action on each screen.
- Do use the sibling-naming convention for states (`button-primary-hover`, not nested objects).
- Do keep the paper-noise overlay visible on every page (`body::before`, opacity 0.04, multiply blend).
- Do animate stamps with the bouncy `ease-stamp` curve — the slight overshoot is the brand.
- Do mix italic and roman Fraunces deliberately; italic equals "section title" and "pull quote", roman equals everything else.
- Do respect the 60-30-10 surface rule on every composition.

**Don't**

- Don't introduce hardcoded colors, sizes, or fonts in components — only token-derived classes.
- Don't replace `stamp-drop` with a fade-in. Fade-in is a non-negotiable regression.
- Don't use symmetric 4×N product grids — they read as Shopify default. Lean asymmetric.
- Don't use gradient backgrounds, glassmorphism (except sticky header), purple corner glows, or generic Lottie loops — these are the AI-slop tells the spec explicitly bans.
- Don't pair Inter / Space Grotesk / Roboto with this palette. Fraunces + Manrope + Caveat or nothing.
- Don't mix `rounded.sm` and `rounded.lg` in the same composition — choose a register and hold it.
- Don't use emojis as UI affordances; use printer's marks (★ ▌ → ⊙) instead.
- Don't force WCAG-failing pairings. Body text on `surface` must clear 4.5:1 — verify with the lint contrast check.
