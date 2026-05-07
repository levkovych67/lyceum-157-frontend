# Frontend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap a Next.js 14.2 + FSD frontend foundation for `lyceum-157-frontend` with paper-design system, full HTTP-client infrastructure, RBAC, 12 route-stubs, 8 live forms, and verify pipeline.

**Architecture:** Feature-Sliced Design (FSD `app/` renamed to `_app/` to avoid Next routing collision), Tailwind v3 + CSS vars from MASTER spec, RSC+ISR for public/TanStack Query for role-based, Context+module-level token holder for auth, Zustand+persist for cart, react-hook-form+Zod for forms with `useAppForm` wrapper providing scroll-to-first-error UX.

**Tech Stack:** Next.js 14.2 App Router · TypeScript strict · Tailwind v3 · TanStack Query v5 · Zustand · react-hook-form + Zod · shadcn/ui (Radix-themed) · Vitest + React Testing Library + Playwright · MSW · pnpm

**Source documents:**
- `FRONTEND-API.md` (API contract — sections referenced as §)
- `MASTER-design-spec.md` (visual language)
- `docs/superpowers/specs/2026-05-07-frontend-foundation-design.md` (this plan implements it)

**Phases (sequential):**

| Phase | Goal | Tasks |
|---|---|---|
| 0 | Bootstrap repo (deps, configs, lint, prettier, husky) | 1–8 |
| 1 | Tokens + atoms (`shared/ui`) + `/_kitchen` showcase | 9–35 |
| 2 | API infrastructure (`shared/api`) | 36–55 |
| 3 | Providers + middleware + role layouts | 56–66 |
| 4 | Stores + global widgets (header, footer) | 67–76 |
| 5 | 12 route-stubs (RSC + screen composition) | 77–95 |
| 6 | Forms infrastructure + 8 live forms | 96–125 |
| 7 | Render strategy (ISR, sitemap, robots, revalidate) | 126–134 |
| 8 | Verify pipeline + CLAUDE.md + Stop-hook | 135–142 |

Each phase ends with a checkpoint where `pnpm verify` must pass before proceeding.

---

## Phase 0 — Bootstrap

### Task 1: Initialize Next.js project with pnpm

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `next-env.d.ts`, `.gitignore`

- [ ] **Step 1: Run create-next-app**

```bash
pnpm dlx create-next-app@14.2.18 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```

Expected: scaffolds Next 14.2 with TS, Tailwind v3 (NOT v4), ESLint, app/ router, src/ folder, `@/*` alias.

- [ ] **Step 2: Verify versions are pinned**

Open `package.json`, replace caret-ranges with exact for core:

```json
{
  "dependencies": {
    "next": "14.2.18",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

Run: `pnpm install`

- [ ] **Step 3: Tighten `tsconfig.json`**

Replace `compilerOptions` with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Verify typecheck baseline**

Run: `pnpm tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: bootstrap next.js 14.2 with strict typescript"
```

---

### Task 2: Install runtime dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install all runtime deps**

```bash
pnpm add @tanstack/react-query@5.62.0 @tanstack/react-query-devtools@5.62.0 \
  zustand@5.0.2 \
  react-hook-form@7.54.0 @hookform/resolvers@3.9.1 zod@3.23.8 \
  decimal.js@10.4.3 \
  clsx@2.1.1 tailwind-merge@2.5.5 class-variance-authority@0.7.1 \
  lucide-react@0.468.0 \
  sonner@1.7.1 \
  @radix-ui/react-dialog@1.1.2 @radix-ui/react-popover@1.1.2 \
  @radix-ui/react-select@2.1.2 @radix-ui/react-tabs@1.1.1 \
  @radix-ui/react-tooltip@1.1.4 @radix-ui/react-dropdown-menu@2.1.2 \
  @radix-ui/react-radio-group@1.2.1 @radix-ui/react-switch@1.1.1 \
  @radix-ui/react-checkbox@1.1.2 @radix-ui/react-slot@1.1.0 \
  @radix-ui/react-label@2.1.0 @radix-ui/react-alert-dialog@1.1.2
```

- [ ] **Step 2: Install dev deps**

```bash
pnpm add -D vitest@2.1.8 @vitest/ui@2.1.8 @vitest/coverage-v8@2.1.8 \
  @testing-library/react@16.1.0 @testing-library/jest-dom@6.6.3 \
  @testing-library/user-event@14.5.2 \
  jsdom@25.0.1 \
  @playwright/test@1.49.0 \
  msw@2.6.6 \
  prettier@3.4.2 prettier-plugin-tailwindcss@0.6.9 \
  eslint-plugin-boundaries@5.0.1 \
  husky@9.1.7 lint-staged@15.2.10 \
  @types/node@22.10.0
```

- [ ] **Step 3: Verify install**

Run: `pnpm install && pnpm tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install runtime and dev dependencies"
```

---

### Task 3: Configure Prettier

**Files:**
- Create: `.prettierrc.json`, `.prettierignore`

- [ ] **Step 1: Create `.prettierrc.json`**

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "arrowParens": "always",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- [ ] **Step 2: Create `.prettierignore`**

```
.next
node_modules
pnpm-lock.yaml
public
coverage
playwright-report
test-results
```

- [ ] **Step 3: Run prettier**

```bash
pnpm prettier --write .
```

Expected: reformats existing files.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add prettier config"
```

---

### Task 4: Configure ESLint with FSD boundaries

**Files:**
- Modify: `.eslintrc.json` → delete, create `.eslintrc.cjs`

- [ ] **Step 1: Delete `.eslintrc.json` (Next default)**

```bash
rm .eslintrc.json
```

- [ ] **Step 2: Create `.eslintrc.cjs`**

```js
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["boundaries"],
  settings: {
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
    "boundaries/include": ["src/**/*"],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: "app",       allow: ["_app", "processes", "pages", "widgets", "features", "entities", "shared"] },
          { from: "_app",      allow: ["processes", "pages", "widgets", "features", "entities", "shared"] },
          { from: "processes", allow: ["pages", "widgets", "features", "entities", "shared"] },
          { from: "pages",     allow: ["widgets", "features", "entities", "shared"] },
          { from: "widgets",   allow: ["features", "entities", "shared"] },
          { from: "features",  allow: ["entities", "shared"] },
          { from: "entities",  allow: ["shared"] },
          { from: "shared",    allow: [] },
        ],
      },
    ],
    "no-restricted-imports": [
      "error",
      { patterns: [{ group: ["../*"], message: "Use @/ alias instead of relative parent imports" }] },
    ],
  },
};
```

- [ ] **Step 3: Verify lint runs**

```bash
pnpm next lint
```

Expected: PASS (no warnings).

- [ ] **Step 4: Commit**

```bash
git add .eslintrc.cjs
git rm .eslintrc.json
git commit -m "chore: configure eslint with fsd boundaries"
```

---

### Task 5: Setup test infrastructure (Vitest + Playwright)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `tests/e2e/.gitkeep`, `tests/unit/.gitkeep`, `tests/component/.gitkeep`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    css: false,
    include: ["tests/unit/**/*.test.ts", "tests/component/**/*.test.tsx"],
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

- [ ] **Step 2: Install vitejs/plugin-react**

```bash
pnpm add -D @vitejs/plugin-react@4.3.4
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

if (!globalThis.crypto) {
  globalThis.crypto = require("node:crypto").webcrypto;
}
```

- [ ] **Step 4: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 5: Create directory placeholders**

```bash
mkdir -p tests/unit tests/component tests/e2e
touch tests/unit/.gitkeep tests/component/.gitkeep tests/e2e/.gitkeep
```

- [ ] **Step 6: Smoke test the test runners**

Create `tests/unit/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";
describe("smoke", () => { it("vitest runs", () => expect(1 + 1).toBe(2)); });
```

Run: `pnpm vitest run`
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: setup vitest, playwright, msw scaffold"
```

---

### Task 6: Setup Husky + lint-staged

**Files:**
- Create: `.husky/pre-commit`, `.husky/pre-push`, `lint-staged.config.cjs`

- [ ] **Step 1: Init husky**

```bash
pnpm dlx husky init
```

- [ ] **Step 2: Create `lint-staged.config.cjs`**

```js
module.exports = {
  "*.{ts,tsx}": ["eslint --max-warnings=0", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"],
};
```

- [ ] **Step 3: Replace `.husky/pre-commit`**

```sh
pnpm lint-staged
```

- [ ] **Step 4: Create `.husky/pre-push`**

```sh
pnpm tsc --noEmit
```

```bash
chmod +x .husky/pre-commit .husky/pre-push
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: husky + lint-staged for pre-commit guards"
```

---

### Task 7: Add full package.json scripts and env validation

**Files:**
- Modify: `package.json`
- Create: `.env.example`, `src/shared/config/env.ts`

- [ ] **Step 1: Set scripts in `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
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
    "verify": "pnpm typecheck && pnpm lint && pnpm test && pnpm build && pnpm e2e --grep @smoke",
    "prepare": "husky"
  }
}
```

- [ ] **Step 2: Create `.env.example`**

```
NEXT_PUBLIC_API_BASE=https://api.hub.157.kyiv.ua/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
REVALIDATE_SECRET=change-me
```

- [ ] **Step 3: Create `src/shared/config/env.ts`**

```ts
import { z } from "zod";

const PublicEnv = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const publicEnv = PublicEnv.parse({
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
```

- [ ] **Step 4: Create local `.env.local` for dev**

```bash
cp .env.example .env.local
```

(developer manually edits if needed)

- [ ] **Step 5: Add `.env.local` to .gitignore**

Verify `.gitignore` contains `.env*.local` (Next default).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: package scripts, env validation, .env.example"
```

---

### Task 8: Create FSD folder skeleton

**Files:**
- Create: full folder tree under `src/`

- [ ] **Step 1: Remove default Next files we'll replace**

```bash
rm -f src/app/page.tsx src/app/layout.tsx src/app/globals.css src/app/favicon.ico
```

- [ ] **Step 2: Create FSD folders with .gitkeep**

```bash
mkdir -p src/_app/providers src/_app/styles
mkdir -p src/processes
mkdir -p src/pages
mkdir -p src/widgets
mkdir -p src/features
mkdir -p src/entities
mkdir -p src/shared/api/modules src/shared/ui src/shared/lib src/shared/hooks src/shared/i18n src/shared/config
mkdir -p src/app/\(public\) src/app/parent src/app/student src/app/admin src/app/_kitchen src/app/api/revalidate
mkdir -p public/textures public/illustrations public/stamps public/icons

for dir in src/_app src/processes src/pages src/widgets src/features src/entities src/shared/ui src/shared/lib src/shared/hooks; do
  touch "$dir/.gitkeep"
done
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold fsd folder structure"
```

---

### Phase 0 Checkpoint

- [ ] **Run baseline verify**

```bash
pnpm typecheck && pnpm lint && pnpm vitest run
```

Expected: all PASS. (build/e2e skipped because nothing to render yet.)

---

## Phase 1 — Tokens + atoms + /_kitchen showcase

---

## Phase 1 — Tokens + atoms + /_kitchen showcase

### Task 9: Place static assets

**Files:**
- Create: `public/textures/paper-noise.svg`, `public/textures/film-grain-1024.png`

- [ ] **Step 1: Create `public/textures/paper-noise.svg`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 0.43, 0 0 0 0 0.15, 0 0 0 0 0.24, 0 0 0 0.5 0"/>
  </filter>
  <rect width="256" height="256" filter="url(#n)" opacity="0.5"/>
</svg>
```

- [ ] **Step 2: Place placeholder film-grain PNG**

For foundation, commit a 1×1 transparent PNG as stub. Real 1024×1024 grain PNG to be added before production polish (out of scope).

```bash
node -e "require('fs').writeFileSync('public/textures/film-grain-1024.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==', 'base64'))"
```

- [ ] **Step 3: Commit**

```bash
git add public/textures
git commit -m "feat(assets): paper-noise svg tile and film-grain placeholder"
```

---

### Task 10: Tailwind config with full token mapping

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "var(--container-pad)", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        burgundy: { DEFAULT: "var(--c-burgundy)", deep: "var(--c-burgundy-deep)", soft: "var(--c-burgundy-soft)" },
        green:    { DEFAULT: "var(--c-green)",    deep: "var(--c-green-deep)",    soft: "var(--c-green-soft)" },
        bg:       { DEFAULT: "var(--c-bg)", warm: "var(--c-bg-warm)", card: "var(--c-bg-card)",
                    yellow: "var(--c-bg-yellow)", blue: "var(--c-bg-blue)", noir: "var(--c-bg-noir)" },
        ink:      { DEFAULT: "var(--c-ink)", soft: "var(--c-ink-soft)", fade: "var(--c-ink-fade)" },
        line:     { DEFAULT: "var(--c-line)", strong: "var(--c-line-strong)" },
        link:     "var(--c-link)",
        stamp:    "var(--c-stamp)",
        error:    "var(--c-error)",
      },
      fontFamily: { display: ["var(--f-display)"], body: ["var(--f-body)"], hand: ["var(--f-hand)"] },
      fontSize: {
        mega:    ["clamp(80px, 12vw, 200px)", { lineHeight: "0.88", letterSpacing: "-0.03em", fontWeight: "700" }],
        display: ["clamp(56px, 8vw, 96px)",   { lineHeight: "0.92", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1:      ["clamp(40px, 5vw, 64px)",   { lineHeight: "1.0",  letterSpacing: "-0.015em", fontWeight: "700" }],
        h2:      ["clamp(32px, 4vw, 48px)",   { lineHeight: "1.05", letterSpacing: "-0.01em",  fontWeight: "700" }],
        h3:      ["clamp(24px, 2.5vw, 32px)", { lineHeight: "1.15", letterSpacing: "0",        fontWeight: "700" }],
        quote:   ["clamp(22px, 2.5vw, 32px)", { lineHeight: "1.2",  letterSpacing: "-0.01em",  fontWeight: "600" }],
        lead:    ["clamp(18px, 1.5vw, 22px)", { lineHeight: "1.55" }],
        body:    ["clamp(15px, 1vw, 16px)",   { lineHeight: "1.6" }],
        small:   ["clamp(13px, 0.9vw, 14px)", { lineHeight: "1.5", fontWeight: "500" }],
        label:   ["11px",                     { lineHeight: "1",   letterSpacing: "0.12em",   fontWeight: "700" }],
        "hand-s": ["clamp(16px, 1.2vw, 18px)", { lineHeight: "1.3" }],
        "hand-m": ["clamp(22px, 1.8vw, 26px)", { lineHeight: "1.25", fontWeight: "600" }],
        "hand-l": ["clamp(28px, 2.5vw, 36px)", { lineHeight: "1.2",  fontWeight: "700" }],
      },
      spacing: {
        1: "var(--s-1)", 2: "var(--s-2)", 3: "var(--s-3)", 4: "var(--s-4)",
        5: "var(--s-5)", 6: "var(--s-6)", 7: "var(--s-7)", 8: "var(--s-8)",
        9: "var(--s-9)", 10: "var(--s-10)", 11: "var(--s-11)", 12: "var(--s-12)",
      },
      borderRadius: { sm: "var(--r-sm)", md: "var(--r-md)", lg: "var(--r-lg)", pill: "var(--r-pill)" },
      boxShadow:    { paper: "var(--sh-paper)", lift: "var(--sh-lift)", photo: "var(--sh-photo)", deep: "var(--sh-deep)" },
      transitionTimingFunction: { paper: "var(--ease-paper)", spring: "var(--ease-spring)", quart: "var(--ease-quart)", stamp: "var(--ease-stamp)" },
      transitionDuration: { d1: "var(--d-1)", d2: "var(--d-2)", d3: "var(--d-3)", d4: "var(--d-4)", d5: "var(--d-5)", d6: "var(--d-6)" },
      keyframes: {
        "stamp-drop": {
          "0%":   { transform: "translateY(-180px) scale(1.6) rotate(var(--final-rotation, -8deg))", opacity: "0", filter: "blur(2px)" },
          "60%":  { transform: "translateY(-8px) scale(0.94) rotate(calc(var(--final-rotation, -8deg) * 0.8))", opacity: "1", filter: "blur(0)" },
          "72%":  { transform: "translateY(2px) scale(1.06) rotate(var(--final-rotation, -8deg))" },
          "85%":  { transform: "translateY(0) scale(0.98) rotate(var(--final-rotation, -8deg))" },
          "100%": { transform: "translateY(0) scale(1) rotate(var(--final-rotation, -8deg))" },
        },
        "page-turn": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "tilt-into-place": {
          "0%":   { transform: "rotate(calc(var(--final-rotation, 0deg) + 20deg))", opacity: "0" },
          "100%": { transform: "rotate(var(--final-rotation, 0deg))", opacity: "1" },
        },
      },
      animation: {
        "stamp-drop":      "stamp-drop var(--d-3) var(--ease-stamp) both",
        "page-turn":       "page-turn var(--d-3) var(--ease-paper) both",
        "tilt-into-place": "tilt-into-place var(--d-4) var(--ease-spring) both",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2: Verify Tailwind compiles**

```bash
pnpm tsc --noEmit
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat(design): tailwind config with full master-spec tokens"
```

---

### Task 11: CSS token files

**Files:**
- Create: `src/_app/styles/{tokens,paper-noise,stamps,paper-cursor,globals}.css`

- [ ] **Step 1: Create `src/_app/styles/tokens.css`**

```css
:root {
  --c-burgundy: #6e273d;       --c-burgundy-deep: #4d1a2a;     --c-burgundy-soft: #f5e6ea;
  --c-green: #0c6633;          --c-green-deep: #00662a;        --c-green-soft: #d8e6dc;
  --c-bg: #fafaf7;             --c-bg-warm: #f3ead6;           --c-bg-card: #ffffff;
  --c-bg-yellow: #fef3c7;      --c-bg-blue: #dbeafe;           --c-bg-noir: #1a1612;
  --c-ink: #1e1e1e;            --c-ink-soft: #6b6b6b;          --c-ink-fade: #a8a8a8;
  --c-line: #ececec;           --c-line-strong: #c9c0b3;
  --c-link: #1e73be;           --c-stamp: #6e273d;             --c-error: #b03030;

  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-5: 24px;  --s-6: 32px;  --s-7: 48px;  --s-8: 64px;
  --s-9: 96px;  --s-10: 120px; --s-11: 160px; --s-12: 200px;

  --container-max: 1280px;
  --container-pad: 24px;
  --container-pad-mob: 20px;

  --r-sm: 6px; --r-md: 12px; --r-lg: 20px; --r-pill: 999px;

  --sh-paper: 0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(110,39,61,0.06);
  --sh-lift:  0 8px 32px rgba(110,39,61,0.12);
  --sh-photo: 0 12px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10);
  --sh-deep:  0 32px 64px rgba(0,0,0,0.24);

  --ease-paper:  cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-quart:  cubic-bezier(0.25, 1, 0.5, 1);
  --ease-stamp:  cubic-bezier(0.5, -0.6, 0.5, 1.6);

  --d-1: 120ms; --d-2: 200ms; --d-3: 280ms;
  --d-4: 480ms; --d-5: 800ms; --d-6: 1200ms;

  --f-display: var(--f-display-raw, "Iowan Old Style"), Georgia, serif;
  --f-body:    var(--f-body-raw, "Helvetica Neue"), system-ui, sans-serif;
  --f-hand:    var(--f-hand-raw, "Brush Script MT"), cursive;
}

@media (prefers-reduced-motion: reduce) {
  :root { --d-1: 1ms; --d-2: 1ms; --d-3: 1ms; --d-4: 200ms; --d-5: 200ms; --d-6: 200ms; }
}
```

- [ ] **Step 2: Create `src/_app/styles/paper-noise.css`**

```css
body::before {
  content: "";
  position: fixed; inset: 0;
  background-image: url("/textures/paper-noise.svg");
  background-size: 256px 256px;
  mix-blend-mode: multiply;
  opacity: 0.04;
  pointer-events: none;
  z-index: 1;
}

.photo-grainy { position: relative; }
.photo-grainy::after {
  content: "";
  position: absolute; inset: 0;
  background: url("/textures/film-grain-1024.png") repeat;
  mix-blend-mode: overlay;
  opacity: 0.18;
  pointer-events: none;
}

.surface-warm-grainy {
  background-image: url("/textures/paper-noise.svg");
  background-size: 256px;
  mix-blend-mode: multiply;
  opacity: var(--noise-opacity, 0.10);
}
```

- [ ] **Step 3: Create `src/_app/styles/stamps.css`**

```css
.stamp[data-smudge="true"]::after {
  content: "";
  position: absolute; inset: 0;
  background: inherit;
  filter: blur(8px);
  opacity: 0;
  transform: translate(4px, 4px);
  animation: smudge-appear var(--d-3) var(--ease-paper) 60ms both;
  pointer-events: none;
}
@keyframes smudge-appear { to { opacity: 0.15 } }

.stamp[data-trail="true"] {
  box-shadow:
    0 -8px 12px rgba(110, 39, 61, 0.12),
    0 -16px 18px rgba(110, 39, 61, 0.06),
    0 -24px 24px rgba(110, 39, 61, 0.03);
  animation-name: stamp-drop, trail-fade;
  animation-duration: var(--d-3), var(--d-3);
  animation-timing-function: var(--ease-stamp), var(--ease-paper);
}
@keyframes trail-fade { 60%, 100% { box-shadow: none } }
```

- [ ] **Step 4: Create `src/_app/styles/paper-cursor.css`**

```css
@media (hover: hover) and (pointer: fine) {
  html[data-paper-cursor] [data-cursor="zoom"]  { cursor: zoom-in; }
  html[data-paper-cursor] [data-cursor="arrow"] { cursor: pointer; }
  html[data-paper-cursor] [data-cursor="drag"]  { cursor: grab; }
  html[data-paper-cursor] [data-cursor="drag"]:active { cursor: grabbing; }
}
```

- [ ] **Step 5: Create `src/_app/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "./tokens.css";
@import "./paper-noise.css";
@import "./stamps.css";
@import "./paper-cursor.css";

html, body { background: var(--c-bg); color: var(--c-ink); }
* { -webkit-tap-highlight-color: transparent; }
::selection { background: var(--c-burgundy-soft); color: var(--c-burgundy-deep); }
```

- [ ] **Step 6: Commit**

```bash
git add src/_app/styles
git commit -m "feat(design): css tokens, paper-noise, stamps, cursor, globals"
```

---

### Task 12: Fonts

**Files:**
- Create: `src/_app/fonts.ts`

- [ ] **Step 1: Implement**

```ts
import { Fraunces, Manrope, Caveat } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin", "cyrillic"], display: "swap",
  axes: ["opsz", "SOFT", "WONK"], variable: "--f-display-raw",
});
export const manrope = Manrope({
  subsets: ["latin", "cyrillic"], display: "swap", variable: "--f-body-raw",
});
export const caveat = Caveat({
  subsets: ["latin", "cyrillic"], display: "swap", variable: "--f-hand-raw",
});
```

- [ ] **Step 2: Commit**

```bash
git add src/_app/fonts.ts
git commit -m "feat(design): next/font google for Fraunces, Manrope, Caveat"
```

---

### Task 13: Root layout + minimal page

**Files:**
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { fraunces, manrope, caveat } from "@/_app/fonts";
import "@/_app/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Майстерня 157 — Архів учнівських робіт", template: "%s · Майстерня 157" },
  description: "Випуск №47 архіву Ліцею №157, Київ · Оболонь",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${fraunces.variable} ${manrope.variable} ${caveat.variable}`}>
      <body className="bg-bg font-body text-ink antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: `src/app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="font-display text-h1 text-burgundy">Майстерня 157</h1>
      <p className="text-lead text-ink-soft">Foundation boot.</p>
    </main>
  );
}
```

- [ ] **Step 3: Run `pnpm dev`, open http://localhost:3000 — verify Fraunces + paper-noise**

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat(app): root layout with fonts and minimal home"
```

---

### Task 14: shared/lib/cn helper (TDD)

**Files:**
- Create: `src/shared/lib/cn.ts`, `src/shared/lib/index.ts`, `tests/unit/lib/cn.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { cn } from "@/shared/lib/cn";

describe("cn", () => {
  it("merges class names", () => expect(cn("a", "b")).toBe("a b"));
  it("dedupes tailwind conflicts", () => expect(cn("p-2", "p-4")).toBe("p-4"));
  it("filters falsy", () => expect(cn("a", false, undefined, "b")).toBe("a b"));
});
```

- [ ] **Step 2: Run, expect FAIL**

`pnpm vitest run tests/unit/lib/cn.test.ts`

- [ ] **Step 3: Implement**

```ts
// src/shared/lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
```

```ts
// src/shared/lib/index.ts
export { cn } from "./cn";
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib tests/unit/lib
git commit -m "feat(shared/lib): cn helper"
```

---

### Task 15: shared/lib/money helpers (TDD)

**Files:**
- Create: `src/shared/lib/money.ts`, `tests/unit/lib/money.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { fmtUAH, mulMoney, sumMoney } from "@/shared/lib/money";

describe("money", () => {
  it("formats UAH", () => {
    expect(fmtUAH("850.00")).toMatch(/850/);
    expect(fmtUAH("850.00")).toMatch(/₴/);
  });
  it("multiplies precise", () => {
    expect(mulMoney("0.10", 3)).toBe("0.30");
    expect(mulMoney("19.99", 7)).toBe("139.93");
  });
  it("sums BigDecimal strings", () => {
    expect(sumMoney(["10.10", "20.20", "5.05"])).toBe("35.35");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// src/shared/lib/money.ts
import Decimal from "decimal.js";

Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

export const fmtUAH = (s: string) =>
  new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(new Decimal(s).toNumber());

export const mulMoney = (price: string, qty: number) =>
  new Decimal(price).mul(qty).toFixed(2);

export const sumMoney = (values: string[]) =>
  values.reduce((acc, v) => new Decimal(acc).plus(v), new Decimal(0)).toFixed(2);
```

Re-export from `src/shared/lib/index.ts`:
```ts
export * from "./money";
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/money.ts tests/unit/lib/money.test.ts src/shared/lib/index.ts
git commit -m "feat(shared/lib): money helpers (decimal.js)"
```

---

### Task 16: shared/lib/hash helper (TDD)

**Files:**
- Create: `src/shared/lib/hash.ts`, `tests/unit/lib/hash.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { hash } from "@/shared/lib/hash";

describe("hash", () => {
  it("deterministic for same logical object", () => {
    expect(hash({ x: 1, y: [1, 2] })).toBe(hash({ y: [1, 2], x: 1 }));
  });
  it("differs on content change", () => {
    expect(hash({ a: 1 })).not.toBe(hash({ a: 2 }));
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// src/shared/lib/hash.ts
function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const keys = Object.keys(v as object).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify((v as Record<string, unknown>)[k])}`).join(",")}}`;
}
export function hash(v: unknown): string {
  const s = stableStringify(v);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
```

Add to barrel: `export * from "./hash";`

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/lib/hash.ts tests/unit/lib/hash.test.ts src/shared/lib/index.ts
git commit -m "feat(shared/lib): stable object hash (FNV-1a)"
```

---

### Task 17: shared/hooks/use-intersection

**Files:**
- Create: `src/shared/hooks/use-intersection.ts`, `tests/component/hooks/use-intersection.test.tsx`

- [ ] **Step 1: Test**

```tsx
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useIntersection } from "@/shared/hooks/use-intersection";

describe("useIntersection", () => {
  it("returns false initially", () => {
    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(null);
      return useIntersection(ref);
    });
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```ts
// src/shared/hooks/use-intersection.ts
"use client";
import { useEffect, useState, type RefObject } from "react";

type Opts = { threshold?: number; rootMargin?: string; once?: boolean };

export function useIntersection(ref: RefObject<Element>, opts: Opts = {}): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      if (entry.isIntersecting) {
        setSeen(true);
        if (opts.once ?? true) obs.disconnect();
      } else if (!opts.once) setSeen(false);
    }, { threshold: opts.threshold ?? 0.4, rootMargin: opts.rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, opts.threshold, opts.rootMargin, opts.once]);
  return seen;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/hooks tests/component/hooks
git commit -m "feat(shared/hooks): useIntersection"
```

---

### Task 18: Stamp atom (TDD, signature element)

**Files:**
- Create: `src/shared/ui/stamp/{types.ts,stamp.tsx,index.ts}`, `tests/component/atoms/stamp.test.tsx`

- [ ] **Step 1: `src/shared/ui/stamp/types.ts`**

```ts
export type StampText =
  | "АРХІВ ЛІЦЕЮ 157" | "MAYSTERNYA · KYIV · 1957" | "СХВАЛЕНО КУРАТОРОМ"
  | "ЛІМІТОВАНА СЕРІЯ" | "ПЕРЕДАНО З ОБОЛОНІ" | "EST. 1957"
  | "ВРУЧЕНО" | "ВІДКРИТО" | "#listy" | "ВИПУСК ПОШКОДЖЕНО"
  | "🔐 АДМІН-ВЕРИФІКАЦІЯ" | "✓ ВІРНО";
export type StampShape = "circle" | "octagon" | "rect" | "soft";
export type StampRotation = -12 | -8 | -5 | -3 | 3 | 5 | 8 | 10;
export type StampColor = "burgundy" | "ink";
export type StampAnimateOn = "load" | "scroll" | "none";
```

- [ ] **Step 2: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stamp } from "@/shared/ui/stamp";

describe("Stamp", () => {
  it("renders text", () => {
    render(<Stamp text="EST. 1957" animateOn="none" />);
    expect(screen.getByText("EST. 1957")).toBeInTheDocument();
  });
  it("applies rotation as inline css var", () => {
    const { container } = render(<Stamp text="EST. 1957" rotation={-12} animateOn="none" />);
    const el = container.querySelector(".stamp") as HTMLElement;
    expect(el.style.getPropertyValue("--final-rotation")).toBe("-12deg");
  });
});
```

- [ ] **Step 3: Run, expect FAIL**

- [ ] **Step 4: Implement `src/shared/ui/stamp/stamp.tsx`**

```tsx
"use client";
import { useRef, type CSSProperties, type MouseEventHandler } from "react";
import { cn } from "@/shared/lib";
import { useIntersection } from "@/shared/hooks/use-intersection";
import type { StampText, StampShape, StampRotation, StampColor, StampAnimateOn } from "./types";

export type StampProps = {
  text: StampText; shape?: StampShape; size?: number; rotation?: StampRotation;
  color?: StampColor; animateOn?: StampAnimateOn; smudge?: boolean; trail?: boolean;
  delayMs?: number; className?: string; onClick?: MouseEventHandler<HTMLDivElement>;
};

export function Stamp({
  text, shape = "circle", size = 110, rotation = -8, color = "burgundy",
  animateOn = "scroll", smudge = true, trail = false, delayMs = 0, className, onClick,
}: StampProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useIntersection(ref, { threshold: 0.4, once: true });
  const shouldAnimate = animateOn === "load" || (animateOn === "scroll" && inView);

  const style: CSSProperties = {
    "--final-rotation": `${rotation}deg`,
    width: size, height: size,
    animationDelay: delayMs ? `${delayMs}ms` : undefined,
    color: color === "burgundy" ? "var(--c-stamp)" : "var(--c-ink)",
  } as CSSProperties;

  const interactive = !!onClick;
  return (
    <div
      ref={ref} onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      data-cursor={interactive ? "arrow" : undefined}
      data-smudge={smudge} data-trail={trail} data-animate-on={animateOn}
      className={cn(
        "stamp relative inline-flex items-center justify-center select-none",
        shouldAnimate && "animate-stamp-drop",
        interactive && "cursor-pointer",
        className,
      )}
      style={style}
    >
      <StampShape shape={shape} />
      <span className="absolute inset-0 flex items-center justify-center text-center px-2 font-display text-[11px] font-bold uppercase leading-tight tracking-[0.06em]">
        {text}
      </span>
    </div>
  );
}

function StampShape({ shape }: { shape: StampShape }) {
  const fid = `stamp-displace-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox="0 0 110 110" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="2.5" />
        </filter>
      </defs>
      {shape === "circle" && <circle cx="55" cy="55" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" filter={`url(#${fid})`} />}
      {shape === "octagon" && <polygon points="33,5 77,5 105,33 105,77 77,105 33,105 5,77 5,33" fill="none" stroke="currentColor" strokeWidth="1.5" filter={`url(#${fid})`} />}
      {shape === "rect" && <rect x="6" y="20" width="98" height="70" fill="none" stroke="currentColor" strokeWidth="1.5" filter={`url(#${fid})`} />}
      {shape === "soft" && <rect x="10" y="10" width="90" height="90" rx="20" ry="20" fill="none" stroke="currentColor" strokeWidth="1.5" filter={`url(#${fid})`} />}
    </svg>
  );
}
```

- [ ] **Step 5: `src/shared/ui/stamp/index.ts`**

```ts
export { Stamp } from "./stamp";
export type { StampProps } from "./stamp";
export type { StampText, StampShape, StampRotation, StampColor, StampAnimateOn } from "./types";
```

- [ ] **Step 6: Run, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/shared/ui/stamp tests/component/atoms/stamp.test.tsx
git commit -m "feat(shared/ui): Stamp atom"
```

---

### Task 19: PillButton (TDD)

**Files:**
- Create: `src/shared/ui/pill-button/{pill-button.tsx,index.ts}`, `tests/component/atoms/pill-button.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PillButton } from "@/shared/ui/pill-button";

describe("PillButton", () => {
  it("renders children", () => {
    render(<PillButton>Click</PillButton>);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });
  it("fires onClick", async () => {
    const fn = vi.fn();
    render(<PillButton onClick={fn}>Hit</PillButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });
  it("disables when loading", () => {
    render(<PillButton loading>Send</PillButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// src/shared/ui/pill-button/pill-button.tsx
"use client";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib";

const pill = cva(
  "inline-flex items-center justify-center gap-2 rounded-pill font-body font-semibold tracking-tight transition-colors duration-d3 ease-paper disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:    "bg-burgundy text-white hover:bg-green",
        "outline-d":"border border-burgundy text-burgundy hover:bg-burgundy hover:text-white",
        "outline-l":"border border-white text-white hover:bg-white hover:text-burgundy",
        ghost:      "bg-transparent text-burgundy hover:text-burgundy-deep",
      },
      size: {
        s:  "h-9 px-4 text-small",
        m:  "h-12 px-6 text-body",
        l:  "h-14 px-7 text-body",
        xl: "h-16 px-8 text-lead",
      },
    },
    defaultVariants: { variant: "primary", size: "m" },
  },
);

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof pill> & {
    asChild?: boolean; loading?: boolean; startIcon?: ReactNode; endIcon?: ReactNode;
  };

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(function PillButton(
  { className, variant, size, asChild, loading, startIcon, endIcon, disabled, children, ...rest }, ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref as never}
      data-cursor="arrow"
      disabled={disabled || loading}
      className={cn(pill({ variant, size }), className)}
      {...rest}
    >
      {loading ? <Spinner /> : startIcon}
      <span>{children}</span>
      {endIcon}
    </Comp>
  );
});

function Spinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />;
}
```

```ts
// src/shared/ui/pill-button/index.ts
export { PillButton } from "./pill-button";
export type { PillButtonProps } from "./pill-button";
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/pill-button tests/component/atoms/pill-button.test.tsx
git commit -m "feat(shared/ui): PillButton with cva variants"
```

---

### Task 20: EditorialLabel (TDD)

**Files:** `src/shared/ui/editorial-label/{editorial-label.tsx,index.ts}`, `tests/component/atoms/editorial-label.test.tsx`

- [ ] **Step 1: Test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorialLabel } from "@/shared/ui/editorial-label";

describe("EditorialLabel", () => {
  it("renders uppercase children", () => {
    render(<EditorialLabel>Автор травня</EditorialLabel>);
    const el = screen.getByText("Автор травня");
    expect(el).toBeInTheDocument();
    expect(el.className).toMatch(/uppercase/);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement**

```tsx
// src/shared/ui/editorial-label/editorial-label.tsx
import { cn } from "@/shared/lib";
import type { ReactNode, ElementType } from "react";

export type EditorialLabelProps = {
  children: ReactNode; color?: "green" | "burgundy" | "white";
  as?: ElementType; className?: string;
};

const colorMap = {
  green:    "text-green before:bg-green",
  burgundy: "text-burgundy before:bg-burgundy",
  white:    "text-white before:bg-white",
} as const;

export function EditorialLabel({ children, color = "green", as: Tag = "span", className }: EditorialLabelProps) {
  return (
    <Tag
      className={cn(
        "relative inline-flex items-center pl-3 text-label font-body uppercase",
        "before:absolute before:left-0 before:top-1/2 before:h-4 before:w-1 before:-translate-y-1/2",
        colorMap[color],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
```

```ts
// src/shared/ui/editorial-label/index.ts
export { EditorialLabel } from "./editorial-label";
export type { EditorialLabelProps } from "./editorial-label";
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/ui/editorial-label tests/component/atoms/editorial-label.test.tsx
git commit -m "feat(shared/ui): EditorialLabel"
```

---

### Task 21: EditorialDivider

**Files:** `src/shared/ui/editorial-divider/{editorial-divider.tsx,index.ts}`

- [ ] **Step 1: Implement**

```tsx
// src/shared/ui/editorial-divider/editorial-divider.tsx
import { cn } from "@/shared/lib";

export type EditorialDividerProps = {
  variant?: "dashed" | "stamp-line" | "number" | "marks";
  number?: number;
  className?: string;
};

export function EditorialDivider({ variant = "dashed", number, className }: EditorialDividerProps) {
  if (variant === "dashed") return <hr className={cn("border-0 border-t-[1.5px] border-dashed border-ink/40", className)} />;
  if (variant === "marks")
    return (
      <div className={cn("flex items-center justify-center gap-2 py-4", className)}>
        <span className="h-4 w-1 bg-burgundy" />
        <span className="h-4 w-1 bg-burgundy" />
        <span className="h-4 w-1 bg-burgundy" />
      </div>
    );
  if (variant === "number")
    return (
      <div className={cn("flex items-center gap-3 py-4 text-small text-ink-soft", className)}>
        <span className="h-px flex-1 bg-line-strong" />
        <span className="font-body">{String(number ?? 0).padStart(2, "0")}</span>
        <span className="h-px flex-1 bg-line-strong" />
      </div>
    );
  return (
    <div className={cn("flex items-center gap-3 py-4", className)}>
      <span className="h-px flex-1 bg-line-strong" />
      <span className="text-burgundy">★</span>
      <span className="h-px flex-1 bg-line-strong" />
    </div>
  );
}
```

```ts
// src/shared/ui/editorial-divider/index.ts
export { EditorialDivider } from "./editorial-divider";
export type { EditorialDividerProps } from "./editorial-divider";
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/ui/editorial-divider
git commit -m "feat(shared/ui): EditorialDivider 4 variants"
```

---

### Task 22: FormField + Input + Textarea (TDD)

**Files:** `src/shared/ui/form-field/{form-field.tsx,input.tsx,textarea.tsx,index.ts}`, `tests/component/atoms/form-field.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField, Input } from "@/shared/ui/form-field";

describe("FormField", () => {
  it("links label htmlFor", () => {
    render(<FormField name="email" label="Email"><Input /></FormField>);
    const input = screen.getByLabelText("Email");
    expect(input.id).toBe("email");
  });
  it("shows error and aria-invalid", () => {
    render(<FormField name="email" label="Email" error="Bad"><Input /></FormField>);
    expect(screen.getByText("Bad")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `input.tsx`**

```tsx
"use client";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input ref={ref} className={cn(
        "h-14 w-full rounded-md border border-line bg-bg-card px-4 text-body text-ink placeholder:text-ink-fade",
        "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-burgundy",
        "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
        className,
      )} {...rest} />
    );
  },
);
```

- [ ] **Step 4: Implement `textarea.tsx`**

```tsx
"use client";
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea ref={ref} className={cn(
        "min-h-[120px] w-full resize-y rounded-md border border-line bg-bg-card p-4 text-body text-ink placeholder:text-ink-fade",
        "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-burgundy",
        "aria-[invalid=true]:border-error aria-[invalid=true]:ring-error",
        className,
      )} {...rest} />
    );
  },
);
```

- [ ] **Step 5: Implement `form-field.tsx`**

```tsx
"use client";
import { cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/shared/lib";
import { EditorialLabel } from "@/shared/ui/editorial-label";

export type FormFieldProps = {
  name: string; label: string; hint?: string; error?: string;
  required?: boolean; children: ReactElement; className?: string;
};

export function FormField({ name, label, hint, error, required, children, className }: FormFieldProps) {
  const id = name;
  const errorId = `err-${name}`;
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id, name,
        "aria-invalid": !!error || undefined,
        "aria-describedby": error ? errorId : undefined,
      })
    : children;
  return (
    <div id={`field-${name}`} className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block">
        <EditorialLabel as="span" color="burgundy">
          {label}{required && <span className="ml-0.5 text-error">*</span>}
        </EditorialLabel>
      </label>
      {child}
      {error
        ? <p id={errorId} className="text-small text-error">{error}</p>
        : hint
          ? <p className="text-small text-ink-fade">{hint}</p>
          : null}
    </div>
  );
}
```

```ts
// src/shared/ui/form-field/index.ts
export { FormField } from "./form-field";
export { Input } from "./input";
export { Textarea } from "./textarea";
export type { FormFieldProps } from "./form-field";
```

- [ ] **Step 6: Run, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/shared/ui/form-field tests/component/atoms/form-field.test.tsx
git commit -m "feat(shared/ui): FormField + Input + Textarea"
```

---

### Task 23: Decorative atoms bundle (Polaroid, PhotoPrint, PaperClip, Sticker, PostageStamp, HandArrow, MuseumLabel, Confetti)

**Files (one folder per atom, each with `<name>.tsx` + `index.ts`):**
- `src/shared/ui/polaroid/`, `src/shared/ui/photo-print/`, `src/shared/ui/paper-clip/`,
  `src/shared/ui/sticker/`, `src/shared/ui/postage-stamp/`, `src/shared/ui/hand-arrow/`,
  `src/shared/ui/museum-label/`, `src/shared/ui/confetti/`

- [ ] **Step 1: `paper-clip.tsx`**

```tsx
import { cn } from "@/shared/lib";
export type PaperClipProps = { className?: string; rotation?: number };
export function PaperClip({ className, rotation = -8 }: PaperClipProps) {
  return (
    <svg width="32" height="56" viewBox="0 0 32 56"
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn("drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]", className)} aria-hidden>
      <defs>
        <linearGradient id="clip-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c7c7c7" />
          <stop offset="50%" stopColor="#f0f0f0" />
          <stop offset="100%" stopColor="#9c9c9c" />
        </linearGradient>
      </defs>
      <path d="M8 4 Q4 4 4 8 L4 48 Q4 52 8 52 L24 52 Q28 52 28 48 L28 12 Q28 8 24 8 L12 8 Q8 8 8 12 L8 44"
        fill="none" stroke="url(#clip-grad)" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
```

```ts
// index.ts
export { PaperClip } from "./paper-clip";
export type { PaperClipProps } from "./paper-clip";
```

- [ ] **Step 2: `polaroid.tsx`**

```tsx
"use client";
import Image from "next/image";
import { cn } from "@/shared/lib";
import { PaperClip } from "@/shared/ui/paper-clip";

export type PolaroidProps = {
  src: string; alt: string; caption?: string;
  rotation?: -7|-5|-3|-1|2|4|6;
  ratio?: "4/5" | "1/1";
  paperClip?: boolean;
  hoverInteractive?: boolean;
  className?: string;
};
export function Polaroid({ src, alt, caption, rotation = -3, ratio = "4/5", paperClip, hoverInteractive = true, className }: PolaroidProps) {
  return (
    <div style={{ transform: `rotate(${rotation}deg)` }} className={cn(
      "relative inline-block bg-white p-3 pb-9 shadow-photo transition-transform duration-d3 ease-spring",
      hoverInteractive && "hover:rotate-0 hover:scale-[1.04]",
      className,
    )}>
      {paperClip && <PaperClip className="absolute -top-3 right-6" />}
      <div className={cn("relative overflow-hidden", ratio === "4/5" ? "aspect-[4/5] w-60" : "aspect-square w-60")}>
        <Image src={src} alt={alt} fill sizes="240px" className="object-cover" />
      </div>
      {caption && <p className="mt-3 text-center font-hand text-hand-s text-ink">{caption}</p>}
    </div>
  );
}
```

```ts
// index.ts
export { Polaroid } from "./polaroid";
export type { PolaroidProps } from "./polaroid";
```

- [ ] **Step 3: `photo-print.tsx`**

```tsx
"use client";
import Image from "next/image";
import { cn } from "@/shared/lib";
import { PaperClip } from "@/shared/ui/paper-clip";

export type PhotoPrintProps = {
  src: string; alt: string;
  ratio?: "4/5" | "3/4" | "1/1" | "16/9";
  paperClip?: boolean; grainy?: boolean; className?: string;
};
const ratioMap = { "4/5": "aspect-[4/5]", "3/4": "aspect-[3/4]", "1/1": "aspect-square", "16/9": "aspect-video" } as const;
export function PhotoPrint({ src, alt, ratio = "4/5", paperClip, grainy = true, className }: PhotoPrintProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[4px] shadow-photo", ratioMap[ratio], grainy && "photo-grainy", className)}>
      {paperClip && <PaperClip className="absolute -top-3 right-6 z-10" />}
      <Image src={src} alt={alt} fill className="object-cover" />
    </div>
  );
}
```

```ts
// index.ts
export { PhotoPrint } from "./photo-print";
export type { PhotoPrintProps } from "./photo-print";
```

- [ ] **Step 4: `sticker.tsx`**

```tsx
"use client";
import { useRef, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/shared/lib";
import { useIntersection } from "@/shared/hooks/use-intersection";

export type StickerProps = {
  color?: "yellow" | "blue"; rotation?: number;
  signature?: string; children: ReactNode; className?: string;
};
export function Sticker({ color = "yellow", rotation = -3, signature, children, className }: StickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useIntersection(ref, { threshold: 0.3 });
  return (
    <div ref={ref}
      style={{ "--final-rotation": `${rotation}deg` } as CSSProperties}
      className={cn(
        "relative inline-block w-[280px] p-5 shadow-[0_12px_24px_rgba(0,0,0,0.08)]",
        color === "yellow" ? "bg-bg-yellow" : "bg-bg-blue",
        "[clip-path:polygon(0_0,100%_0,100%_100%,12%_100%,0_88%)]",
        inView ? "animate-tilt-into-place" : "opacity-0",
        className,
      )}>
      <div className="font-hand text-hand-m text-ink">{children}</div>
      {signature && <p className="mt-3 font-hand text-hand-s text-green">{signature}</p>}
    </div>
  );
}
```

```ts
// index.ts
export { Sticker } from "./sticker";
export type { StickerProps } from "./sticker";
```

- [ ] **Step 5: `postage-stamp.tsx`**

```tsx
import { cn } from "@/shared/lib";

export type PostageStampProps = { className?: string; size?: number };
export function PostageStamp({ className, size = 120 }: PostageStampProps) {
  return (
    <div className={cn("relative flex flex-col items-center justify-center bg-burgundy text-white shadow-paper", className)}
      style={{
        width: size, height: (size * 140) / 120,
        clipPath:
          "polygon(0% 5%,5% 0%,15% 5%,25% 0%,35% 5%,45% 0%,55% 5%,65% 0%,75% 5%,85% 0%,95% 5%,100% 15%,95% 25%,100% 35%,95% 45%,100% 55%,95% 65%,100% 75%,95% 85%,100% 95%,85% 100%,75% 95%,65% 100%,55% 95%,45% 100%,35% 95%,25% 100%,15% 95%,5% 100%,0% 95%,5% 85%,0% 75%,5% 65%,0% 55%,5% 45%,0% 35%,5% 25%,0% 15%)",
      }}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden>
        <circle cx="28" cy="28" r="22" fill="none" stroke="white" strokeWidth="1.5" />
        <text x="28" y="34" textAnchor="middle" fill="white" fontFamily="serif" fontSize="14" fontStyle="italic">157</text>
      </svg>
      <p className="mt-1 font-display italic" style={{ fontSize: 11 }}>УКРАЇНА · 1957–2026</p>
    </div>
  );
}
```

```ts
// index.ts
export { PostageStamp } from "./postage-stamp";
export type { PostageStampProps } from "./postage-stamp";
```

- [ ] **Step 6: `hand-arrow.tsx`**

```tsx
"use client";
import { useRef } from "react";
import { cn } from "@/shared/lib";
import { useIntersection } from "@/shared/hooks/use-intersection";

export type HandArrowProps = {
  dir?: "↗"|"↘"|"↖"|"↙"; size?: "s"|"l"; color?: "burgundy"|"green";
  drawOnReveal?: boolean; className?: string;
};
const rotMap = { "↗": 0, "↘": 90, "↙": 180, "↖": 270 } as const;
const sizeMap = { s: { w: 40, h: 20 }, l: { w: 120, h: 60 } } as const;

export function HandArrow({ dir = "↗", size = "s", color = "burgundy", drawOnReveal, className }: HandArrowProps) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useIntersection(ref as never, { threshold: 0.5 });
  const dim = sizeMap[size];
  const stroke = color === "burgundy" ? "var(--c-burgundy)" : "var(--c-green)";
  return (
    <svg ref={ref} width={dim.w} height={dim.h} viewBox="0 0 120 60"
      style={{ transform: `rotate(${rotMap[dir]}deg)` }}
      className={cn(className)} aria-hidden>
      <path d="M5 30 Q40 28 100 30 M85 18 L100 30 L85 42"
        fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={drawOnReveal ? 200 : undefined}
        strokeDashoffset={drawOnReveal ? (inView ? 0 : 200) : undefined}
        style={{ transition: "stroke-dashoffset 600ms var(--ease-paper)" }} />
    </svg>
  );
}
```

```ts
// index.ts
export { HandArrow } from "./hand-arrow";
export type { HandArrowProps } from "./hand-arrow";
```

- [ ] **Step 7: `museum-label.tsx`**

```tsx
import { cn } from "@/shared/lib";
import { fmtUAH } from "@/shared/lib/money";

export type MuseumLabelProps = {
  title: string; author: string; meta?: string; priceUah: string; className?: string;
};
export function MuseumLabel({ title, author, meta, priceUah, className }: MuseumLabelProps) {
  return (
    <div className={cn("w-[220px] border-y border-ink-fade py-3 text-ink", className)}>
      <p className="font-display text-lead italic">{title}</p>
      <p className="text-small font-medium">{author}</p>
      {meta && <p className="text-small italic text-ink-soft">{meta}</p>}
      <hr className="my-2 w-1/3 border-t border-ink-fade" />
      <p className="text-h3 font-bold text-burgundy">{fmtUAH(priceUah)}</p>
    </div>
  );
}
```

```ts
// index.ts
export { MuseumLabel } from "./museum-label";
export type { MuseumLabelProps } from "./museum-label";
```

- [ ] **Step 8: `confetti.tsx`**

```tsx
"use client";
import { useEffect, useState, type CSSProperties } from "react";

export type ConfettiProps = { count?: number; trigger?: boolean; onDone?: () => void };
const palette = ["var(--c-burgundy)", "var(--c-green)", "var(--c-bg-yellow)"];

export function Confetti({ count = 12, trigger, onDone }: ConfettiProps) {
  const [pieces, setPieces] = useState<number[]>([]);
  useEffect(() => {
    if (!trigger) return;
    setPieces(Array.from({ length: count }, (_, i) => i));
    const t = setTimeout(() => { setPieces([]); onDone?.(); }, 1200);
    return () => clearTimeout(t);
  }, [trigger, count, onDone]);
  if (!pieces.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {pieces.map((i) => {
        const angle = (Math.random() - 0.5) * 120;
        const dx = (Math.random() - 0.5) * 240;
        const color = palette[i % palette.length];
        return (
          <span key={i} style={{
            position: "absolute", left: "50%", top: "50%", width: 8, height: 10,
            background: color, clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
            animation: "confetti 1200ms cubic-bezier(0.25,1,0.5,1) forwards",
            ["--dx" as never]: `${dx}px`,
            ["--rot" as never]: `${angle}deg`,
          } as CSSProperties} />
        );
      })}
      <style>{`
        @keyframes confetti {
          0%   { transform: translate(-50%, -50%) rotate(0); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% - 120px)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
```

```ts
// index.ts
export { Confetti } from "./confetti";
export type { ConfettiProps } from "./confetti";
```

- [ ] **Step 9: Verify**

```bash
pnpm typecheck && pnpm vitest run
```

- [ ] **Step 10: Commit**

```bash
git add src/shared/ui
git commit -m "feat(shared/ui): decorative atoms bundle"
```

---

### Task 24: Layout primitives (Container, Section, Stack, Row, Grid)

**Files:** `src/shared/ui/layout/{container.tsx,section.tsx,stack.tsx,row.tsx,grid.tsx,index.ts}`

- [ ] **Step 1: All five files**

```tsx
// container.tsx
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function Container({ narrow, className, children }: { narrow?: boolean; className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full px-5 md:px-6", narrow ? "max-w-[920px]" : "max-w-[1280px]", className)}>{children}</div>;
}
```

```tsx
// section.tsx
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
const tone = { bg: "bg-bg", warm: "bg-bg-warm", noir: "bg-bg-noir text-white", card: "bg-bg-card" } as const;
const pad = { default: "py-16 md:py-[120px]", tight: "py-10 md:py-16", wide: "py-20 md:py-[160px]" } as const;
export function Section({ tone: t = "bg", pad: p = "default", className, children }:
  { tone?: keyof typeof tone; pad?: keyof typeof pad; className?: string; children: ReactNode }) {
  return <section className={cn("relative", tone[t], pad[p], className)}>{children}</section>;
}
```

```tsx
// stack.tsx
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
const gapMap = { 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6", 7: "gap-7" } as const;
export function Stack({ gap = 5, className, children }: { gap?: keyof typeof gapMap; className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col", gapMap[gap], className)}>{children}</div>;
}
```

```tsx
// row.tsx
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
const gapMap = { 3: "gap-3", 4: "gap-4", 5: "gap-5", 6: "gap-6", 7: "gap-7" } as const;
const alignMap = { start: "items-start", center: "items-center", end: "items-end" } as const;
const justifyMap = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between" } as const;
export function Row({
  gap = 4, align = "center", justify = "start", className, children,
}: { gap?: keyof typeof gapMap; align?: keyof typeof alignMap; justify?: keyof typeof justifyMap; className?: string; children: ReactNode }) {
  return <div className={cn("flex", gapMap[gap], alignMap[align], justifyMap[justify], className)}>{children}</div>;
}
```

```tsx
// grid.tsx
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function Grid({ cols = 12, gap = 6, className, children }: { cols?: number; gap?: 4|5|6|7; className?: string; children: ReactNode }) {
  const colMap: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 6: "grid-cols-6", 12: "grid-cols-12" };
  const gapMap: Record<number, string> = { 4: "gap-4", 5: "gap-5", 6: "gap-6", 7: "gap-7" };
  return <div className={cn("grid", colMap[cols] ?? "grid-cols-12", gapMap[gap], className)}>{children}</div>;
}
```

```ts
// index.ts
export { Container } from "./container";
export { Section } from "./section";
export { Stack } from "./stack";
export { Row } from "./row";
export { Grid } from "./grid";
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/ui/layout
git commit -m "feat(shared/ui): layout primitives"
```

---

### Task 25: Themed Dialog (Radix)

**Files:** `src/shared/ui/dialog/{dialog.tsx,index.ts}`

- [ ] **Step 1: Implement**

```tsx
// dialog.tsx
"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-bg-noir/40 backdrop-blur-sm data-[state=open]:animate-page-turn" />
      <DialogPrimitive.Content className={cn(
        "fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-md bg-bg-card p-6 shadow-deep",
        "data-[state=open]:animate-page-turn",
        className,
      )}>
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 text-ink-soft hover:text-ink" aria-label="Закрити">
          <X size={20} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <DialogPrimitive.Title className={cn("font-display text-h3 text-burgundy", className)}>{children}</DialogPrimitive.Title>;
}
export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <DialogPrimitive.Description className={cn("mt-2 text-body text-ink-soft", className)}>{children}</DialogPrimitive.Description>;
}
```

```ts
// index.ts
export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription } from "./dialog";
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/ui/dialog
git commit -m "feat(shared/ui): themed Dialog"
```

---

### Task 26: Toast wrapper (Sonner)

**Files:** `src/shared/ui/toast/{toast.tsx,index.ts}`

- [ ] **Step 1: Implement**

```tsx
// toast.tsx
"use client";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
export const toast = sonnerToast;
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      duration={5000}
      toastOptions={{
        className: "rounded-md border-l-4 border-burgundy bg-bg-card text-ink shadow-paper font-body",
        descriptionClassName: "text-small text-ink-soft",
      }}
    />
  );
}
```

```ts
// index.ts
export { toast, Toaster } from "./toast";
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/ui/toast
git commit -m "feat(shared/ui): toast wrapper"
```

---

### Task 27: shared/ui barrel

**Files:** `src/shared/ui/index.ts`

- [ ] **Step 1: Implement**

```ts
export * from "./stamp";
export * from "./pill-button";
export * from "./editorial-label";
export * from "./editorial-divider";
export * from "./form-field";
export * from "./polaroid";
export * from "./photo-print";
export * from "./paper-clip";
export * from "./sticker";
export * from "./postage-stamp";
export * from "./hand-arrow";
export * from "./museum-label";
export * from "./confetti";
export * from "./layout";
export * from "./dialog";
export * from "./toast";
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/ui/index.ts
git commit -m "chore(shared/ui): barrel"
```

---

### Task 28: /_kitchen showcase

**Files:** `src/pages/kitchen/ui/kitchen-screen.tsx`, `src/pages/kitchen/index.ts`, `src/app/_kitchen/page.tsx`

- [ ] **Step 1: `src/pages/kitchen/ui/kitchen-screen.tsx`**

```tsx
"use client";
import { useState } from "react";
import {
  Stamp, PillButton, EditorialLabel, EditorialDivider,
  FormField, Input, Textarea,
  Polaroid, PhotoPrint, PaperClip, Sticker, PostageStamp, HandArrow, MuseumLabel, Confetti,
  Container, Section, Stack, Row, Grid,
} from "@/shared/ui";

export function KitchenScreen() {
  const [boom, setBoom] = useState(false);
  return (
    <Container>
      <Section pad="tight">
        <Stack gap={6}>
          <h1 className="font-display text-display italic text-burgundy">/_kitchen</h1>
          <p className="text-lead text-ink-soft">Atom showcase. Dev-only.</p>

          <EditorialDivider variant="number" number={1} />
          <EditorialLabel>Stamps</EditorialLabel>
          <Row gap={6}>
            <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
            <Stamp text="АРХІВ ЛІЦЕЮ 157" shape="octagon" rotation={5} animateOn="load" />
            <Stamp text="ВРУЧЕНО" shape="rect" rotation={-3} animateOn="load" trail />
          </Row>

          <EditorialDivider variant="number" number={2} />
          <EditorialLabel>Pill buttons</EditorialLabel>
          <Row gap={4}>
            <PillButton variant="primary">Primary</PillButton>
            <PillButton variant="outline-d">Outline</PillButton>
            <PillButton variant="ghost">Ghost</PillButton>
            <PillButton variant="primary" loading>Loading</PillButton>
          </Row>

          <EditorialDivider variant="number" number={3} />
          <EditorialLabel>Form fields</EditorialLabel>
          <Stack gap={5}>
            <FormField name="email-demo" label="Email" required hint="we don't spam"><Input placeholder="hello@example.com" /></FormField>
            <FormField name="bio-demo" label="Біо" error="Замало"><Textarea /></FormField>
          </Stack>

          <EditorialDivider variant="number" number={4} />
          <EditorialLabel>Decorative</EditorialLabel>
          <Grid cols={3} gap={6}>
            <Polaroid src="/textures/paper-noise.svg" alt="" caption="Маша 7-Б" />
            <PhotoPrint src="/textures/paper-noise.svg" alt="" paperClip />
            <PostageStamp />
          </Grid>
          <Row gap={6}>
            <Sticker color="yellow" signature="— Олена, мама учня 5-Б">Дякую за чудову роботу!</Sticker>
            <HandArrow dir="↗" size="l" drawOnReveal />
            <MuseumLabel title="Літо в Карпатах" author="Олена Сидоренко, 8-А" meta="Акварель, 30×40, 2025" priceUah="1200.00" />
          </Row>

          <EditorialDivider variant="marks" />
          <PillButton onClick={() => setBoom((b) => !b)}>Confetti!</PillButton>
          <Confetti trigger={boom} onDone={() => setBoom(false)} />
        </Stack>
      </Section>
    </Container>
  );
}
```

- [ ] **Step 2: `src/pages/kitchen/index.ts`**

```ts
export { KitchenScreen } from "./ui/kitchen-screen";
```

- [ ] **Step 3: `src/app/_kitchen/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { KitchenScreen } from "@/pages/kitchen";
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <KitchenScreen />;
}
```

- [ ] **Step 4: Run dev**

```bash
pnpm dev
```

Open http://localhost:3000/_kitchen — verify all atoms render.

- [ ] **Step 5: Commit**

```bash
git add src/pages/kitchen src/app/_kitchen
git commit -m "feat(pages/kitchen): atom showcase at /_kitchen"
```

---

### Phase 1 Checkpoint

- [ ] **Run pnpm typecheck && pnpm lint && pnpm vitest run && pnpm build**

Expected: all PASS, build succeeds.
---

## Phase 2 — API infrastructure (`shared/api`)

### Task 29: Constants + types

**Files:** `src/shared/api/constants.ts`, `src/shared/api/types.ts`

- [ ] **Step 1: `src/shared/api/constants.ts`**

```ts
import { publicEnv } from "@/shared/config/env";

export const API_BASE = publicEnv.NEXT_PUBLIC_API_BASE;
export const ACCESS_TOKEN_TTL_SEC = 900;
export const REFRESH_TOKEN_TTL_DAYS = 7;
export const PRESIGNED_UPLOAD_TTL_SEC = 300;
export const IDEMPOTENCY_REPLAY_WINDOW_HOURS = 24;
export const REFRESH_PROACTIVE_MS = 60_000;
```

- [ ] **Step 2: `src/shared/api/types.ts`**

```ts
export type Role = "STUDENT" | "PARENT" | "ADMIN";

export type TokenSnapshot = {
  accessToken: string;
  userId: string;
  role: Role;
  expiresAt: number; // ms epoch
};

export type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  invalidParams?: Array<{ field: string; reason: string }>;
};

export type Page<T> = {
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

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/constants.ts src/shared/api/types.ts
git commit -m "feat(shared/api): constants and shared types"
```

---

### Task 30: Auth-token holder (TDD)

**Files:** `src/shared/api/auth-token.ts`, `tests/unit/api/auth-token.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getAccessToken, getSnapshot, setSnapshot, subscribe } from "@/shared/api/auth-token";

describe("auth-token", () => {
  beforeEach(() => setSnapshot(null));

  it("returns null when not set", () => {
    expect(getAccessToken()).toBeNull();
    expect(getSnapshot()).toBeNull();
  });

  it("stores and retrieves snapshot", () => {
    setSnapshot({ accessToken: "tok", userId: "u1", role: "STUDENT", expiresAt: 1 });
    expect(getAccessToken()).toBe("tok");
    expect(getSnapshot()?.userId).toBe("u1");
  });

  it("notifies subscribers", () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    setSnapshot({ accessToken: "x", userId: "u", role: "ADMIN", expiresAt: 1 });
    expect(fn).toHaveBeenCalledOnce();
    unsub();
    setSnapshot(null);
    expect(fn).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `src/shared/api/auth-token.ts`**

```ts
import type { TokenSnapshot } from "./types";

let snapshot: TokenSnapshot | null = null;
const listeners = new Set<(s: TokenSnapshot | null) => void>();

export const getAccessToken = (): string | null => snapshot?.accessToken ?? null;
export const getSnapshot = (): TokenSnapshot | null => snapshot;

export function setSnapshot(s: TokenSnapshot | null): void {
  snapshot = s;
  listeners.forEach((fn) => fn(s));
}

export function subscribe(fn: (s: TokenSnapshot | null) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/auth-token.ts tests/unit/api/auth-token.test.ts
git commit -m "feat(shared/api): module-level auth-token holder with pub/sub"
```

---

### Task 31: ApiError + ProblemDetail

**Files:** `src/shared/api/errors.ts`, `tests/unit/api/errors.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { ApiError } from "@/shared/api/errors";

describe("ApiError", () => {
  it("isValidation for 400", () => {
    const e = new ApiError({ type: "", title: "", status: 400, detail: "", instance: "", timestamp: "" });
    expect(e.isValidation).toBe(true);
    expect(e.isUnauthorized).toBe(false);
  });
  it("isTransient for 5xx", () => {
    const e = new ApiError({ type: "", title: "", status: 503, detail: "", instance: "", timestamp: "" });
    expect(e.isTransient).toBe(true);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `src/shared/api/errors.ts`**

```ts
import type { ProblemDetail } from "./types";

export type { ProblemDetail };

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetail) {
    super(problem.title || `HTTP ${problem.status}`);
    this.name = "ApiError";
  }
  get isValidation()   { return this.problem.status === 400; }
  get isUnauthorized() { return this.problem.status === 401; }
  get isForbidden()    { return this.problem.status === 403; }
  get isNotFound()     { return this.problem.status === 404; }
  get isConflict()     { return this.problem.status === 409; }
  get isUnsupported()  { return this.problem.status === 415; }
  get isTransient()    { return this.problem.status >= 500; }
}

export function fallbackProblem(res: { status: number; statusText?: string }): ProblemDetail {
  return {
    type: "about:blank",
    title: res.statusText || `HTTP ${res.status}`,
    status: res.status,
    detail: "",
    instance: "",
    timestamp: new Date().toISOString(),
  };
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/errors.ts tests/unit/api/errors.test.ts
git commit -m "feat(shared/api): ApiError + ProblemDetail + fallback helper"
```

---

### Task 32: Error messages (uk localization)

**Files:** `src/shared/api/error-messages.ts`, `tests/unit/api/error-messages.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from "vitest";
import { messageFor } from "@/shared/api/error-messages";
import { ApiError } from "@/shared/api/errors";

describe("messageFor", () => {
  it("returns uk text for 401", () => {
    const e = new ApiError({ type: "", title: "x", status: 401, detail: "", instance: "", timestamp: "" });
    expect(messageFor(e)).toMatch(/Сесія/i);
  });
  it("falls back to title for unknown", () => {
    const e = new ApiError({ type: "", title: "X", status: 418, detail: "", instance: "", timestamp: "" });
    expect(messageFor(e)).toBe("X");
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `src/shared/api/error-messages.ts`**

```ts
import type { ApiError } from "./errors";
import type { ProblemDetail } from "./types";

const messages: Record<number, (p: ProblemDetail) => string> = {
  400: (p) => p.invalidParams?.length
    ? `Перевірте поля: ${p.invalidParams.map((x) => x.field).join(", ")}`
    : (p.detail || "Помилка валідації даних"),
  401: () => "Сесія завершена. Увійдіть знову.",
  403: () => "Немає прав на цю дію.",
  404: () => "Не знайдено.",
  409: (p) => p.detail || "Конфлікт стану. Перезавантажте сторінку.",
  415: () => "Формат файлу не відповідає типу. Виберіть jpeg/png/webp.",
  503: () => "Сервер тимчасово недоступний. Спробуйте за хвилину.",
};

export const messageFor = (e: ApiError): string =>
  messages[e.problem.status]?.(e.problem) ?? e.problem.title;
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/error-messages.ts tests/unit/api/error-messages.test.ts
git commit -m "feat(shared/api): uk localization for ProblemDetail statuses"
```

---

### Task 33: api-error-to-form mapper (TDD)

**Files:** `src/shared/api/api-error-to-form.ts`, `tests/unit/api/api-error-to-form.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, vi } from "vitest";
import { applyApiErrorToForm } from "@/shared/api/api-error-to-form";
import { ApiError } from "@/shared/api/errors";

describe("applyApiErrorToForm", () => {
  it("maps invalidParams to setError, returns true", () => {
    const setError = vi.fn();
    const err = new ApiError({
      type: "", title: "Validation", status: 400, detail: "", instance: "", timestamp: "",
      invalidParams: [{ field: "email", reason: "Bad" }],
    });
    expect(applyApiErrorToForm(err, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith("email", { type: "server", message: "Bad" });
  });
  it("returns false for non-validation", () => {
    const setError = vi.fn();
    const err = new ApiError({ type: "", title: "x", status: 503, detail: "", instance: "", timestamp: "" });
    expect(applyApiErrorToForm(err, setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `src/shared/api/api-error-to-form.ts`**

```ts
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { ApiError } from "./errors";

export function applyApiErrorToForm<T extends FieldValues>(
  err: unknown, setError: UseFormSetError<T>,
): boolean {
  if (!(err instanceof ApiError) || !err.isValidation) return false;
  const params = err.problem.invalidParams ?? [];
  if (!params.length) return false;
  for (const { field, reason } of params) {
    setError(field as Path<T>, { type: "server", message: reason });
  }
  return true;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/api-error-to-form.ts tests/unit/api/api-error-to-form.test.ts
git commit -m "feat(shared/api): apiErrorToForm mapper for RHF setError"
```

---

### Task 34: Idempotency helper (TDD)

**Files:** `src/shared/api/idempotency.ts`, `tests/unit/api/idempotency.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getOrCreateIdemKey, clearIdemKey } from "@/shared/api/idempotency";

describe("idempotency", () => {
  beforeEach(() => sessionStorage.clear());

  it("returns same key for same body", () => {
    const a = getOrCreateIdemKey("orders.create", { x: 1 });
    const b = getOrCreateIdemKey("orders.create", { x: 1 });
    expect(a).toBe(b);
  });

  it("returns new key for different body", () => {
    const a = getOrCreateIdemKey("orders.create", { x: 1 });
    const b = getOrCreateIdemKey("orders.create", { x: 2 });
    expect(a).not.toBe(b);
  });

  it("clearIdemKey removes stored key", () => {
    const a = getOrCreateIdemKey("orders.create", { x: 1 });
    clearIdemKey("orders.create", { x: 1 });
    const b = getOrCreateIdemKey("orders.create", { x: 1 });
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `src/shared/api/idempotency.ts`**

```ts
import { hash } from "@/shared/lib/hash";

const keyName = (scope: string, body: unknown) => `idem:${scope}:${hash(body)}`;

export function getOrCreateIdemKey(scope: string, body: unknown): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const k = keyName(scope, body);
  let id = sessionStorage.getItem(k);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(k, id); }
  return id;
}

export function clearIdemKey(scope: string, body: unknown): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(keyName(scope, body));
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/idempotency.ts tests/unit/api/idempotency.test.ts
git commit -m "feat(shared/api): idempotency-key store (sessionStorage)"
```

---

### Task 35: Single-flight refresh (TDD)

**Files:** `src/shared/api/refresh.ts`, `tests/unit/api/refresh.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { tryRefresh, _resetRefreshForTest } from "@/shared/api/refresh";
import { setSnapshot, getSnapshot } from "@/shared/api/auth-token";

describe("tryRefresh", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setSnapshot(null);
    _resetRefreshForTest();
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: "new-tok", expiresIn: 900, userId: "u1", role: "STUDENT" }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sets snapshot on success and returns true", async () => {
    expect(await tryRefresh()).toBe(true);
    expect(getSnapshot()?.accessToken).toBe("new-tok");
  });

  it("single-flight: 5 parallel calls -> 1 fetch", async () => {
    await Promise.all([tryRefresh(), tryRefresh(), tryRefresh(), tryRefresh(), tryRefresh()]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("returns false and clears snapshot on non-ok", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    setSnapshot({ accessToken: "old", userId: "u", role: "STUDENT", expiresAt: 1 });
    expect(await tryRefresh()).toBe(false);
    expect(getSnapshot()).toBeNull();
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `src/shared/api/refresh.ts`**

```ts
import { setSnapshot } from "./auth-token";
import { API_BASE } from "./constants";
import type { Role } from "./types";

let inflight: Promise<boolean> | null = null;

export function tryRefresh(): Promise<boolean> {
  if (!inflight) {
    inflight = (async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" });
        if (!r.ok) { setSnapshot(null); return false; }
        const t = (await r.json()) as { accessToken: string; expiresIn: number; userId: string; role: Role };
        setSnapshot({
          accessToken: t.accessToken, userId: t.userId, role: t.role,
          expiresAt: Date.now() + t.expiresIn * 1000,
        });
        return true;
      } catch {
        setSnapshot(null);
        return false;
      } finally {
        inflight = null;
      }
    })();
  }
  return inflight;
}

export function _resetRefreshForTest(): void { inflight = null; }
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/refresh.ts tests/unit/api/refresh.test.ts
git commit -m "feat(shared/api): single-flight tryRefresh"
```

---

### Task 36: HTTP client `api()` (TDD)

**Files:** `src/shared/api/client.ts`, `tests/unit/api/client.test.ts`

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { api } from "@/shared/api/client";
import { setSnapshot } from "@/shared/api/auth-token";
import { ApiError } from "@/shared/api/errors";
import { _resetRefreshForTest } from "@/shared/api/refresh";

describe("api client", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    setSnapshot(null);
    _resetRefreshForTest();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("attaches Bearer when token present", async () => {
    setSnapshot({ accessToken: "tok", userId: "u", role: "STUDENT", expiresAt: Date.now() + 100000 });
    fetchMock.mockResolvedValueOnce({
      ok: true, status: 200, headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => ({ ok: true }),
    });
    await api("/me");
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok");
  });

  it("auto-generates Idempotency-Key on POST", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true, status: 204, headers: new Headers(),
      json: async () => undefined,
    });
    await api("/x", { method: "POST", body: JSON.stringify({}) });
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Idempotency-Key")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("returns undefined on 204", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204, headers: new Headers() });
    expect(await api("/x")).toBeUndefined();
  });

  it("throws ApiError on non-ok with ProblemDetail body", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false, status: 409, statusText: "Conflict",
      headers: new Headers({ "Content-Type": "application/problem+json" }),
      json: async () => ({ type: "", title: "Conflict", status: 409, detail: "x", instance: "", timestamp: "" }),
    });
    await expect(api("/x")).rejects.toBeInstanceOf(ApiError);
  });

  it("retries once after 401 + successful refresh", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized",
        headers: new Headers(), json: async () => ({ status: 401, title: "U", type: "", detail: "", instance: "", timestamp: "" }) })
      .mockResolvedValueOnce({ ok: true, status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ accessToken: "new", expiresIn: 900, userId: "u", role: "STUDENT" }) }) // refresh
      .mockResolvedValueOnce({ ok: true, status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ data: 1 }) }); // retry
    const result = await api<{ data: number }>("/protected");
    expect(result.data).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
```

- [ ] **Step 2: Run, expect FAIL**

- [ ] **Step 3: Implement `src/shared/api/client.ts`**

```ts
import { API_BASE } from "./constants";
import { getAccessToken } from "./auth-token";
import { ApiError, fallbackProblem, type ProblemDetail } from "./errors";
import { tryRefresh } from "./refresh";

export type ApiOptions = RequestInit & {
  auth?: boolean;
  idempotent?: boolean;
  idemKey?: string;
  totp?: string;
};

const isMutating = (m?: string) =>
  ["POST", "PUT", "PATCH", "DELETE"].includes((m ?? "GET").toUpperCase());

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers);
  headers.set("Accept", "application/json");
  if (opts.body && !(opts.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth !== false) {
    const tok = getAccessToken();
    if (tok) headers.set("Authorization", `Bearer ${tok}`);
  }
  if (opts.idemKey) headers.set("Idempotency-Key", opts.idemKey);
  else if (opts.idempotent ?? isMutating(opts.method)) {
    headers.set("Idempotency-Key", crypto.randomUUID());
  }
  if (opts.totp) headers.set("X-TOTP-Code", opts.totp);

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts, headers,
    credentials: path.startsWith("/auth/") ? "include" : "same-origin",
  });

  if (res.status === 204) return undefined as T;

  if (res.status === 401 && opts.auth !== false && !path.startsWith("/auth/")) {
    if (await tryRefresh()) return api<T>(path, opts);
    if (typeof window !== "undefined") window.dispatchEvent(new Event("auth:logout-required"));
  }

  if (!res.ok) {
    const problem = (await res.json().catch(() => null)) as ProblemDetail | null;
    throw new ApiError(problem ?? fallbackProblem(res));
  }

  const ct = res.headers.get("Content-Type") ?? "";
  if (ct.includes("text/csv")) return res.body as unknown as T;
  return res.json() as Promise<T>;
}
```

- [ ] **Step 4: Run, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/client.ts tests/unit/api/client.test.ts
git commit -m "feat(shared/api): http client with bearer, idempotency, auto-refresh"
```

---

### Task 37: Server-side client (RSC)

**Files:** `src/shared/api/server-client.ts`

- [ ] **Step 1: Implement**

```ts
import { cookies } from "next/headers";
import { API_BASE } from "./constants";
import { ApiError, fallbackProblem, type ProblemDetail } from "./errors";

export type ServerApiInit = RequestInit & { revalidate?: number; tags?: string[] };

export async function serverApi<T>(path: string, init?: ServerApiInit): Promise<T> {
  const cookie = cookies().toString();
  const r = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      Cookie: cookie,
      Accept: "application/json",
    },
    next: { revalidate: init?.revalidate, tags: init?.tags },
    cache: init?.revalidate === undefined ? "no-store" : undefined,
  });
  if (r.status === 204) return undefined as T;
  if (!r.ok) {
    const p = (await r.json().catch(() => null)) as ProblemDetail | null;
    throw new ApiError(p ?? fallbackProblem(r));
  }
  return r.json() as Promise<T>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/server-client.ts
git commit -m "feat(shared/api): RSC server client with cookie forwarding + tags"
```

---

### Task 38: S3 upload helper

**Files:** `src/shared/api/upload-s3.ts`

- [ ] **Step 1: Implement**

```ts
export type PresignedUploadDto = {
  url: string;
  s3Key: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
};

export function uploadToS3(
  presigned: PresignedUploadDto, file: File,
  signal?: AbortSignal,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presigned.url);
    Object.entries(presigned.requiredHeaders).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`S3 upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("S3 network error"));
    signal?.addEventListener("abort", () => {
      xhr.abort();
      reject(new DOMException("aborted", "AbortError"));
    });
    xhr.send(file);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/upload-s3.ts
git commit -m "feat(shared/api): S3 upload helper with progress and abort"
```

---

### Task 39: API module — auth

**Files:** `src/shared/api/modules/auth.ts`

- [ ] **Step 1: Implement**

```ts
import { api } from "../client";
import type { Role } from "../types";

export type RegisterRequest = {
  email: string; password: string; firstName: string; lastName: string;
  grade: string; parentEmail: string;
};
export type RegisterResponse = { userId: string; message: string };

export type LoginRequest = { email: string; password: string };
export type TokenResponse = {
  accessToken: string; expiresIn: number; tokenType: "Bearer";
  userId: string; role: Role;
};

export const authApi = {
  register: (b: RegisterRequest) =>
    api<RegisterResponse>("/auth/register", { method: "POST", body: JSON.stringify(b), auth: false }),
  login: (b: LoginRequest) =>
    api<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify(b), auth: false }),
  refresh: () => api<TokenResponse>("/auth/refresh", { method: "POST", auth: false }),
  logout: () => api<void>("/auth/logout", { method: "POST", auth: false }),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/modules/auth.ts
git commit -m "feat(shared/api/modules): auth module"
```

---

### Task 40: API module — catalog

**Files:** `src/shared/api/modules/catalog.ts`

- [ ] **Step 1: Implement**

```ts
import { api } from "../client";
import type { Page } from "../types";

export type ProductType = "PHYSICAL" | "DIGITAL";
export type Sort = "newest" | "price_asc" | "price_desc" | "popular";

export type AuthorDto = { studentId: string; firstName: string; grade: string };

export type ProductCardDto = {
  id: string; title: string; slug: string;
  priceUah: string; type: ProductType;
  author: AuthorDto;
  thumbnailUrl: string | null;
};

export type ProductDetailDto = {
  id: string; title: string; slug: string;
  description: string;        // sanitized HTML
  priceUah: string; type: ProductType;
  stockQty: number; viewCount: number;
  author: AuthorDto;
  imageUrls: string[];
};

const qs = (o: Record<string, unknown>) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");

export const catalogApi = {
  list: (q: { page?: number; size?: number; type?: ProductType; sort?: Sort }) =>
    api<Page<ProductCardDto>>(`/products?${qs(q)}`, { auth: false }),
  bySlug: (slug: string) =>
    api<ProductDetailDto>(`/products/${slug}`, { auth: false }),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/modules/catalog.ts
git commit -m "feat(shared/api/modules): catalog module"
```

---

### Task 41: API module — orders

**Files:** `src/shared/api/modules/orders.ts`

- [ ] **Step 1: Implement**

```ts
import { api } from "../client";
import { getOrCreateIdemKey } from "../idempotency";

export type CreateOrderRequest = {
  buyerEmail: string; buyerName: string; buyerPhone: string;
  items: Array<{ productId: string; quantity: number }>;
};

export type OrderCreationResponse = {
  orderId: string;
  orderNumber: string;
  totalAmount: string;
  status: "PENDING_PAYMENT";
  paymentUrl: string;
};

export const ordersApi = {
  create: (body: CreateOrderRequest) => {
    const idemKey = getOrCreateIdemKey("orders.create", body);
    return api<OrderCreationResponse>("/orders", {
      method: "POST", body: JSON.stringify(body),
      idemKey, auth: false,
    });
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/modules/orders.ts
git commit -m "feat(shared/api/modules): orders module"
```

---

### Task 42: API module — kyc

**Files:** `src/shared/api/modules/kyc.ts`

- [ ] **Step 1: Implement**

```ts
import { api } from "../client";

export type KycSessionResponse = {
  studentName: string; grade: string;
  status: "AWAITING_DETAILS" | "PENDING_SIGNATURE" | "APPROVED";
};
export type KycSubmitRequest = { parentName: string; parentRnokpp: string; payoutCard: string };
export type KycSubmitResponse = {
  status: "PENDING_SIGNATURE";
  signDocumentUrl: string | null;
  expiresAt: string;
};

export const kycApi = {
  peek: (token: string) =>
    api<KycSessionResponse>(`/kyc/session/${token}`, { auth: false }),
  submit: (token: string, body: KycSubmitRequest) =>
    api<KycSubmitResponse>(`/kyc/parents/submit?token=${token}`, {
      method: "POST", body: JSON.stringify(body), auth: false,
    }),
  updateCard: (token: string, payoutCard: string) =>
    api<void>(`/kyc/parents/update-card?token=${token}`, {
      method: "POST", body: JSON.stringify({ payoutCard }), auth: false,
    }),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/modules/kyc.ts
git commit -m "feat(shared/api/modules): kyc module"
```

---

### Task 43: API module — student

**Files:** `src/shared/api/modules/student.ts`

- [ ] **Step 1: Implement**

```ts
import { api } from "../client";
import type { ProductType } from "./catalog";
import type { PresignedUploadDto } from "../upload-s3";

export type CreateProductRequest = {
  title: string; description: string; priceUah: string;
  type: ProductType; stockQty: number;
};
export type EditProductRequest = { title: string; description: string; priceUah: string };
export type ConfirmImageRequest = {
  s3Key: string;
  declaredMimeType: "image/jpeg" | "image/png" | "image/webp";
  primary: boolean;
};
export type FinanceSummaryDto = {
  totalGross: string; totalTaxes: string; totalNetEarned: string;
  pendingHold: string; pendingApproved: string;
};

export const studentApi = {
  products: {
    create: (b: CreateProductRequest) =>
      api<{ id: string }>("/student/products", { method: "POST", body: JSON.stringify(b) }),
    edit: (id: string, b: EditProductRequest) =>
      api<void>(`/student/products/${id}`, { method: "PUT", body: JSON.stringify(b) }),
    submit: (id: string) => api<void>(`/student/products/${id}/submit`, { method: "POST" }),
    hide:   (id: string) => api<void>(`/student/products/${id}/hide`,   { method: "POST" }),
    unhide: (id: string) => api<void>(`/student/products/${id}/unhide`, { method: "POST" }),
    delete: (id: string) => api<void>(`/student/products/${id}`,        { method: "DELETE" }),
    uploadUrl: (id: string, contentType: "image/jpeg" | "image/png" | "image/webp") =>
      api<PresignedUploadDto>(`/student/products/${id}/images/upload-url`, {
        method: "POST", body: JSON.stringify({ contentType }),
      }),
    confirmImg: (id: string, b: ConfirmImageRequest) =>
      api<void>(`/student/products/${id}/images/confirm`, { method: "POST", body: JSON.stringify(b) }),
  },
  finance: {
    summary: () => api<FinanceSummaryDto>("/student/finance/summary"),
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/modules/student.ts
git commit -m "feat(shared/api/modules): student module"
```

---

### Task 44: API module — users

**Files:** `src/shared/api/modules/users.ts`

- [ ] **Step 1: Implement**

```ts
import { api } from "../client";

export const userApi = {
  deleteMe: () => api<void>("/users/me", { method: "DELETE" }),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/modules/users.ts
git commit -m "feat(shared/api/modules): users module"
```

---

### Task 45: API module — admin

**Files:** `src/shared/api/modules/admin.ts`

- [ ] **Step 1: Implement**

```ts
import { api } from "../client";
import type { Page } from "../types";
import type { ProductType } from "./catalog";

export type ProductStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "HIDDEN" | "DELETED";

export type AdminProductDto = {
  id: string; title: string; slug: string | null;
  descriptionPlain: string; priceUah: string; type: ProductType;
  stockQty: number; status: ProductStatus;
  rejectionReason: string | null;
  studentId: string; studentFullName: string; studentGrade: string;
  kycSigned: boolean; createdAt: string;
};

export type TotpEnrollResponse = {
  qrCodeDataUri: string;
  secretBase32: string;
  recoveryCodes: string[];
};

export type PayoutBatchRequest = { payoutIds: string[] };
export type PayoutBatchResponse = { processedCount: number; jobId: string; message: string };

const qs = (o: Record<string, unknown>) =>
  Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&");

export const adminApi = {
  twoFa: {
    enroll: () => api<TotpEnrollResponse>("/admin/2fa/enroll", { method: "POST" }),
    confirm: (code: string) => api<void>("/admin/2fa/confirm", { method: "POST", body: JSON.stringify({ code }) }),
    verify:  (code: string) => api<{ valid: boolean }>("/admin/2fa/verify", { method: "POST", body: JSON.stringify({ code }) }),
  },
  products: {
    list: (status?: ProductStatus, page = 0, size = 50) =>
      api<Page<AdminProductDto>>(`/admin/products?${qs({ status, page, size })}`),
    approve: (id: string) =>
      api<AdminProductDto>(`/admin/products/${id}/approve`, { method: "POST" }),
    reject: (id: string, reason: string) =>
      api<AdminProductDto>(`/admin/products/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  },
  orders: {
    refund: (orderId: string, reason: string) =>
      api<void>(`/admin/orders/${orderId}/refund`, { method: "POST", body: JSON.stringify({ reason }) }),
  },
  payouts: {
    execute: (payoutIds: string[], totp: string) =>
      api<PayoutBatchResponse>("/admin/payouts/execute", {
        method: "POST", body: JSON.stringify({ payoutIds }), totp,
      }),
  },
};

export async function downloadTaxReport(from: string, to: string, accessToken: string): Promise<void> {
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/admin/payouts/export/tax-report?from=${from}&to=${to}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!r.ok) throw new Error(`Tax report HTTP ${r.status}`);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `4DF_${from}_${to}.csv`; a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/api/modules/admin.ts
git commit -m "feat(shared/api/modules): admin module + tax report download"
```

---

### Task 46: shared/api barrel + revalidate helper

**Files:** `src/shared/api/index.ts`, `src/shared/api/revalidate.ts`

- [ ] **Step 1: `src/shared/api/index.ts`**

```ts
export * from "./constants";
export * from "./types";
export * from "./errors";
export * from "./error-messages";
export * from "./api-error-to-form";
export * from "./auth-token";
export * from "./refresh";
export * from "./idempotency";
export * from "./client";
export * from "./upload-s3";
export * from "./revalidate";
export { authApi } from "./modules/auth";
export type { RegisterRequest, RegisterResponse, LoginRequest, TokenResponse } from "./modules/auth";
export { catalogApi } from "./modules/catalog";
export type { ProductType, Sort, ProductCardDto, ProductDetailDto, AuthorDto } from "./modules/catalog";
export { ordersApi } from "./modules/orders";
export type { CreateOrderRequest, OrderCreationResponse } from "./modules/orders";
export { kycApi } from "./modules/kyc";
export type { KycSessionResponse, KycSubmitRequest, KycSubmitResponse } from "./modules/kyc";
export { studentApi } from "./modules/student";
export type { CreateProductRequest, EditProductRequest, ConfirmImageRequest, FinanceSummaryDto } from "./modules/student";
export { userApi } from "./modules/users";
export { adminApi, downloadTaxReport } from "./modules/admin";
export type { ProductStatus, AdminProductDto, TotpEnrollResponse, PayoutBatchRequest, PayoutBatchResponse } from "./modules/admin";
```

- [ ] **Step 2: `src/shared/api/revalidate.ts`**

```ts
export async function revalidateOnClient(tags: string[]): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags }),
  }).catch(() => {});
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/api/index.ts src/shared/api/revalidate.ts
git commit -m "feat(shared/api): barrel + revalidateOnClient helper"
```

---

### Phase 2 Checkpoint

- [ ] **Run pnpm typecheck && pnpm lint && pnpm vitest run**

Expected: PASS.
---

## Phase 3 — Providers, middleware, role layouts

### Task 47: Query provider

**Files:** `src/_app/providers/query-provider.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError, messageFor } from "@/shared/api";
import { toast } from "@/shared/ui";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
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
  }));
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/_app/providers/query-provider.tsx
git commit -m "feat(_app/providers): TanStack QueryClient with paper-style defaults"
```

---

### Task 48: Auth provider

**Files:** `src/_app/providers/auth-provider.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { subscribe, getSnapshot, setSnapshot, REFRESH_PROACTIVE_MS, type TokenSnapshot, type Role, authApi } from "@/shared/api";
import { tryRefresh } from "@/shared/api/refresh";

type Ctx = {
  user: TokenSnapshot | null;
  role: Role | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => null);

  useEffect(() => {
    const handler = () => {
      setSnapshot(null);
      if (typeof window !== "undefined") window.location.href = "/login";
    };
    window.addEventListener("auth:logout-required", handler);
    return () => window.removeEventListener("auth:logout-required", handler);
  }, []);

  useEffect(() => {
    if (!snap) return;
    const ms = snap.expiresAt - Date.now() - REFRESH_PROACTIVE_MS;
    if (ms <= 0) { void tryRefresh(); return; }
    const t = setTimeout(() => { void tryRefresh(); }, ms);
    return () => clearTimeout(t);
  }, [snap?.expiresAt]);

  const value = useMemo<Ctx>(() => ({
    user: snap, role: snap?.role ?? null, isAuthenticated: !!snap,
    logout: async () => { await authApi.logout().catch(() => {}); setSnapshot(null); },
  }), [snap]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): Ctx {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/_app/providers/auth-provider.tsx
git commit -m "feat(_app/providers): AuthProvider with proactive refresh + logout broadcast"
```

---

### Task 49: Toast provider + Auth bootstrap process

**Files:** `src/_app/providers/toast-provider.tsx`, `src/processes/auth-bootstrap/index.tsx`, `src/_app/providers/index.tsx`

- [ ] **Step 1: `src/_app/providers/toast-provider.tsx`**

```tsx
"use client";
import type { ReactNode } from "react";
import { Toaster } from "@/shared/ui";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (<>{children}<Toaster /></>);
}
```

- [ ] **Step 2: `src/processes/auth-bootstrap/index.tsx`**

```tsx
"use client";
import { useEffect } from "react";
import { tryRefresh } from "@/shared/api/refresh";

export function AuthBootstrap() {
  useEffect(() => { void tryRefresh(); }, []);
  return null;
}
```

- [ ] **Step 3: `src/_app/providers/index.tsx`**

```tsx
"use client";
import type { ReactNode } from "react";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";
import { ToastProvider } from "./toast-provider";
import { AuthBootstrap } from "@/processes/auth-bootstrap";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AuthBootstrap />
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
```

- [ ] **Step 4: Wire into root layout — modify `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { fraunces, manrope, caveat } from "@/_app/fonts";
import { AppProviders } from "@/_app/providers";
import "@/_app/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "Майстерня 157 — Архів учнівських робіт", template: "%s · Майстерня 157" },
  description: "Випуск №47 архіву Ліцею №157, Київ · Оболонь",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${fraunces.variable} ${manrope.variable} ${caveat.variable}`}>
      <body className="bg-bg font-body text-ink antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify dev boots**

```bash
pnpm dev
```

Open http://localhost:3000 — no errors.

- [ ] **Step 6: Commit**

```bash
git add src/_app/providers src/processes/auth-bootstrap src/app/layout.tsx
git commit -m "feat(_app): wire providers (query, auth, toast) + auth bootstrap"
```

---

### Task 50: Middleware (RBAC + noindex)

**Files:** `src/middleware.ts`

- [ ] **Step 1: Implement**

```ts
import { NextRequest, NextResponse } from "next/server";

const ROLE_PROTECTED = ["/student", "/admin", "/account"] as const;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/parent/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  }

  for (const prefix of ROLE_PROTECTED) {
    if (pathname.startsWith(prefix)) {
      const hasRefresh = req.cookies.has("refresh_token");
      if (!hasRefresh) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/account", "/parent/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): RBAC coarse-gate + parent noindex"
```

---

### Task 51: Role-precise layouts (student, admin)

**Files:** `src/widgets/role-section-shell/{role-section-shell.tsx,role-gate-splash.tsx,index.ts}`, `src/app/student/layout.tsx`, `src/app/admin/layout.tsx`

- [ ] **Step 1: `src/widgets/role-section-shell/role-gate-splash.tsx`**

```tsx
"use client";
import { Stamp } from "@/shared/ui";

export function RoleGateSplash({ text = "Перевірка доступу…" }: { text?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
      <p className="text-lead text-ink-soft">{text}</p>
    </main>
  );
}
```

- [ ] **Step 2: `src/widgets/role-section-shell/role-section-shell.tsx`**

```tsx
"use client";
import type { ReactNode } from "react";
import { Container } from "@/shared/ui";

export function RoleSectionShell({ role, children }: { role: "student" | "admin"; children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <Container>
        <p className="text-label text-burgundy">▌ {role === "student" ? "Кабінет учня" : "Адміністрування"}</p>
        {children}
      </Container>
    </main>
  );
}
```

- [ ] **Step 3: `src/widgets/role-section-shell/index.ts`**

```ts
export { RoleSectionShell } from "./role-section-shell";
export { RoleGateSplash } from "./role-gate-splash";
```

- [ ] **Step 4: `src/app/student/layout.tsx`**

```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { RoleGateSplash, RoleSectionShell } from "@/widgets/role-section-shell";

export const dynamic = "force-dynamic";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (role !== "STUDENT") { router.replace("/"); return; }
  }, [isAuthenticated, role, router]);
  if (!isAuthenticated || role !== "STUDENT") return <RoleGateSplash />;
  return <RoleSectionShell role="student">{children}</RoleSectionShell>;
}
```

- [ ] **Step 5: `src/app/admin/layout.tsx`**

```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { RoleGateSplash, RoleSectionShell } from "@/widgets/role-section-shell";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (role !== "ADMIN") { router.replace("/"); return; }
  }, [isAuthenticated, role, router]);
  if (!isAuthenticated || role !== "ADMIN") return <RoleGateSplash />;
  return <RoleSectionShell role="admin">{children}</RoleSectionShell>;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/widgets/role-section-shell src/app/student/layout.tsx src/app/admin/layout.tsx
git commit -m "feat(app): role-precise layouts for student and admin"
```

---

### Task 52: Parent magic-link layout

**Files:** `src/app/parent/layout.tsx`

- [ ] **Step 1: Implement**

```tsx
import type { ReactNode } from "react";
import { Container } from "@/shared/ui";

export const dynamic = "force-dynamic";

export const metadata = { robots: "noindex, nofollow" };

export default function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-bg-warm">
      <Container narrow>{children}</Container>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/parent/layout.tsx
git commit -m "feat(app): parent magic-link layout (force-dynamic, noindex, bg-warm)"
```

---

### Task 53: Public layout

**Files:** `src/app/(public)/layout.tsx`

- [ ] **Step 1: Stub layout (header/footer wired in Phase 4)**

```tsx
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative z-10 min-h-[calc(100vh-124px)]">
      {/* Header and Footer mounted in Phase 4 — temporarily nothing */}
      {children}
    </main>
  );
}
```

- [ ] **Step 2: Move existing `src/app/page.tsx` into `(public)/page.tsx` as a temporary stub**

```bash
mkdir -p "src/app/(public)"
git mv src/app/page.tsx "src/app/(public)/page.tsx"
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/layout.tsx src/app/\(public\)/page.tsx
git commit -m "feat(app): public route group layout"
```

---

### Task 54: Error and not-found pages

**Files:** `src/app/error.tsx`, `src/app/not-found.tsx`

- [ ] **Step 1: `src/app/error.tsx`**

```tsx
"use client";
import { Stamp, PillButton, Container, Stack } from "@/shared/ui";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text="ВИПУСК ПОШКОДЖЕНО" rotation={5} animateOn="load" />
        <h1 className="font-display text-display italic text-burgundy">Сторінка не друкується</h1>
        <p className="text-lead text-ink-soft">Щось пішло не так під час верстки. Спробуйте оновити.</p>
        <PillButton onClick={reset}>Перезавантажити аркуш</PillButton>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 2: `src/app/not-found.tsx`**

```tsx
import Link from "next/link";
import { Stamp, PillButton, EditorialLabel, Container, Stack } from "@/shared/ui";

export default function NotFound() {
  return (
    <Container>
      <Stack gap={6} className="py-16">
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
        <EditorialLabel>СТОРІНКА №404</EditorialLabel>
        <h1 className="font-display text-display italic text-burgundy">Сторінку не знайдено в архіві</h1>
        <p className="text-lead text-ink-soft">Можливо, ця стаття була в іншому випуску.</p>
        <PillButton asChild variant="primary"><Link href="/">До обкладинки</Link></PillButton>
      </Stack>
    </Container>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/error.tsx src/app/not-found.tsx
git commit -m "feat(app): paper-style error and 404 pages"
```

---

### Phase 3 Checkpoint

- [ ] **Run pnpm typecheck && pnpm lint && pnpm vitest run && pnpm build**

Expected: PASS.

---

## Phase 4 — Stores + global widgets

### Task 55: Cart store (Zustand+persist) — TDD

**Files:** `src/entities/cart/model/types.ts`, `src/entities/cart/model/cart-store.ts`, `src/entities/cart/index.ts`, `tests/unit/stores/cart-store.test.ts`

- [ ] **Step 1: `src/entities/cart/model/types.ts`**

```ts
export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  priceUah: string;
  qty: number;
  thumbnailUrl: string | null;
  type: "PHYSICAL" | "DIGITAL";
};
```

- [ ] **Step 2: Failing test**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "@/entities/cart/model/cart-store";

const item = {
  productId: "p1", slug: "p-1", title: "X", priceUah: "100.00",
  qty: 1, thumbnailUrl: null, type: "PHYSICAL" as const,
};

describe("cart-store", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("adds new item", () => {
    useCartStore.getState().add(item);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().count).toBe(1);
  });

  it("merges qty when same product added twice", () => {
    useCartStore.getState().add(item);
    useCartStore.getState().add({ ...item, qty: 2 });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]?.qty).toBe(3);
    expect(useCartStore.getState().count).toBe(3);
  });

  it("setQty 0 removes item", () => {
    useCartStore.getState().add(item);
    useCartStore.getState().setQty("p1", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("totalUah sums price × qty", () => {
    useCartStore.getState().add(item);
    useCartStore.getState().add({ ...item, productId: "p2", priceUah: "50.00", qty: 2 });
    expect(useCartStore.getState().totalUah()).toBe("200.00");
  });
});
```

- [ ] **Step 3: Run, expect FAIL**

- [ ] **Step 4: Implement `src/entities/cart/model/cart-store.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sumMoney, mulMoney } from "@/shared/lib/money";
import type { CartItem } from "./types";

type CartState = {
  items: CartItem[];
  count: number;
  add: (item: CartItem) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  totalUah: () => string;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      count: 0,
      add: (item) => set((state) => {
        const existing = state.items.find((i) => i.productId === item.productId);
        const items = existing
          ? state.items.map((i) => i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i)
          : [...state.items, item];
        return { items, count: items.reduce((s, i) => s + i.qty, 0) };
      }),
      setQty: (productId, qty) => set((state) => {
        const items = qty <= 0
          ? state.items.filter((i) => i.productId !== productId)
          : state.items.map((i) => i.productId === productId ? { ...i, qty } : i);
        return { items, count: items.reduce((s, i) => s + i.qty, 0) };
      }),
      remove: (productId) => set((state) => {
        const items = state.items.filter((i) => i.productId !== productId);
        return { items, count: items.reduce((s, i) => s + i.qty, 0) };
      }),
      clear: () => set({ items: [], count: 0 }),
      totalUah: () => sumMoney(get().items.map((i) => mulMoney(i.priceUah, i.qty))),
    }),
    { name: "lyceum-cart-v1" },
  ),
);
```

- [ ] **Step 5: `src/entities/cart/index.ts`**

```ts
export { useCartStore } from "./model/cart-store";
export type { CartItem } from "./model/types";
```

- [ ] **Step 6: Run, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/entities/cart tests/unit/stores
git commit -m "feat(entities/cart): Zustand+persist cart store"
```

---

### Task 56: useDisclosure hook

**Files:** `src/shared/hooks/use-disclosure.ts`

- [ ] **Step 1: Implement**

```ts
"use client";
import { useCallback, useState } from "react";

export function useDisclosure(initial = false) {
  const [open, setOpen] = useState(initial);
  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((p) => !p), []);
  return { open, setOpen, onOpen, onClose, onToggle };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/hooks/use-disclosure.ts
git commit -m "feat(shared/hooks): useDisclosure"
```

---

### Task 57: useScrollToFirstError hook

**Files:** `src/shared/hooks/use-scroll-to-first-error.ts`

- [ ] **Step 1: Implement**

```ts
"use client";
import { useEffect } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";

const HEADER_OFFSET = 120;

export function useScrollToFirstError<T extends FieldValues>(
  errors: FieldErrors<T>, isSubmitted: boolean,
) {
  useEffect(() => {
    if (!isSubmitted || typeof window === "undefined") return;
    const firstName = Object.keys(errors)[0];
    if (!firstName) return;
    const el = document.querySelector<HTMLElement>(`[name="${firstName}"], #field-${firstName}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted, JSON.stringify(errors)]);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/hooks/use-scroll-to-first-error.ts
git commit -m "feat(shared/hooks): scroll-to-first-error with header offset and reduced-motion"
```

---

### Task 58: Header widget

**Files:** `src/widgets/header/{header.tsx,top-bar.tsx,nav.tsx,cart-badge.tsx,index.ts}`

- [ ] **Step 1: `src/widgets/header/top-bar.tsx`**

```tsx
"use client";
import { Stamp } from "@/shared/ui";

export function TopBar() {
  return (
    <div className="hidden h-9 items-center justify-center gap-4 bg-bg-noir px-5 text-[11px] uppercase tracking-[0.14em] text-white md:flex">
      <span>КИЇВ · ОБОЛОНЬ</span>
      <Stamp text="АРХІВ ЛІЦЕЮ 157" shape="octagon" rotation={-3} size={28} animateOn="none" smudge={false} />
      <span>ВИПУСК №47 · ТРАВЕНЬ 2026</span>
    </div>
  );
}
```

- [ ] **Step 2: `src/widgets/header/nav.tsx`**

```tsx
"use client";
import Link from "next/link";

const items = [
  { href: "/catalog",     label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about",       label: "Про" },
];

export function Nav() {
  return (
    <nav className="hidden md:block">
      <ul className="flex gap-7">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="relative text-[13px] font-bold uppercase tracking-[0.08em] text-ink hover:text-green">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 3: `src/widgets/header/cart-badge.tsx`**

```tsx
"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/entities/cart";

export function CartBadge() {
  const count = useCartStore((s) => s.count);
  return (
    <Link href="/cart" aria-label="Кошик" className="relative inline-flex items-center justify-center">
      <ShoppingCart size={24} strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-burgundy px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 4: `src/widgets/header/header.tsx`**

```tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import { TopBar } from "./top-bar";
import { Nav } from "./nav";
import { CartBadge } from "./cart-badge";
import { Container } from "@/shared/ui";
import { cn } from "@/shared/lib";

export function Header() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const onScroll = () => setCollapsed(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header data-collapsed={collapsed} className={cn(
      "sticky top-0 z-30 backdrop-blur-md transition-[height] duration-d3 ease-paper",
      "bg-bg/90 border-b border-line",
    )}>
      {!collapsed && <TopBar />}
      <Container>
        <div className={cn("flex items-center justify-between transition-all", collapsed ? "h-16" : "h-[88px]")}>
          <Link href="/" className="font-display text-2xl font-bold text-burgundy">
            <span aria-hidden className="mr-3 inline-block h-7 w-7 rounded-full bg-burgundy" />
            Майстерня 157
          </Link>
          <Nav />
          <div className="flex items-center gap-5">
            <Search size={20} strokeWidth={1.5} aria-label="Пошук" />
            <Link href="/account" aria-label="Кабінет"><User size={20} strokeWidth={1.5} /></Link>
            <CartBadge />
          </div>
        </div>
      </Container>
    </header>
  );
}
```

- [ ] **Step 5: `src/widgets/header/index.ts`**

```ts
export { Header } from "./header";
```

- [ ] **Step 6: Commit**

```bash
git add src/widgets/header
git commit -m "feat(widgets/header): sticky header with top-bar, nav, cart badge"
```

---

### Task 59: Footer widget (postcard, simplified)

**Files:** `src/widgets/footer/{footer.tsx,index.ts}`

- [ ] **Step 1: Implement minimal postcard footer (full editorial polish in public-cluster brainstorm)**

```tsx
import Link from "next/link";
import { Container, EditorialDivider, EditorialLabel, PostageStamp, Stamp } from "@/shared/ui";

export function Footer() {
  return (
    <footer className="relative mt-20 border-t-2 border-dashed border-ink/30 bg-bg pt-10">
      <Container>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="font-hand text-hand-l text-burgundy">Дорогий друже,</p>
            <p className="mt-3 max-w-md text-body text-ink">
              Ми пишемо тобі з Майстерні 157. Тут, на проспекті Оболонському, 1351 учень щодня щось створює.
              Заходь, коли матимеш час.
            </p>
            <p className="mt-6 font-display italic text-burgundy">— команда Ліцею №157</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <PostageStamp />
            <div className="flex gap-3">
              <Stamp text="АРХІВ ЛІЦЕЮ 157" shape="octagon" rotation={-3} size={80} animateOn="scroll" />
              <Stamp text="ПЕРЕДАНО З ОБОЛОНІ" shape="circle" rotation={5} size={80} animateOn="scroll" />
            </div>
            <address className="not-italic text-right text-small text-ink-soft">
              пр. Оболонський, 12в<br />+38 (044) 418-75-08<br />obolon_157@i.ua
            </address>
          </div>
        </div>
        <EditorialDivider variant="dashed" className="my-8" />
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 text-small">
          <EditorialLabel>© ЛІЦЕЙ 157 · 2026 · ОБОЛОНЬ</EditorialLabel>
          <nav className="flex gap-5 text-ink-soft">
            <Link href="/catalog">Каталог</Link>
            <Link href="/collections">Колекції</Link>
            <Link href="/about">Про</Link>
            <Link href="/contacts">Контакти</Link>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 2: `src/widgets/footer/index.ts`**

```ts
export { Footer } from "./footer";
```

- [ ] **Step 3: Commit**

```bash
git add src/widgets/footer
git commit -m "feat(widgets/footer): postcard footer (foundation version)"
```

---

### Task 60: EditorialPageShell + PageStubBanner widgets

**Files:** `src/widgets/editorial-page-shell/{editorial-page-shell.tsx,page-stub-banner.tsx,index.ts}`

- [ ] **Step 1: `editorial-page-shell.tsx`**

```tsx
import type { ReactNode } from "react";
import { Container, Section, Stack } from "@/shared/ui";

export function EditorialPageShell({ children }: { children: ReactNode }) {
  return (
    <Section pad="default">
      <Container>
        <Stack gap={6}>{children}</Stack>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: `page-stub-banner.tsx`**

```tsx
"use client";
import { Sticker } from "@/shared/ui";

export function PageStubBanner({ cluster }: { cluster: string }) {
  if (process.env.NODE_ENV === "production") return null;
  return (
    <Sticker color="yellow" rotation={-2} signature={`— до брейншторму "${cluster}"`}>
      🚧 Цю сторінку буде полірувати в окремому брейнштормі.
    </Sticker>
  );
}
```

- [ ] **Step 3: `index.ts`**

```ts
export { EditorialPageShell } from "./editorial-page-shell";
export { PageStubBanner } from "./page-stub-banner";
```

- [ ] **Step 4: Commit**

```bash
git add src/widgets/editorial-page-shell
git commit -m "feat(widgets): EditorialPageShell + PageStubBanner (dev marker)"
```

---

### Task 61: Wire Header+Footer into PublicLayout

**Files:** Modify `src/app/(public)/layout.tsx`

- [ ] **Step 1: Replace**

```tsx
import type { ReactNode } from "react";
import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="relative z-10 min-h-[calc(100vh-124px)]">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify dev**

```bash
pnpm dev
```

Open http://localhost:3000 — header sticky, footer postcard visible.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/layout.tsx
git commit -m "feat(app): wire header and footer into public layout"
```

---

### Phase 4 Checkpoint

- [ ] **Run pnpm typecheck && pnpm lint && pnpm vitest run && pnpm build**

Expected: PASS.
---

## Phase 5 — 12 route-stubs (RSC + screen composition)

Pattern: each Next `page.tsx` is a thin RSC that imports a screen from `pages/<name>`. Screens render `EditorialPageShell` + `PageStubBanner`. Forms get integrated in Phase 6.

### Task 62: Home page stub

**Files:** `src/pages/home/{ui/home-screen.tsx,index.ts}`, `src/app/(public)/page.tsx` (replace)

- [ ] **Step 1: `src/pages/home/ui/home-screen.tsx`**

```tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Stamp, Stack } from "@/shared/ui";

export function HomeScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ВИПУСК №47 · ТРАВЕНЬ 2026</EditorialLabel>
      <h1 className="font-display text-mega italic text-burgundy">Майстерня 157</h1>
      <Stack gap={4}>
        <p className="max-w-prose text-lead text-ink-soft">
          Архів учнівських робіт Ліцею №157. Київ · Оболонь · з 1957 року.
        </p>
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
      </Stack>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 2: `src/pages/home/index.ts`**

```ts
export { HomeScreen } from "./ui/home-screen";
```

- [ ] **Step 3: Replace `src/app/(public)/page.tsx`**

```tsx
import type { Metadata } from "next";
import { HomeScreen } from "@/pages/home";

export const metadata: Metadata = { title: "Майстерня 157" };
export const revalidate = 300;

export default function Page() {
  return <HomeScreen />;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/home src/app/\(public\)/page.tsx
git commit -m "feat(pages/home): home stub with editorial hero"
```

---

### Task 63: Catalog page stub

**Files:** `src/pages/catalog/{ui/catalog-screen.tsx,index.ts}`, `src/app/(public)/catalog/page.tsx`

- [ ] **Step 1: `src/pages/catalog/ui/catalog-screen.tsx`**

```tsx
"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function CatalogScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПОКАЖЧИК ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог</h1>
      <p className="text-lead text-ink-soft">Усі роботи учнів Ліцею №157, упорядковано за номером випуску.</p>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 2: `src/pages/catalog/index.ts`**

```ts
export { CatalogScreen } from "./ui/catalog-screen";
```

- [ ] **Step 3: `src/app/(public)/catalog/page.tsx`**

```tsx
import type { Metadata } from "next";
import { CatalogScreen } from "@/pages/catalog";

export const metadata: Metadata = { title: "Каталог" };
export const revalidate = 300;

export default function Page() {
  return <CatalogScreen />;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/catalog src/app/\(public\)/catalog
git commit -m "feat(pages/catalog): catalog stub with ISR revalidate"
```

---

### Task 64: Product detail stub

**Files:** `src/pages/product-detail/{ui/product-detail-screen.tsx,index.ts}`, `src/app/(public)/p/[slug]/page.tsx`

- [ ] **Step 1: `src/pages/product-detail/ui/product-detail-screen.tsx`**

```tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function ProductDetailScreen({ slug }: { slug: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>СТАТТЯ ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Робота: {slug}</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 2: `src/pages/product-detail/index.ts`**

```ts
export { ProductDetailScreen } from "./ui/product-detail-screen";
```

- [ ] **Step 3: `src/app/(public)/p/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { ProductDetailScreen } from "@/pages/product-detail";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: `Робота: ${params.slug}` };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ProductDetailScreen slug={params.slug} />;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/product-detail src/app/\(public\)/p
git commit -m "feat(pages/product-detail): product stub with dynamic metadata"
```

---

### Task 65: Author profile, Collections, About, Contacts stubs

**Files:** four screen folders + four route files

- [ ] **Step 1: Create author-profile screen**

```tsx
// src/pages/author-profile/ui/author-profile-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function AuthorProfileScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПРОФАЙЛ-FEATURE</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Автор: {id}</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/author-profile/index.ts
export { AuthorProfileScreen } from "./ui/author-profile-screen";
```

```tsx
// src/app/(public)/authors/[id]/page.tsx
import { AuthorProfileScreen } from "@/pages/author-profile";
export const revalidate = 600;
export default function Page({ params }: { params: { id: string } }) {
  return <AuthorProfileScreen id={params.id} />;
}
```

- [ ] **Step 2: Create collections screen**

```tsx
// src/pages/collections/ui/collections-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function CollectionsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ТЕМАТИЧНІ СПЕЦВИПУСКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Колекції</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/collections/index.ts
export { CollectionsScreen } from "./ui/collections-screen";
```

```tsx
// src/app/(public)/collections/page.tsx
import { CollectionsScreen } from "@/pages/collections";
export const revalidate = 3600;
export default function Page() { return <CollectionsScreen />; }
```

- [ ] **Step 3: Create about screen**

```tsx
// src/pages/about/ui/about-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function AboutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>РЕДАКТОРСЬКА КОЛОНКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Про проєкт</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/about/index.ts
export { AboutScreen } from "./ui/about-screen";
```

```tsx
// src/app/(public)/about/page.tsx
import { AboutScreen } from "@/pages/about";
export const dynamic = "force-static";
export default function Page() { return <AboutScreen />; }
```

- [ ] **Step 4: Create contacts screen**

```tsx
// src/pages/contacts/ui/contacts-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function ContactsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>КОЛОФОН</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Контакти</h1>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/contacts/index.ts
export { ContactsScreen } from "./ui/contacts-screen";
```

```tsx
// src/app/(public)/contacts/page.tsx
import { ContactsScreen } from "@/pages/contacts";
export const dynamic = "force-static";
export default function Page() { return <ContactsScreen />; }
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/author-profile src/pages/collections src/pages/about src/pages/contacts
git add src/app/\(public\)/authors src/app/\(public\)/collections src/app/\(public\)/about src/app/\(public\)/contacts
git commit -m "feat(pages): author, collections, about, contacts stubs"
```

---

### Task 66: Cart, Checkout, Success, Failure stubs

**Files:** four screens + four routes

- [ ] **Step 1: Cart screen**

```tsx
// src/pages/cart/ui/cart-screen.tsx
"use client";
import { useCartStore } from "@/entities/cart";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton } from "@/shared/ui";
import Link from "next/link";

export function CartScreen() {
  const items = useCartStore((s) => s.items);
  return (
    <EditorialPageShell>
      <EditorialLabel>СПИСОК ЗАБРАТИ ДОДОМУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кошик</h1>
      {items.length === 0 ? (
        <p className="text-lead text-ink-soft">Кошик порожній.</p>
      ) : (
        <>
          <ul className="divide-y divide-line">
            {items.map((it) => (
              <li key={it.productId} className="flex justify-between py-3">
                <span>{it.title} × {it.qty}</span>
                <span>{it.priceUah} ₴</span>
              </li>
            ))}
          </ul>
          <PillButton asChild><Link href="/checkout">Оформити</Link></PillButton>
        </>
      )}
      <PageStubBanner cluster="checkout" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/cart/index.ts
export { CartScreen } from "./ui/cart-screen";
```

```tsx
// src/app/(public)/cart/page.tsx
import { CartScreen } from "@/pages/cart";
export default function Page() { return <CartScreen />; }
```

- [ ] **Step 2: Checkout screen (form integrated in Phase 6)**

```tsx
// src/pages/checkout/ui/checkout-screen.tsx
"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function CheckoutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БЛАНК-ЗАМОВЛЕННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оформлення</h1>
      <p className="text-lead text-ink-soft">Форма замовлення (Phase 6)</p>
      <PageStubBanner cluster="checkout" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/checkout/index.ts
export { CheckoutScreen } from "./ui/checkout-screen";
```

```tsx
// src/app/(public)/checkout/page.tsx
import { CheckoutScreen } from "@/pages/checkout";
export const dynamic = "force-dynamic";
export default function Page() { return <CheckoutScreen />; }
```

- [ ] **Step 3: Success + Failure screens**

```tsx
// src/pages/checkout-success/ui/checkout-success-screen.tsx
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { Stamp, EditorialLabel } from "@/shared/ui";

export function CheckoutSuccessScreen({ orderId }: { orderId?: string }) {
  return (
    <EditorialPageShell>
      <Stamp text="ВРУЧЕНО" shape="rect" rotation={-3} animateOn="load" trail />
      <EditorialLabel>ПОШТОВА ЛИСТІВКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Дякуємо за замовлення</h1>
      {orderId && <p className="font-hand text-hand-l text-burgundy">№ {orderId}</p>}
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/checkout-success/index.ts
export { CheckoutSuccessScreen } from "./ui/checkout-success-screen";
```

```tsx
// src/app/(public)/checkout/success/page.tsx
import { CheckoutSuccessScreen } from "@/pages/checkout-success";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: { orderId?: string } }) {
  return <CheckoutSuccessScreen orderId={searchParams.orderId} />;
}
```

```tsx
// src/pages/checkout-failure/ui/checkout-failure-screen.tsx
import Link from "next/link";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { Stamp, PillButton, EditorialLabel } from "@/shared/ui";

export function CheckoutFailureScreen() {
  return (
    <EditorialPageShell>
      <Stamp text="ВИПУСК ПОШКОДЖЕНО" rotation={5} animateOn="load" />
      <EditorialLabel>ПЛАТІЖ НЕ ПРИЙНЯТО</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Спробуйте ще раз</h1>
      <PillButton asChild><Link href="/cart">Повернутись до кошика</Link></PillButton>
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/checkout-failure/index.ts
export { CheckoutFailureScreen } from "./ui/checkout-failure-screen";
```

```tsx
// src/app/(public)/checkout/failure/page.tsx
import { CheckoutFailureScreen } from "@/pages/checkout-failure";
export const dynamic = "force-dynamic";
export default function Page() { return <CheckoutFailureScreen />; }
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/cart src/pages/checkout src/pages/checkout-success src/pages/checkout-failure
git add src/app/\(public\)/cart src/app/\(public\)/checkout
git commit -m "feat(pages): cart, checkout, success, failure stubs"
```

---

### Task 67: Login + Register stubs

**Files:** screens + routes

- [ ] **Step 1: Login screen (form in Phase 6)**

```tsx
// src/pages/login/ui/login-screen.tsx
"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function LoginScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Вхід</h1>
      <p className="text-lead text-ink-soft">Форма входу (Phase 6)</p>
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/login/index.ts
export { LoginScreen } from "./ui/login-screen";
```

```tsx
// src/app/(public)/login/page.tsx
import { LoginScreen } from "@/pages/login";
export const metadata = { title: "Вхід" };
export default function Page() { return <LoginScreen />; }
```

- [ ] **Step 2: Register screen**

```tsx
// src/pages/register/ui/register-screen.tsx
"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function RegisterScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстрація</h1>
      <p className="text-lead text-ink-soft">Форма реєстрації (Phase 6)</p>
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/register/index.ts
export { RegisterScreen } from "./ui/register-screen";
```

```tsx
// src/app/(public)/register/page.tsx
import { RegisterScreen } from "@/pages/register";
export const metadata = { title: "Реєстрація" };
export default function Page() { return <RegisterScreen />; }
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/login src/pages/register src/app/\(public\)/login src/app/\(public\)/register
git commit -m "feat(pages): login, register stubs"
```

---

### Task 68: Account page stub (STUDENT|PARENT)

**Files:** screen + route

- [ ] **Step 1: Implement**

```tsx
// src/pages/account/ui/account-screen.tsx
"use client";
import { useAuth } from "@/_app/providers/auth-provider";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton } from "@/shared/ui";

export function AccountScreen() {
  const { user, role, logout } = useAuth();
  return (
    <EditorialPageShell>
      <EditorialLabel>ПЕРСОНАЛЬНИЙ КУТИК</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кабінет</h1>
      <p className="text-lead text-ink-soft">Роль: {role ?? "—"} · userId: {user?.userId ?? "—"}</p>
      <PillButton variant="outline-d" onClick={logout}>Вийти</PillButton>
      <PageStubBanner cluster="auth" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/account/index.ts
export { AccountScreen } from "./ui/account-screen";
```

```tsx
// src/app/account/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { AccountScreen } from "@/pages/account";

export default function Page() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
    else if (role === "ADMIN") router.replace("/admin");
  }, [isAuthenticated, role, router]);
  if (!isAuthenticated || role === "ADMIN") return null;
  return <AccountScreen />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/account src/app/account
git commit -m "feat(pages/account): account stub for STUDENT|PARENT"
```

---

### Task 69: Parent KYC + Card-update stubs

**Files:** screens + routes

- [ ] **Step 1: KYC screen**

```tsx
// src/pages/parent-kyc/ui/parent-kyc-screen.tsx
import { Stamp, EditorialLabel, Sticker } from "@/shared/ui";

export function ParentKycScreen({ token }: { token: string }) {
  return (
    <div className="space-y-6 py-10">
      <Sticker color="yellow" rotation={-3}>КОНФІДЕНЦІЙНО</Sticker>
      <EditorialLabel color="burgundy">ЗГОДА БАТЬКІВ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Magic-link для батьків</h1>
      <p className="text-lead text-ink-soft">Token: {token.slice(0, 8)}…</p>
      <Stamp text="EST. 1957" rotation={-8} animateOn="load" size={80} />
      <p className="text-small text-ink-fade">Форма KYC (Phase 6)</p>
    </div>
  );
}
```

```ts
// src/pages/parent-kyc/index.ts
export { ParentKycScreen } from "./ui/parent-kyc-screen";
```

```tsx
// src/app/parent/kyc/[token]/page.tsx
import { ParentKycScreen } from "@/pages/parent-kyc";
export const dynamic = "force-dynamic";
export default function Page({ params }: { params: { token: string } }) {
  return <ParentKycScreen token={params.token} />;
}
```

- [ ] **Step 2: Card-update screen**

```tsx
// src/pages/parent-card-update/ui/parent-card-update-screen.tsx
import { EditorialLabel } from "@/shared/ui";

export function ParentCardUpdateScreen({ token }: { token: string }) {
  return (
    <div className="space-y-6 py-10">
      <EditorialLabel color="burgundy">ОНОВЛЕННЯ КАРТКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оновити картку для виплат</h1>
      <p className="text-lead text-ink-soft">Token: {token.slice(0, 8)}…</p>
      <p className="text-small text-ink-fade">Форма оновлення (Phase 6)</p>
    </div>
  );
}
```

```ts
// src/pages/parent-card-update/index.ts
export { ParentCardUpdateScreen } from "./ui/parent-card-update-screen";
```

```tsx
// src/app/parent/card-update/[token]/page.tsx
import { ParentCardUpdateScreen } from "@/pages/parent-card-update";
export const dynamic = "force-dynamic";
export default function Page({ params }: { params: { token: string } }) {
  return <ParentCardUpdateScreen token={params.token} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/parent-kyc src/pages/parent-card-update src/app/parent
git commit -m "feat(pages): parent KYC and card-update stubs"
```

---

### Task 70: Student stubs (dashboard, products list/new/edit, finance)

**Files:** five screens + routes

- [ ] **Step 1: Dashboard**

```tsx
// src/pages/student-dashboard/ui/student-dashboard-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentDashboardScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>КАБІНЕТ УЧНЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Привіт! Що сьогодні створюєш?</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/student-dashboard/index.ts
export { StudentDashboardScreen } from "./ui/student-dashboard-screen";
```

```tsx
// src/app/student/page.tsx
import { StudentDashboardScreen } from "@/pages/student-dashboard";
export default function Page() { return <StudentDashboardScreen />; }
```

- [ ] **Step 2: Products list, new, edit**

```tsx
// src/pages/student-products/ui/student-products-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentProductsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>МОЇ РОБОТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог моїх робіт</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/student-products/index.ts
export { StudentProductsScreen } from "./ui/student-products-screen";
```

```tsx
// src/app/student/products/page.tsx
import { StudentProductsScreen } from "@/pages/student-products";
export default function Page() { return <StudentProductsScreen />; }
```

```tsx
// src/pages/student-product-new/ui/student-product-new-screen.tsx
"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentProductNewScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА РОБОТА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Додати роботу</h1>
      <p className="text-lead text-ink-soft">Форма (Phase 6)</p>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/student-product-new/index.ts
export { StudentProductNewScreen } from "./ui/student-product-new-screen";
```

```tsx
// src/app/student/products/new/page.tsx
import { StudentProductNewScreen } from "@/pages/student-product-new";
export default function Page() { return <StudentProductNewScreen />; }
```

```tsx
// src/pages/student-product-edit/ui/student-product-edit-screen.tsx
"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentProductEditScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>РЕДАГУВАННЯ ЧЕРНЕТКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Робота {id}</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/student-product-edit/index.ts
export { StudentProductEditScreen } from "./ui/student-product-edit-screen";
```

```tsx
// src/app/student/products/[id]/edit/page.tsx
import { StudentProductEditScreen } from "@/pages/student-product-edit";
export default function Page({ params }: { params: { id: string } }) {
  return <StudentProductEditScreen id={params.id} />;
}
```

- [ ] **Step 3: Finance**

```tsx
// src/pages/student-finance/ui/student-finance-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function StudentFinanceScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>РОЗРАХУНОК</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Фінанси</h1>
      <PageStubBanner cluster="student" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/student-finance/index.ts
export { StudentFinanceScreen } from "./ui/student-finance-screen";
```

```tsx
// src/app/student/finance/page.tsx
import { StudentFinanceScreen } from "@/pages/student-finance";
export default function Page() { return <StudentFinanceScreen />; }
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/student-dashboard src/pages/student-products src/pages/student-product-new src/pages/student-product-edit src/pages/student-finance src/app/student
git commit -m "feat(pages): student dashboard, products list/new/edit, finance stubs"
```

---

### Task 71: Admin stubs (dashboard, 2fa, products, order, payouts, tax-report)

**Files:** six screens + routes

- [ ] **Step 1: Implement six stub screens (each follows same pattern)**

```tsx
// src/pages/admin-dashboard/ui/admin-dashboard-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";

export function AdminDashboardScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>АДМІНІСТРУВАННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Кабінет адміністратора</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
```

```ts
// src/pages/admin-dashboard/index.ts
export { AdminDashboardScreen } from "./ui/admin-dashboard-screen";
```

```tsx
// src/app/admin/page.tsx
import { AdminDashboardScreen } from "@/pages/admin-dashboard";
export default function Page() { return <AdminDashboardScreen />; }
```

Repeat for: `admin-2fa`, `admin-products`, `admin-order`, `admin-payouts`, `admin-tax-report`. Each:

```tsx
// src/pages/admin-2fa/ui/admin-2fa-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function Admin2faScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ДВОФАКТОРНА АВТЕНТИФІКАЦІЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">2FA</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
```
```ts
export { Admin2faScreen } from "./ui/admin-2fa-screen";
```
```tsx
// src/app/admin/2fa/page.tsx
import { Admin2faScreen } from "@/pages/admin-2fa";
export default function Page() { return <Admin2faScreen />; }
```

```tsx
// src/pages/admin-products/ui/admin-products-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function AdminProductsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>МОДЕРАЦІЯ РОБІТ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Роботи на перевірку</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
```
```ts
export { AdminProductsScreen } from "./ui/admin-products-screen";
```
```tsx
// src/app/admin/products/page.tsx
import { AdminProductsScreen } from "@/pages/admin-products";
export default function Page() { return <AdminProductsScreen />; }
```

```tsx
// src/pages/admin-order/ui/admin-order-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function AdminOrderScreen({ id }: { id: string }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ЗАМОВЛЕННЯ #{id}</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Деталі</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
```
```ts
export { AdminOrderScreen } from "./ui/admin-order-screen";
```
```tsx
// src/app/admin/orders/[id]/page.tsx
import { AdminOrderScreen } from "@/pages/admin-order";
export default function Page({ params }: { params: { id: string } }) {
  return <AdminOrderScreen id={params.id} />;
}
```

```tsx
// src/pages/admin-payouts/ui/admin-payouts-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
export function AdminPayoutsScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>ВИПЛАТИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстр виплат</h1>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
```
```ts
export { AdminPayoutsScreen } from "./ui/admin-payouts-screen";
```
```tsx
// src/app/admin/payouts/page.tsx
import { AdminPayoutsScreen } from "@/pages/admin-payouts";
export default function Page() { return <AdminPayoutsScreen />; }
```

```tsx
// src/pages/admin-tax-report/ui/admin-tax-report-screen.tsx
"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton } from "@/shared/ui";
import { downloadTaxReport, getAccessToken } from "@/shared/api";

export function AdminTaxReportScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>4DF · ЗВІТ ПДФО</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Податковий звіт</h1>
      <PillButton onClick={() => {
        const token = getAccessToken();
        if (token) void downloadTaxReport("2026-01-01", "2026-12-31", token);
      }}>Завантажити CSV</PillButton>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
```
```ts
export { AdminTaxReportScreen } from "./ui/admin-tax-report-screen";
```
```tsx
// src/app/admin/reports/tax/page.tsx
import { AdminTaxReportScreen } from "@/pages/admin-tax-report";
export default function Page() { return <AdminTaxReportScreen />; }
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin-dashboard src/pages/admin-2fa src/pages/admin-products src/pages/admin-order src/pages/admin-payouts src/pages/admin-tax-report
git add src/app/admin
git commit -m "feat(pages): admin dashboard, 2fa, products, order, payouts, tax-report stubs"
```

---

### Phase 5 Checkpoint

- [ ] **Run pnpm typecheck && pnpm lint && pnpm vitest run && pnpm build**

Expected: PASS, all 12 routes pre-render or render dynamically per directives.

- [ ] **Visual smoke**

```bash
pnpm dev
```

Visit each route via browser:
- `/`, `/catalog`, `/p/test-slug`, `/authors/test`, `/collections`, `/about`, `/contacts`
- `/cart`, `/checkout`, `/checkout/success?orderId=X`, `/checkout/failure`
- `/login`, `/register`
- `/parent/kyc/abc`, `/parent/card-update/abc`
- `/student/*`, `/admin/*`, `/account` (will redirect without cookie — expected)
---

## Phase 6 — Forms infrastructure + 8 live forms

### Task 72: useAppForm + FormErrorSummary

**Files:** `src/shared/lib/forms/use-app-form.ts`, `src/shared/ui/form/{form.tsx,form-row.tsx,form-footer.tsx,form-error.tsx,form-section.tsx,form-error-summary.tsx,index.ts}`

- [ ] **Step 1: Implement `src/shared/lib/forms/use-app-form.ts`**

```ts
"use client";
import { useForm, type UseFormProps, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { applyApiErrorToForm } from "@/shared/api";
import { toast } from "@/shared/ui";
import { useScrollToFirstError } from "@/shared/hooks/use-scroll-to-first-error";

export function useAppForm<S extends z.ZodType>(opts: {
  schema: S;
  defaultValues: z.input<S>;
  onSubmit: (data: z.output<S>) => Promise<void> | void;
  formProps?: Omit<UseFormProps, "resolver" | "defaultValues">;
}) {
  const form = useForm<z.input<S>>({
    resolver: zodResolver(opts.schema),
    defaultValues: opts.defaultValues as never,
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldFocusError: true,
    criteriaMode: "all",
    ...opts.formProps,
  });

  useScrollToFirstError(form.formState.errors as never, form.formState.isSubmitted);

  const handleSubmit = form.handleSubmit(
    async (data) => {
      try { await opts.onSubmit(data as z.output<S>); }
      catch (e) { if (!applyApiErrorToForm(e, form.setError as never)) throw e; }
    },
    () => { toast.error("Перевірте форму — є незаповнені поля"); },
  );

  return { ...form, handleSubmit };
}
```

- [ ] **Step 2: Implement form ui primitives**

```tsx
// src/shared/ui/form/form.tsx
import type { FormHTMLAttributes } from "react";
import { cn } from "@/shared/lib";
export function Form({ className, ...rest }: FormHTMLAttributes<HTMLFormElement>) {
  return <form noValidate className={cn("space-y-5", className)} {...rest} />;
}
```

```tsx
// src/shared/ui/form/form-row.tsx
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function FormRow({ cols = 1, className, children }: { cols?: 1 | 2 | 3; className?: string; children: ReactNode }) {
  const colMap = { 1: "grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3" } as const;
  return <div className={cn("grid gap-5", colMap[cols], className)}>{children}</div>;
}
```

```tsx
// src/shared/ui/form/form-footer.tsx
import { cn } from "@/shared/lib";
import type { ReactNode } from "react";
export function FormFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex items-center justify-between pt-4", className)}>{children}</div>;
}
```

```tsx
// src/shared/ui/form/form-error.tsx
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="rounded-md border-l-4 border-error bg-error/5 p-3 text-small text-error">{message}</p>;
}
```

```tsx
// src/shared/ui/form/form-section.tsx
import type { ReactNode } from "react";
import { EditorialDivider, EditorialLabel } from "@/shared/ui";
export function FormSection({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <EditorialDivider variant="dashed" />
      <EditorialLabel color="burgundy">{title}</EditorialLabel>
      {hint && <p className="text-small text-ink-soft">{hint}</p>}
      {children}
    </section>
  );
}
```

```tsx
// src/shared/ui/form/form-error-summary.tsx
"use client";
import type { FieldErrors } from "react-hook-form";

export function FormErrorSummary({
  errors, fieldLabels, threshold = 3,
}: {
  errors: FieldErrors;
  fieldLabels: Record<string, string>;
  threshold?: number;
}) {
  const list = Object.keys(errors);
  if (list.length < threshold) return null;
  return (
    <div role="alert" className="rounded-md border-l-4 border-error bg-error/5 p-4">
      <p className="text-label text-error">▌ ПОТРІБНО ВИПРАВИТИ</p>
      <ul className="mt-2 space-y-1 text-small">
        {list.map((name) => (
          <li key={name}>
            <a
              href={`#field-${name}`}
              className="text-burgundy underline underline-offset-2 hover:text-burgundy-deep"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`field-${name}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                document.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();
              }}
            >
              {fieldLabels[name] ?? name}: {String(errors[name]?.message ?? "невалідно")}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

```ts
// src/shared/ui/form/index.ts
export { Form } from "./form";
export { FormRow } from "./form-row";
export { FormFooter } from "./form-footer";
export { FormError } from "./form-error";
export { FormSection } from "./form-section";
export { FormErrorSummary } from "./form-error-summary";
```

- [ ] **Step 3: Add to `src/shared/ui/index.ts` barrel**

```ts
// append to src/shared/ui/index.ts
export * from "./form";
```

- [ ] **Step 4: Commit**

```bash
git add src/shared/lib/forms src/shared/ui/form src/shared/ui/index.ts
git commit -m "feat(forms): useAppForm + form primitives + error summary"
```

---

### Task 73: LoginForm

**Files:** `src/features/auth/{ui/login-form.tsx,model/use-login.ts,model/schemas.ts,index.ts}`, modify `src/pages/login/ui/login-screen.tsx`, test

- [ ] **Step 1: `src/features/auth/model/schemas.ts`**

```ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Невірний email").max(255),
  password: z.string().min(8, "Мінімум 8 символів").max(128),
});
export type LoginInput = z.input<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1, "Обовʼязкове").max(100),
  lastName: z.string().min(1, "Обовʼязкове").max(100),
  grade: z.string().regex(/^\d{1,2}-[А-ЯA-Z]$/, "формат 9-А або 11-B"),
  parentEmail: z.string().email().max(255),
}).refine((d) => d.email !== d.parentEmail, {
  message: "Email учня й батьків мають відрізнятись",
  path: ["parentEmail"],
});
export type RegisterInput = z.input<typeof RegisterSchema>;
```

- [ ] **Step 2: `src/features/auth/model/use-login.ts`**

```ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { authApi, setSnapshot } from "@/shared/api";

export function useLogin() {
  return useMutation({
    mutationFn: (b: { email: string; password: string }) => authApi.login(b),
    onSuccess: (t) => {
      setSnapshot({
        accessToken: t.accessToken,
        userId: t.userId,
        role: t.role,
        expiresAt: Date.now() + t.expiresIn * 1000,
      });
    },
  });
}
```

- [ ] **Step 3: `src/features/auth/ui/login-form.tsx`**

```tsx
"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter } from "@/shared/ui";
import { LoginSchema, type LoginInput } from "../model/schemas";
import { useLogin } from "../model/use-login";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const m = useLogin();
  const form = useAppForm({
    schema: LoginSchema,
    defaultValues: { email: "", password: "" } as LoginInput,
    onSubmit: async (data) => {
      await m.mutateAsync(data);
      router.push(sp.get("from") ?? "/");
    },
  });
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-md">
      <FormField name="email" label="Email" required error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </FormField>
      <FormField name="password" label="Пароль" required hint="8+ символів" error={form.formState.errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...form.register("password")} />
      </FormField>
      <FormFooter>
        <Link href="/register" className="font-hand text-hand-s text-burgundy">Немає картки? Зареєструйся</Link>
        <PillButton type="submit" loading={m.isPending}>Увійти</PillButton>
      </FormFooter>
    </Form>
  );
}
```

- [ ] **Step 4: `src/features/auth/index.ts`**

```ts
export { LoginForm } from "./ui/login-form";
export { RegisterForm } from "./ui/register-form";
export { useLogin } from "./model/use-login";
export { LoginSchema, RegisterSchema } from "./model/schemas";
export type { LoginInput, RegisterInput } from "./model/schemas";
```

- [ ] **Step 5: Wire into `src/pages/login/ui/login-screen.tsx`**

```tsx
"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export function LoginScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БІБЛІОТЕЧНА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Вхід</h1>
      <LoginForm />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 6: Component test** `tests/component/forms/login-form.test.tsx`

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "@/features/auth";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrap = (ui: React.ReactNode) => <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>;

describe("LoginForm", () => {
  it("validates email and password client-side", async () => {
    render(wrap(<LoginForm />));
    await userEvent.click(screen.getByRole("button", { name: /Увійти/ }));
    await waitFor(() => {
      expect(screen.getByText(/Невірний email/)).toBeInTheDocument();
      expect(screen.getByText(/Мінімум 8 символів/)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 7: Run, expect PASS**

- [ ] **Step 8: Commit**

```bash
git add src/features/auth src/pages/login tests/component/forms/login-form.test.tsx
git commit -m "feat(features/auth): LoginForm wired into /login page"
```

---

### Task 74: RegisterForm

**Files:** `src/features/auth/ui/register-form.tsx`, `src/features/auth/model/use-register.ts`, modify `src/pages/register/ui/register-screen.tsx`

- [ ] **Step 1: `src/features/auth/model/use-register.ts`**

```ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { authApi, type RegisterRequest } from "@/shared/api";
export function useRegister() {
  return useMutation({ mutationFn: (b: RegisterRequest) => authApi.register(b) });
}
```

- [ ] **Step 2: `src/features/auth/ui/register-form.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import {
  Form, FormRow, FormField, Input, PillButton, FormFooter,
  FormErrorSummary, Sticker,
} from "@/shared/ui";
import { RegisterSchema, type RegisterInput } from "../model/schemas";
import { useRegister } from "./../model/use-register";

const fieldLabels: Record<string, string> = {
  email: "Email учня", password: "Пароль", firstName: "Імʼя", lastName: "Прізвище",
  grade: "Клас", parentEmail: "Email батьків",
};

export function RegisterForm() {
  const [done, setDone] = useState<string | null>(null);
  const m = useRegister();
  const form = useAppForm({
    schema: RegisterSchema,
    defaultValues: {
      email: "", password: "", firstName: "", lastName: "", grade: "", parentEmail: "",
    } as RegisterInput,
    onSubmit: async (data) => {
      await m.mutateAsync(data);
      setDone(data.parentEmail);
    },
  });

  if (done) return (
    <Sticker color="yellow" rotation={-2} signature="— очікуй на лист">
      Лист зі згодою надіслано на {done}
    </Sticker>
  );

  return (
    <Form onSubmit={form.handleSubmit} className="max-w-2xl">
      <FormErrorSummary errors={form.formState.errors as never} fieldLabels={fieldLabels} />
      <FormRow cols={2}>
        <FormField name="firstName" label="Імʼя" required error={form.formState.errors.firstName?.message}>
          <Input {...form.register("firstName")} />
        </FormField>
        <FormField name="lastName" label="Прізвище" required error={form.formState.errors.lastName?.message}>
          <Input {...form.register("lastName")} />
        </FormField>
      </FormRow>
      <FormRow cols={2}>
        <FormField name="email" label="Email учня" required error={form.formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField name="grade" label="Клас" required hint="формат 9-А або 11-B" error={form.formState.errors.grade?.message}>
          <Input placeholder="9-А" {...form.register("grade")} />
        </FormField>
      </FormRow>
      <FormField name="password" label="Пароль" required hint="8+ символів" error={form.formState.errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...form.register("password")} />
      </FormField>
      <FormField name="parentEmail" label="Email батьків" required
        hint="Надішлемо їм запит на згоду" error={form.formState.errors.parentEmail?.message}>
        <Input type="email" {...form.register("parentEmail")} />
      </FormField>
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>Зареєструватись</PillButton>
      </FormFooter>
    </Form>
  );
}
```

- [ ] **Step 3: Wire into `src/pages/register/ui/register-screen.tsx`**

```tsx
"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { RegisterForm } from "@/features/auth";

export function RegisterScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА КАРТКА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Реєстрація</h1>
      <RegisterForm />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/ui/register-form.tsx src/features/auth/model/use-register.ts src/pages/register
git commit -m "feat(features/auth): RegisterForm wired into /register page"
```

---

### Task 75: CheckoutForm + cart-revalidator

**Files:** `src/features/checkout/{ui/checkout-form.tsx,model/use-create-order.ts,model/cart-revalidator.ts,model/schemas.ts,index.ts}`, modify `src/pages/checkout/ui/checkout-screen.tsx`

- [ ] **Step 1: `src/features/checkout/model/schemas.ts`**

```ts
import { z } from "zod";
export const CheckoutSchema = z.object({
  buyerEmail: z.string().email("Невірний email").max(255),
  buyerName: z.string().min(1, "Обовʼязкове").max(255),
  buyerPhone: z.string().regex(/^\+380\d{9}$/, "Формат +380XXXXXXXXX"),
});
export type CheckoutInput = z.input<typeof CheckoutSchema>;
```

- [ ] **Step 2: `src/features/checkout/model/cart-revalidator.ts`**

```ts
"use client";
import { catalogApi } from "@/shared/api";
import type { CartItem } from "@/entities/cart";

export type CartRevalidationIssue =
  | { productId: string; reason: "unavailable" }
  | { productId: string; reason: "insufficient-stock"; available: number };

export async function revalidateCart(items: CartItem[]): Promise<CartRevalidationIssue[]> {
  const issues: CartRevalidationIssue[] = [];
  await Promise.all(items.map(async (it) => {
    try {
      const p = await catalogApi.bySlug(it.slug);
      if (it.type === "PHYSICAL" && p.stockQty < it.qty) {
        issues.push({ productId: it.productId, reason: "insufficient-stock", available: p.stockQty });
      }
    } catch {
      issues.push({ productId: it.productId, reason: "unavailable" });
    }
  }));
  return issues;
}
```

- [ ] **Step 3: `src/features/checkout/model/use-create-order.ts`**

```ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { ordersApi, type CreateOrderRequest } from "@/shared/api";
export function useCreateOrder() {
  return useMutation({ mutationFn: (b: CreateOrderRequest) => ordersApi.create(b) });
}
```

- [ ] **Step 4: `src/features/checkout/ui/checkout-form.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, FormError } from "@/shared/ui";
import { useCartStore } from "@/entities/cart";
import { CheckoutSchema, type CheckoutInput } from "../model/schemas";
import { useCreateOrder } from "../model/use-create-order";
import { revalidateCart, type CartRevalidationIssue } from "../model/cart-revalidator";

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const totalUah = useCartStore((s) => s.totalUah)();
  const clear = useCartStore((s) => s.clear);
  const [issues, setIssues] = useState<CartRevalidationIssue[]>([]);
  const m = useCreateOrder();

  const form = useAppForm({
    schema: CheckoutSchema,
    defaultValues: { buyerEmail: "", buyerName: "", buyerPhone: "+380" } as CheckoutInput,
    onSubmit: async (data) => {
      const newIssues = await revalidateCart(items);
      if (newIssues.length) { setIssues(newIssues); return; }
      const resp = await m.mutateAsync({
        ...data,
        items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
      });
      clear();
      window.location.href = resp.paymentUrl;
    },
  });

  if (items.length === 0) return <p className="text-lead text-ink-soft">Кошик порожній.</p>;

  return (
    <Form onSubmit={form.handleSubmit} className="grid gap-8 md:grid-cols-[2fr,1fr]">
      <div className="space-y-5">
        {issues.length > 0 && (
          <FormError message={`Деякі товари недоступні: ${issues.map((i) => i.productId).join(", ")}. Поверніться у кошик.`} />
        )}
        <FormField name="buyerName" label="Імʼя та прізвище" required error={form.formState.errors.buyerName?.message}>
          <Input {...form.register("buyerName")} />
        </FormField>
        <FormField name="buyerEmail" label="Email" required error={form.formState.errors.buyerEmail?.message}>
          <Input type="email" {...form.register("buyerEmail")} />
        </FormField>
        <FormField name="buyerPhone" label="Телефон" required hint="+380XXXXXXXXX" error={form.formState.errors.buyerPhone?.message}>
          <Input type="tel" {...form.register("buyerPhone")} />
        </FormField>
        <FormFooter>
          <span />
          <PillButton type="submit" loading={m.isPending}>
            {m.isPending ? "Зʼєднання з LiqPay…" : `Сплатити ${totalUah} ₴`}
          </PillButton>
        </FormFooter>
      </div>
      <aside className="space-y-3 rounded-md bg-bg-card p-5 shadow-paper">
        <p className="text-label text-burgundy">▌ ЗАМОВЛЕННЯ</p>
        <ul className="divide-y divide-line text-small">
          {items.map((it) => (
            <li key={it.productId} className="flex justify-between py-2">
              <span>{it.title} × {it.qty}</span>
              <span>{it.priceUah} ₴</span>
            </li>
          ))}
        </ul>
        <p className="border-t border-ink pt-2 text-h3 font-bold text-burgundy">{totalUah} ₴</p>
      </aside>
    </Form>
  );
}
```

- [ ] **Step 5: `src/features/checkout/index.ts`**

```ts
export { CheckoutForm } from "./ui/checkout-form";
export { CheckoutSchema } from "./model/schemas";
export type { CheckoutInput } from "./model/schemas";
```

- [ ] **Step 6: Wire into `src/pages/checkout/ui/checkout-screen.tsx`**

```tsx
"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { CheckoutForm } from "@/features/checkout";

export function CheckoutScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>БЛАНК-ЗАМОВЛЕННЯ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оформлення</h1>
      <CheckoutForm />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/features/checkout src/pages/checkout
git commit -m "feat(features/checkout): CheckoutForm with cart revalidation + idempotent POST"
```

---

### Task 76: KycSubmitForm

**Files:** `src/features/kyc-submit/{ui/kyc-submit-form.tsx,model/use-submit-kyc.ts,model/schemas.ts,index.ts}`, modify `src/pages/parent-kyc/ui/parent-kyc-screen.tsx`

- [ ] **Step 1: Schema**

```ts
// src/features/kyc-submit/model/schemas.ts
import { z } from "zod";
export const KycSubmitSchema = z.object({
  parentName: z.string().min(1, "Обовʼязкове").max(255),
  parentRnokpp: z.string().regex(/^\d{10}$/, "10 цифр"),
  payoutCard: z.string().regex(/^[\d\s]{13,23}$/, "13–19 цифр").transform((v) => v.replace(/\s/g, "")),
});
export type KycSubmitInput = z.input<typeof KycSubmitSchema>;
```

- [ ] **Step 2: Mutation**

```ts
// src/features/kyc-submit/model/use-submit-kyc.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { kycApi, type KycSubmitRequest } from "@/shared/api";
export function useSubmitKyc(token: string) {
  return useMutation({ mutationFn: (b: KycSubmitRequest) => kycApi.submit(token, b) });
}
```

- [ ] **Step 3: Form**

```tsx
// src/features/kyc-submit/ui/kyc-submit-form.tsx
"use client";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, FormErrorSummary } from "@/shared/ui";
import { KycSubmitSchema, type KycSubmitInput } from "../model/schemas";
import { useSubmitKyc } from "../model/use-submit-kyc";

const labels: Record<string, string> = {
  parentName: "Імʼя батька/матері", parentRnokpp: "РНОКПП", payoutCard: "Картка для виплат",
};

export function KycSubmitForm({ token }: { token: string }) {
  const m = useSubmitKyc(token);
  const form = useAppForm({
    schema: KycSubmitSchema,
    defaultValues: { parentName: "", parentRnokpp: "", payoutCard: "" } as KycSubmitInput,
    onSubmit: async (data) => {
      const r = await m.mutateAsync(data);
      if (r.signDocumentUrl) window.location.href = r.signDocumentUrl;
    },
  });
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-xl">
      <FormErrorSummary errors={form.formState.errors as never} fieldLabels={labels} />
      <FormField name="parentName" label="Імʼя батька/матері" required error={form.formState.errors.parentName?.message}>
        <Input {...form.register("parentName")} />
      </FormField>
      <FormField name="parentRnokpp" label="РНОКПП" required hint="10 цифр" error={form.formState.errors.parentRnokpp?.message}>
        <Input inputMode="numeric" maxLength={10} {...form.register("parentRnokpp")} />
      </FormField>
      <FormField name="payoutCard" label="Номер картки" required hint="13–19 цифр" error={form.formState.errors.payoutCard?.message}>
        <Input inputMode="numeric" {...form.register("payoutCard")} />
      </FormField>
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>Надіслати на e-підпис</PillButton>
      </FormFooter>
    </Form>
  );
}
```

- [ ] **Step 4: `src/features/kyc-submit/index.ts`**

```ts
export { KycSubmitForm } from "./ui/kyc-submit-form";
export { KycSubmitSchema } from "./model/schemas";
```

- [ ] **Step 5: Wire into `src/pages/parent-kyc/ui/parent-kyc-screen.tsx`**

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { kycApi } from "@/shared/api";
import { Stamp, EditorialLabel, Sticker } from "@/shared/ui";
import { KycSubmitForm } from "@/features/kyc-submit";

export function ParentKycScreen({ token }: { token: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["kyc", "session", token],
    queryFn: () => kycApi.peek(token),
    retry: false,
  });
  if (isLoading) return <p className="py-10 text-lead text-ink-soft">Завантаження…</p>;
  if (isError || !data) return (
    <div className="space-y-4 py-10">
      <Stamp text="ВИПУСК ПОШКОДЖЕНО" rotation={5} animateOn="load" />
      <p className="text-lead text-error">Посилання прострочене або битке. Зверніться до Ліцею.</p>
    </div>
  );
  return (
    <div className="space-y-6 py-10">
      <Sticker color="yellow" rotation={-3}>КОНФІДЕНЦІЙНО</Sticker>
      <EditorialLabel color="burgundy">ЗГОДА БАТЬКІВ — {data.studentName} ({data.grade})</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оформлення згоди</h1>
      <p className="max-w-xl text-body text-ink">
        Ці дані потрібні для виплат за продані роботи учня. Шифруємо за GDPR.
      </p>
      {data.status === "AWAITING_DETAILS" ? <KycSubmitForm token={token} /> : (
        <p className="text-lead text-ink-soft">Статус: {data.status}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/features/kyc-submit src/pages/parent-kyc
git commit -m "feat(features/kyc-submit): KYC form wired into /parent/kyc/[token]"
```

---

### Task 77: KycCardUpdateForm + wire

**Files:** `src/features/kyc-card-update/{ui/kyc-card-update-form.tsx,model/schemas.ts,index.ts}`, modify `src/pages/parent-card-update/ui/parent-card-update-screen.tsx`

- [ ] **Step 1: Schema + form**

```ts
// src/features/kyc-card-update/model/schemas.ts
import { z } from "zod";
export const CardUpdateSchema = z.object({
  payoutCard: z.string().regex(/^[\d\s]{13,23}$/, "13–19 цифр").transform((v) => v.replace(/\s/g, "")),
});
export type CardUpdateInput = z.input<typeof CardUpdateSchema>;
```

```tsx
// src/features/kyc-card-update/ui/kyc-card-update-form.tsx
"use client";
import { useMutation } from "@tanstack/react-query";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Input, PillButton, FormFooter, toast } from "@/shared/ui";
import { kycApi } from "@/shared/api";
import { CardUpdateSchema, type CardUpdateInput } from "../model/schemas";

export function KycCardUpdateForm({ token }: { token: string }) {
  const m = useMutation({ mutationFn: (card: string) => kycApi.updateCard(token, card) });
  const form = useAppForm({
    schema: CardUpdateSchema,
    defaultValues: { payoutCard: "" } as CardUpdateInput,
    onSubmit: async (data) => {
      await m.mutateAsync(data.payoutCard);
      toast.success("Картку оновлено");
    },
  });
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-md">
      <FormField name="payoutCard" label="Нова картка" required error={form.formState.errors.payoutCard?.message}>
        <Input inputMode="numeric" {...form.register("payoutCard")} />
      </FormField>
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>Оновити картку</PillButton>
      </FormFooter>
    </Form>
  );
}
```

```ts
// src/features/kyc-card-update/index.ts
export { KycCardUpdateForm } from "./ui/kyc-card-update-form";
```

- [ ] **Step 2: Wire**

```tsx
// src/pages/parent-card-update/ui/parent-card-update-screen.tsx
"use client";
import { EditorialLabel } from "@/shared/ui";
import { KycCardUpdateForm } from "@/features/kyc-card-update";

export function ParentCardUpdateScreen({ token }: { token: string }) {
  return (
    <div className="space-y-6 py-10">
      <EditorialLabel color="burgundy">ОНОВЛЕННЯ КАРТКИ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Оновити картку для виплат</h1>
      <KycCardUpdateForm token={token} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kyc-card-update src/pages/parent-card-update
git commit -m "feat(features/kyc-card-update): card update form wired"
```

---

### Task 78: CreateProductForm

**Files:** `src/features/product-create/{ui/create-product-form.tsx,model/schemas.ts,model/use-create-product.ts,index.ts}`, modify `src/pages/student-product-new/ui/student-product-new-screen.tsx`

- [ ] **Step 1: Schema**

```ts
// src/features/product-create/model/schemas.ts
import { z } from "zod";
export const CreateProductSchema = z.object({
  title: z.string().min(1, "Обовʼязкове").max(200),
  description: z.string().min(1, "Обовʼязкове").max(10_000),
  priceUah: z.string().regex(/^\d+(\.\d{1,2})?$/, "Формат 850.00").refine((v) => {
    const n = parseFloat(v); return n >= 50 && n <= 50_000;
  }, "Від 50.00 до 50000.00"),
  type: z.enum(["PHYSICAL", "DIGITAL"]),
  stockQty: z.coerce.number().int().min(0),
}).refine((d) => d.type === "DIGITAL" || d.stockQty > 0, {
  message: "Для PHYSICAL вкажіть кількість > 0", path: ["stockQty"],
});
export type CreateProductInput = z.input<typeof CreateProductSchema>;
```

- [ ] **Step 2: Mutation**

```ts
// src/features/product-create/model/use-create-product.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { studentApi, type CreateProductRequest } from "@/shared/api";
export function useCreateProduct() {
  return useMutation({ mutationFn: (b: CreateProductRequest) => studentApi.products.create(b) });
}
```

- [ ] **Step 3: Form**

```tsx
// src/features/product-create/ui/create-product-form.tsx
"use client";
import { useRouter } from "next/navigation";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import {
  Form, FormField, Input, Textarea, PillButton, FormFooter, FormErrorSummary,
} from "@/shared/ui";
import { CreateProductSchema, type CreateProductInput } from "../model/schemas";
import { useCreateProduct } from "../model/use-create-product";

const labels = { title: "Назва", description: "Опис", priceUah: "Ціна", type: "Тип", stockQty: "Залишок" };

export function CreateProductForm() {
  const router = useRouter();
  const m = useCreateProduct();
  const form = useAppForm({
    schema: CreateProductSchema,
    defaultValues: { title: "", description: "", priceUah: "", type: "PHYSICAL", stockQty: 1 } as CreateProductInput,
    onSubmit: async (data) => {
      const { id } = await m.mutateAsync({
        title: data.title, description: data.description, priceUah: data.priceUah,
        type: data.type, stockQty: data.stockQty,
      });
      router.push(`/student/products/${id}/edit`);
    },
  });
  const type = form.watch("type");
  return (
    <Form onSubmit={form.handleSubmit} className="max-w-2xl">
      <FormErrorSummary errors={form.formState.errors as never} fieldLabels={labels} />
      <FormField name="title" label="Назва" required error={form.formState.errors.title?.message}>
        <Input {...form.register("title")} />
      </FormField>
      <FormField name="description" label="Опис" required error={form.formState.errors.description?.message}>
        <Textarea rows={8} {...form.register("description")} />
      </FormField>
      <FormField name="priceUah" label="Ціна (UAH)" required hint="50.00 — 50000.00" error={form.formState.errors.priceUah?.message}>
        <Input inputMode="decimal" {...form.register("priceUah")} />
      </FormField>
      <FormField name="type" label="Тип" required>
        <select {...form.register("type")} className="h-14 w-full rounded-md border border-line bg-bg-card px-4">
          <option value="PHYSICAL">PHYSICAL</option>
          <option value="DIGITAL">DIGITAL</option>
        </select>
      </FormField>
      {type === "PHYSICAL" && (
        <FormField name="stockQty" label="Залишок" required error={form.formState.errors.stockQty?.message}>
          <Input type="number" min={1} {...form.register("stockQty", { valueAsNumber: true })} />
        </FormField>
      )}
      <FormFooter>
        <span />
        <PillButton type="submit" loading={m.isPending}>Зберегти чернетку</PillButton>
      </FormFooter>
    </Form>
  );
}
```

```ts
// src/features/product-create/index.ts
export { CreateProductForm } from "./ui/create-product-form";
```

- [ ] **Step 4: Wire**

```tsx
// src/pages/student-product-new/ui/student-product-new-screen.tsx
"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import { CreateProductForm } from "@/features/product-create";

export function StudentProductNewScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>НОВА РОБОТА</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Додати роботу</h1>
      <CreateProductForm />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/features/product-create src/pages/student-product-new
git commit -m "feat(features/product-create): create-product form wired"
```

---

### Task 79: useUploadProductImage hook (no widget)

**Files:** `src/features/product-image-upload/{model/use-upload-product-image.ts,index.ts}`

- [ ] **Step 1: Implement**

```ts
// src/features/product-image-upload/model/use-upload-product-image.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { studentApi, uploadToS3 } from "@/shared/api";

export type UploadInput = { productId: string; file: File; primary: boolean; signal?: AbortSignal };

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async ({ productId, file, primary, signal }: UploadInput) => {
      const presigned = await studentApi.products.uploadUrl(
        productId, file.type as "image/jpeg" | "image/png" | "image/webp",
      );
      await uploadToS3(presigned, file, signal);
      await studentApi.products.confirmImg(productId, {
        s3Key: presigned.s3Key,
        declaredMimeType: file.type as "image/jpeg" | "image/png" | "image/webp",
        primary,
      });
      return { s3Key: presigned.s3Key };
    },
  });
}
```

```ts
// src/features/product-image-upload/index.ts
export { useUploadProductImage } from "./model/use-upload-product-image";
export type { UploadInput } from "./model/use-upload-product-image";
```

- [ ] **Step 2: Commit**

```bash
git add src/features/product-image-upload
git commit -m "feat(features/product-image-upload): orchestration hook (no widget)"
```

---

### Task 80: RejectProductForm (modal)

**Files:** `src/features/admin-product-reject/{ui/reject-form.tsx,model/schemas.ts,model/use-reject.ts,index.ts}`

- [ ] **Step 1: Schema**

```ts
// src/features/admin-product-reject/model/schemas.ts
import { z } from "zod";
export const RejectProductSchema = z.object({
  reason: z.string().min(10, "Мін. 10 символів").max(500),
});
export type RejectInput = z.input<typeof RejectProductSchema>;
```

- [ ] **Step 2: Mutation**

```ts
// src/features/admin-product-reject/model/use-reject.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, revalidateOnClient } from "@/shared/api";
export function useRejectProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.products.reject(id, reason),
    onSuccess: async (_d, vars) => {
      await revalidateOnClient(["catalog", `product:${vars.id}`]);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
```

- [ ] **Step 3: Form**

```tsx
// src/features/admin-product-reject/ui/reject-form.tsx
"use client";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Textarea, PillButton, FormFooter, toast } from "@/shared/ui";
import { RejectProductSchema, type RejectInput } from "../model/schemas";
import { useRejectProduct } from "../model/use-reject";

export function RejectForm({ productId, onDone, onCancel }: { productId: string; onDone?: () => void; onCancel?: () => void }) {
  const m = useRejectProduct();
  const form = useAppForm({
    schema: RejectProductSchema,
    defaultValues: { reason: "" } as RejectInput,
    onSubmit: async (data) => {
      await m.mutateAsync({ id: productId, reason: data.reason });
      toast.success("Відхилено");
      onDone?.();
    },
  });
  return (
    <Form onSubmit={form.handleSubmit}>
      <FormField name="reason" label="Причина відхилення (учень побачить)" required error={form.formState.errors.reason?.message}>
        <Textarea rows={4} {...form.register("reason")} />
      </FormField>
      <FormFooter>
        <PillButton type="button" variant="ghost" onClick={onCancel}>Скасувати</PillButton>
        <PillButton type="submit" loading={m.isPending}>Відхилити</PillButton>
      </FormFooter>
    </Form>
  );
}
```

```ts
// src/features/admin-product-reject/index.ts
export { RejectForm } from "./ui/reject-form";
export { RejectProductSchema } from "./model/schemas";
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin-product-reject
git commit -m "feat(features/admin-product-reject): reject form (modal-ready)"
```

---

### Task 81: RefundForm (modal)

**Files:** `src/features/admin-order-refund/{ui/refund-form.tsx,model/schemas.ts,model/use-refund.ts,index.ts}`

- [ ] **Step 1: Schema + mutation**

```ts
// src/features/admin-order-refund/model/schemas.ts
import { z } from "zod";
export const RefundSchema = z.object({ reason: z.string().min(5, "Мін. 5 символів").max(500) });
export type RefundInput = z.input<typeof RefundSchema>;
```

```ts
// src/features/admin-order-refund/model/use-refund.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/shared/api";
export function useRefund() {
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      adminApi.orders.refund(orderId, reason),
  });
}
```

- [ ] **Step 2: Form**

```tsx
// src/features/admin-order-refund/ui/refund-form.tsx
"use client";
import { useState } from "react";
import { useAppForm } from "@/shared/lib/forms/use-app-form";
import { Form, FormField, Textarea, PillButton, FormFooter, toast } from "@/shared/ui";
import { RefundSchema, type RefundInput } from "../model/schemas";
import { useRefund } from "../model/use-refund";

export function RefundForm({ orderId, onDone, onCancel }: { orderId: string; onDone?: () => void; onCancel?: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const m = useRefund();
  const form = useAppForm({
    schema: RefundSchema,
    defaultValues: { reason: "" } as RefundInput,
    onSubmit: async (data) => {
      await m.mutateAsync({ orderId, reason: data.reason });
      toast.success("Refund ініційовано");
      onDone?.();
    },
  });
  return (
    <Form onSubmit={form.handleSubmit}>
      <FormField name="reason" label="Причина повернення" required error={form.formState.errors.reason?.message}>
        <Textarea rows={3} {...form.register("reason")} />
      </FormField>
      <label className="flex items-center gap-2 text-small text-ink">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        Я розумію, що це повний refund, чарджбек банку незворотній
      </label>
      <FormFooter>
        <PillButton type="button" variant="ghost" onClick={onCancel}>Скасувати</PillButton>
        <PillButton type="submit" loading={m.isPending} disabled={!agreed}>Повернути кошти</PillButton>
      </FormFooter>
    </Form>
  );
}
```

```ts
// src/features/admin-order-refund/index.ts
export { RefundForm } from "./ui/refund-form";
export { RefundSchema } from "./model/schemas";
```

- [ ] **Step 3: Commit**

```bash
git add src/features/admin-order-refund
git commit -m "feat(features/admin-order-refund): refund form with hard-confirm checkbox"
```

---

### Task 82: PayoutExecuteForm + TotpVerifyModal

**Files:** `src/features/admin-2fa-verify/ui/totp-verify-modal.tsx`, `src/features/admin-2fa-verify/index.ts`, `src/features/admin-payout-execute/{ui/payout-execute-form.tsx,model/use-execute.ts,model/schemas.ts,index.ts}`

- [ ] **Step 1: TotpVerifyModal**

```tsx
// src/features/admin-2fa-verify/ui/totp-verify-modal.tsx
"use client";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
  PillButton, FormField, Input, Form, FormFooter,
} from "@/shared/ui";

export function TotpVerifyModal({
  open, onOpenChange, onSubmit, error, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (code: string) => void;
  error?: string;
  loading?: boolean;
}) {
  const [code, setCode] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>🔐 АДМІН-ВЕРИФІКАЦІЯ</DialogTitle>
        <DialogDescription>Введіть 6-значний код з Authy/Google Authenticator</DialogDescription>
        <Form onSubmit={(e) => { e.preventDefault(); onSubmit(code); }} className="mt-4">
          <FormField name="code" label="Код" required error={error}>
            <Input
              inputMode="numeric" maxLength={8} autoComplete="one-time-code" autoFocus
              value={code} onChange={(e) => setCode(e.target.value)}
              className="font-mono tracking-[0.4em] text-center"
            />
          </FormField>
          <FormFooter>
            <PillButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>Скасувати</PillButton>
            <PillButton type="submit" loading={loading} disabled={code.length < 6}>Підтвердити</PillButton>
          </FormFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

```ts
// src/features/admin-2fa-verify/index.ts
export { TotpVerifyModal } from "./ui/totp-verify-modal";
```

- [ ] **Step 2: Schema + mutation**

```ts
// src/features/admin-payout-execute/model/schemas.ts
import { z } from "zod";
export const PayoutBatchSchema = z.object({
  payoutIds: z.array(z.string().uuid()).min(1).max(200),
});
export type PayoutBatchInput = z.input<typeof PayoutBatchSchema>;
```

```ts
// src/features/admin-payout-execute/model/use-execute.ts
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/shared/api";
export function useExecutePayouts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ payoutIds, code }: { payoutIds: string[]; code: string }) =>
      adminApi.payouts.execute(payoutIds, code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "payouts"] }),
  });
}
```

- [ ] **Step 3: Form (composes modal)**

```tsx
// src/features/admin-payout-execute/ui/payout-execute-form.tsx
"use client";
import { useState } from "react";
import { PillButton, toast } from "@/shared/ui";
import { TotpVerifyModal } from "@/features/admin-2fa-verify";
import { useExecutePayouts } from "../model/use-execute";
import { ApiError } from "@/shared/api";

export function PayoutExecuteForm({ payoutIds }: { payoutIds: string[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const m = useExecutePayouts();

  const handleSubmit = async (code: string) => {
    setError(undefined);
    try {
      const r = await m.mutateAsync({ payoutIds, code });
      toast.success(`Прийнято: jobId=${r.jobId}. Очікуємо підтвердження банку.`);
      setOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.isUnauthorized) {
        setError("Неправильний код, спробуйте ще раз");
      } else throw e;
    }
  };

  return (
    <>
      <PillButton onClick={() => setOpen(true)} disabled={!payoutIds.length}>
        Виплатити обрані ({payoutIds.length})
      </PillButton>
      <TotpVerifyModal
        open={open} onOpenChange={setOpen}
        onSubmit={handleSubmit} error={error} loading={m.isPending}
      />
    </>
  );
}
```

```ts
// src/features/admin-payout-execute/index.ts
export { PayoutExecuteForm } from "./ui/payout-execute-form";
export { PayoutBatchSchema } from "./model/schemas";
```

- [ ] **Step 4: Commit**

```bash
git add src/features/admin-2fa-verify src/features/admin-payout-execute
git commit -m "feat(features/admin): payout-execute form with TOTP modal"
```

---

### Task 83: account-delete feature (right-to-be-forgotten)

**Files:** `src/features/account-delete/{ui/delete-account-button.tsx,model/use-delete-me.ts,index.ts}`

- [ ] **Step 1: Implement**

```ts
// src/features/account-delete/model/use-delete-me.ts
"use client";
import { useMutation } from "@tanstack/react-query";
import { userApi, setSnapshot } from "@/shared/api";
export function useDeleteMe() {
  return useMutation({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: () => {
      setSnapshot(null);
      try { localStorage.clear(); sessionStorage.clear(); } catch { /* noop */ }
      window.location.href = "/";
    },
  });
}
```

```tsx
// src/features/account-delete/ui/delete-account-button.tsx
"use client";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
  PillButton, FormFooter,
} from "@/shared/ui";
import { useDeleteMe } from "../model/use-delete-me";

export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const m = useDeleteMe();
  return (
    <>
      <PillButton variant="ghost" onClick={() => setOpen(true)}>Видалити акаунт</PillButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Видалити акаунт назавжди?</DialogTitle>
          <DialogDescription>
            Дані будуть зашифровані за GDPR. Tax-required записи (виплати) житимуть 7 років, але PII буде втрачено.
          </DialogDescription>
          <FormFooter>
            <PillButton variant="ghost" onClick={() => setOpen(false)}>Скасувати</PillButton>
            <PillButton onClick={() => m.mutate()} loading={m.isPending}>Так, видалити</PillButton>
          </FormFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

```ts
// src/features/account-delete/index.ts
export { DeleteAccountButton } from "./ui/delete-account-button";
```

- [ ] **Step 2: Add button to AccountScreen** (modify `src/pages/account/ui/account-screen.tsx`)

Add at the bottom of returned JSX:

```tsx
import { DeleteAccountButton } from "@/features/account-delete";
// ...
<DeleteAccountButton />
```

- [ ] **Step 3: Commit**

```bash
git add src/features/account-delete src/pages/account
git commit -m "feat(features/account-delete): delete-me with confirmation modal"
```

---

### Phase 6 Checkpoint

- [ ] **Run pnpm typecheck && pnpm lint && pnpm vitest run && pnpm build**

Expected: PASS.

- [ ] **Manual smoke** in dev:
- `/login` — submit empty form → email focused, scroll happens, errors shown.
- `/register` — submit empty → 6 errors → FormErrorSummary banner appears.
- `/checkout` (with cart items) — pre-flight revalidation runs.
---

## Phase 7 — Render strategy (ISR, sitemap, robots, revalidate route)

### Task 84: `/api/revalidate` route

**Files:** `src/app/api/revalidate/route.ts`

- [ ] **Step 1: Implement**

```ts
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { tags?: string[] };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== "string")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  body.tags.forEach(revalidateTag);
  return NextResponse.json({ ok: true, revalidated: body.tags });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/revalidate/route.ts
git commit -m "feat(app/api/revalidate): tag-based revalidation endpoint"
```

---

### Task 85: Wire RSC fetch into Home + Catalog (use serverApi)

**Files:** modify `src/app/(public)/page.tsx`, `src/app/(public)/catalog/page.tsx`, modify their screens

- [ ] **Step 1: Update Home to fetch products**

```tsx
// src/app/(public)/page.tsx
import type { Metadata } from "next";
import { HomeScreen } from "@/pages/home";
import { serverApi, type Page as P, type ProductCardDto } from "@/shared/api";

export const metadata: Metadata = { title: "Майстерня 157" };
export const revalidate = 300;

export default async function Page() {
  const initial = await serverApi<P<ProductCardDto>>("/products?page=0&size=8&sort=newest", {
    revalidate: 300, tags: ["catalog"],
  }).catch(() => null);
  return <HomeScreen initial={initial} />;
}
```

- [ ] **Step 2: Modify HomeScreen to accept initial**

```tsx
// src/pages/home/ui/home-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Stamp, Stack } from "@/shared/ui";
import type { Page, ProductCardDto } from "@/shared/api";

export function HomeScreen({ initial }: { initial: Page<ProductCardDto> | null }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ВИПУСК №47 · ТРАВЕНЬ 2026</EditorialLabel>
      <h1 className="font-display text-mega italic text-burgundy">Майстерня 157</h1>
      <Stack gap={4}>
        <p className="max-w-prose text-lead text-ink-soft">
          Архів учнівських робіт Ліцею №157. Київ · Оболонь · з 1957 року.
        </p>
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
        {initial && <p className="text-small text-ink-soft">Робіт у каталозі: {initial.totalElements}</p>}
      </Stack>
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 3: Update Catalog**

```tsx
// src/app/(public)/catalog/page.tsx
import type { Metadata } from "next";
import { CatalogScreen } from "@/pages/catalog";
import { serverApi, type Page as P, type ProductCardDto } from "@/shared/api";

export const metadata: Metadata = { title: "Каталог" };
export const revalidate = 300;
export const dynamic = "auto";

export default async function Page({ searchParams }: { searchParams: { page?: string; sort?: string; type?: string } }) {
  const params = new URLSearchParams();
  params.set("page", searchParams.page ?? "0");
  params.set("size", "20");
  if (searchParams.sort) params.set("sort", searchParams.sort);
  if (searchParams.type) params.set("type", searchParams.type);
  const data = await serverApi<P<ProductCardDto>>(`/products?${params}`, {
    revalidate: 300, tags: ["catalog"],
  }).catch(() => null);
  return <CatalogScreen data={data} />;
}
```

```tsx
// src/pages/catalog/ui/catalog-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel } from "@/shared/ui";
import type { Page, ProductCardDto } from "@/shared/api";

export function CatalogScreen({ data }: { data: Page<ProductCardDto> | null }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>ПОКАЖЧИК ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Каталог</h1>
      {data ? (
        <p className="text-lead text-ink-soft">
          Сторінка {data.number + 1} з {data.totalPages}, всього {data.totalElements} робіт.
        </p>
      ) : (
        <p className="text-lead text-ink-soft">Каталог тимчасово недоступний.</p>
      )}
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/page.tsx src/app/\(public\)/catalog/page.tsx src/pages/home src/pages/catalog
git commit -m "feat(pages): RSC fetch with ISR for home and catalog"
```

---

### Task 86: Product detail RSC + generateStaticParams + generateMetadata

**Files:** modify `src/app/(public)/p/[slug]/page.tsx`, `src/pages/product-detail/ui/product-detail-screen.tsx`

- [ ] **Step 1: Update route**

```tsx
// src/app/(public)/p/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailScreen } from "@/pages/product-detail";
import { serverApi, type ProductDetailDto, type Page as P, type ProductCardDto } from "@/shared/api";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const top = await serverApi<P<ProductCardDto>>("/products?page=0&size=100&sort=popular", {
    revalidate: 3600,
  }).catch(() => null);
  return top?.content.map(({ slug }) => ({ slug })) ?? [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await serverApi<ProductDetailDto>(`/products/${params.slug}`, {
    revalidate: 600, tags: [`product:${params.slug}`],
  }).catch(() => null);
  if (!p) return { title: "Робота" };
  return {
    title: p.title,
    description: p.description.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: { title: p.title, images: p.imageUrls[0] ? [p.imageUrls[0]] : [] },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const p = await serverApi<ProductDetailDto>(`/products/${params.slug}`, {
    revalidate: 600, tags: [`product:${params.slug}`],
  }).catch(() => null);
  if (!p) notFound();
  return <ProductDetailScreen product={p} />;
}
```

- [ ] **Step 2: Update screen**

```tsx
// src/pages/product-detail/ui/product-detail-screen.tsx
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, MuseumLabel } from "@/shared/ui";
import type { ProductDetailDto } from "@/shared/api";

export function ProductDetailScreen({ product }: { product: ProductDetailDto }) {
  return (
    <EditorialPageShell>
      <EditorialLabel>СТАТТЯ ВИПУСКУ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">{product.title}</h1>
      <MuseumLabel
        title={product.title}
        author={`${product.author.firstName}, ${product.author.grade}`}
        priceUah={product.priceUah}
      />
      <article className="prose max-w-prose" dangerouslySetInnerHTML={{ __html: product.description }} />
      <PageStubBanner cluster="public-catalog" />
    </EditorialPageShell>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/p src/pages/product-detail
git commit -m "feat(pages/product-detail): RSC fetch + generateStaticParams + metadata"
```

---

### Task 87: Sitemap + robots

**Files:** `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] **Step 1: `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { serverApi, type Page as P, type ProductCardDto } from "@/shared/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const products = await serverApi<P<ProductCardDto>>(
    "/products?page=0&size=1000&sort=newest", { revalidate: 3600 },
  ).catch(() => null);
  const productEntries: MetadataRoute.Sitemap = (products?.content ?? []).map((p) => ({
    url: `${base}/p/${p.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));
  return [
    { url: `${base}/`, priority: 1, changeFrequency: "daily" },
    { url: `${base}/catalog`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/collections`, priority: 0.7 },
    { url: `${base}/about`, priority: 0.5 },
    { url: `${base}/contacts`, priority: 0.4 },
    ...productEntries,
  ];
}
```

- [ ] **Step 2: `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      disallow: ["/parent/", "/student/", "/admin/", "/account", "/_kitchen", "/api/"],
    }],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(app): sitemap and robots"
```

---

### Task 88: next.config.mjs headers + image domains

**Files:** modify `next.config.mjs`

- [ ] **Step 1: Replace**

```js
/** @type {import("next").NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/parent/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
      {
        source: "/textures/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/stamps/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/illustrations/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.s3.eu-central-1.amazonaws.com" },
      { protocol: "https", hostname: "cdn.157.kyiv.ua" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Commit**

```bash
git add next.config.mjs
git commit -m "feat(next.config): headers (noindex parent, immutable assets) + image domains"
```

---

### Phase 7 Checkpoint

- [ ] **Run pnpm typecheck && pnpm lint && pnpm vitest run && pnpm build**

Expected: build emits Sitemap, prerender Home/Catalog/About/Contacts/Login/Register/Collections, generateStaticParams runs for `/p/[slug]`.

---

## Phase 8 — Verify pipeline + CLAUDE.md + Stop-hook

### Task 89: Playwright smoke specs

**Files:** `tests/e2e/{smoke,public-routes,role-redirects,form-error-ux}.spec.ts`

- [ ] **Step 1: `tests/e2e/smoke.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("@smoke home renders with title and paper noise", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Майстерня 157/);
  const opacity = await page.evaluate(() => {
    const styles = getComputedStyle(document.body, "::before");
    return styles.getPropertyValue("opacity");
  });
  expect(parseFloat(opacity)).toBeGreaterThan(0);
});
```

- [ ] **Step 2: `tests/e2e/public-routes.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

const routes = ["/", "/catalog", "/about", "/contacts", "/collections", "/login", "/register"];

for (const path of routes) {
  test(`@smoke ${path} renders h1`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
  });
}
```

- [ ] **Step 3: `tests/e2e/role-redirects.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("@smoke /student without cookie redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  const resp = await page.goto("/student");
  expect(page.url()).toContain("/login");
  expect(resp?.ok()).toBeTruthy();
});

test("@smoke /admin without cookie redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/admin");
  expect(page.url()).toContain("/login");
});

test("@smoke /parent/kyc/x has noindex header", async ({ request }) => {
  const r = await request.get("/parent/kyc/anything");
  const robots = r.headers()["x-robots-tag"];
  expect(robots).toContain("noindex");
});
```

- [ ] **Step 4: `tests/e2e/form-error-ux.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("@smoke login submit empty focuses email and scrolls", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /Увійти/ }).click();
  await expect(page.getByText(/Невірний email/)).toBeVisible();
  const focused = await page.evaluate(() => (document.activeElement as HTMLElement)?.getAttribute("name"));
  expect(focused).toBe("email");
});
```

- [ ] **Step 5: Commit**

```bash
git add tests/e2e
git commit -m "test(e2e): playwright smoke specs"
```

---

### Task 90: `.claude/CLAUDE.md`

**Files:** `.claude/CLAUDE.md`

- [ ] **Step 1: Create**

```markdown
# Lyceum 157 Frontend — CLAUDE.md

## Stack
Next.js 14.2 App Router · TypeScript strict · Tailwind v3 + CSS vars (MASTER spec tokens) · TanStack Query v5 · Zustand (cart only) · React Hook Form + Zod · shadcn (heavy themed) · Vitest + RTL + Playwright · pnpm

## Архітектура
Feature-Sliced Design (з ренеймом FSD `app/` → `_app/` бо колізія з Next routing).
Шари: `app → _app → processes → pages → widgets → features → entities → shared`. ESLint-boundaries enforce-ить імпорти.

## Дані
- Public read → RSC + ISR (revalidate per route). Tag invalidation через `revalidateOnClient(["catalog","product:<slug>"])`.
- Role-based + mutations → TanStack Query.
- Auth → Context + module-level token holder (`shared/api/auth-token.ts`).
- Cart → Zustand+persist (`entities/cart`).

## Дизайн-система
Усі токени — CSS vars у `_app/styles/tokens.css` за MASTER spec. Tailwind extends читає їх. **Жодних hardcoded кольорів/розмірів/шрифтів у компонентах** — тільки через class.
Paper-noise (body::before SVG turbulence) — must-be-visible. Stamp-drop animation — not negotiable, fade-in заборонено.

## Форми
Завжди через `useAppForm()` обгортку (`shared/lib/forms/use-app-form.ts`). Дає: shouldFocusError, scroll-to-first-error з offset 120px, ApiError-to-RHF mapping, toast-fallback. Довгі форми (3+ полів) додають `<FormErrorSummary/>` зверху.

## Verification
Перед закриттям задачі (або до того як казати "готово") запусти:
- `pnpm typecheck` — TypeScript strict
- `pnpm lint` — ESLint + FSD boundaries
- `pnpm test` — Vitest unit + RTL component
- `pnpm build` — Next production build (виявляє RSC/CSR помилки)
- `pnpm e2e --grep @smoke` — Playwright smoke (app boots, paper-noise, role-redirects, form-ux)

Композит: `pnpm verify` — все вище.

Якщо хоч одна перевірка red — чини і ганяй заново. Не закривай задачу пока не green.

UI-задачі — додатково: `pnpm dev`, відкрити в Playwright headed і пройти golden path вручну/скриптом.

## Команди FE-онлі
- `pnpm dev` — dev server
- `/_kitchen` (тільки dev) — atoms showcase

## Поза-проєктна довідка
- Backend repo: `lyceum-157-backend/` (Spring Boot)
- Backend swagger: `${NEXT_PUBLIC_API_BASE}/swagger-ui.html`
- API contract: `FRONTEND-API.md`
- Design system: `MASTER-design-spec.md`
- Foundation spec: `docs/superpowers/specs/2026-05-07-frontend-foundation-design.md`
- Foundation plan: `docs/superpowers/plans/2026-05-07-frontend-foundation.md`

## Що НЕ робити
- Не hardcode-ить ua-strings — використовуй `shared/i18n/uk.ts` для error messages.
- Не використовувати `<a>` для navigation — `<Link/>` Next.
- Не plain JS money math: завжди через `shared/lib/money.ts` (decimal).
- Не fade-in замість stamp-drop.
- Не імпортувати між слайсами одного шару напряму.
- Не commit без `pnpm verify` green.
```

- [ ] **Step 2: Commit**

```bash
mkdir -p .claude
git add .claude/CLAUDE.md
git commit -m "docs(.claude): project memory with verification protocol"
```

---

### Task 91: `.claude/settings.json` Stop-hook

**Files:** `.claude/settings.json`

- [ ] **Step 1: Create**

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "command": "pnpm verify",
        "timeout": 600000
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(pnpm dev*)",
      "Bash(pnpm build)",
      "Bash(pnpm test*)",
      "Bash(pnpm typecheck)",
      "Bash(pnpm lint)",
      "Bash(pnpm e2e*)",
      "Bash(pnpm verify)",
      "Bash(git status)",
      "Bash(git diff*)",
      "Bash(git log*)"
    ]
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add .claude/settings.json
git commit -m "chore(.claude): settings.json with verify Stop-hook and read-only allowlist"
```

---

### Task 92: README.md

**Files:** modify `README.md`

- [ ] **Step 1: Replace**

```markdown
# lyceum-157-frontend

Frontend for Маистерня 157 marketplace (Ліцей №157, Київ · Оболонь).

## Stack
- **Framework:** Next.js 14.2 (App Router) + TypeScript strict
- **Architecture:** Feature-Sliced Design (FSD `app/` renamed to `_app/`)
- **Styling:** Tailwind v3 + CSS vars from MASTER spec
- **Data:** RSC + ISR for public, TanStack Query v5 for role-based
- **State:** Context (auth) + Zustand+persist (cart)
- **Forms:** react-hook-form + Zod via `useAppForm` wrapper
- **UI:** shadcn (Radix-themed) + decorative atoms (Stamp, Polaroid, etc.)
- **Tests:** Vitest + React Testing Library + Playwright (smoke)
- **Package manager:** pnpm

## Quick start

```bash
pnpm install
cp .env.example .env.local
# edit NEXT_PUBLIC_API_BASE if backend not at default
pnpm dev
```

Open http://localhost:3000

## Scripts

| Command | What |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production build |
| `pnpm typecheck` | tsc --noEmit |
| `pnpm lint` | ESLint + FSD boundaries |
| `pnpm test` | Vitest unit + component |
| `pnpm e2e` | Playwright e2e |
| `pnpm verify` | All of the above (composite) |

## FSD layers

- `app/` — Next routing (thin pages)
- `_app/` — FSD app-shell (providers, fonts, styles)
- `processes/` — cross-feature orchestrations (auth bootstrap)
- `pages/` — screen compositions (e.g. HomeScreen)
- `widgets/` — composite UI blocks (Header, Footer)
- `features/` — user actions (LoginForm, CheckoutForm)
- `entities/` — domain models (cart, product)
- `shared/` — primitives (api client, ui atoms, lib helpers)

Imports flow downward only — enforced by `eslint-plugin-boundaries`.

## Conventions

- All design tokens via Tailwind utilities backed by CSS vars. **Never** hardcode colors/sizes/fonts.
- All forms via `useAppForm` (`shared/lib/forms/use-app-form.ts`).
- All money math via `shared/lib/money.ts` (decimal.js).
- All API calls via `shared/api` modules — never raw fetch.
- Don't commit without `pnpm verify` green.

## References

- Foundation spec: [`docs/superpowers/specs/2026-05-07-frontend-foundation-design.md`](docs/superpowers/specs/2026-05-07-frontend-foundation-design.md)
- API contract: [`FRONTEND-API.md`](FRONTEND-API.md)
- Design system: [`MASTER-design-spec.md`](MASTER-design-spec.md)
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: full README with stack, quick start, FSD overview, conventions"
```

---

### Task 93: Final verify

- [ ] **Step 1: Run full verify**

```bash
pnpm verify
```

Expected: all green:
- typecheck PASS
- lint PASS (no warnings, no FSD-boundary violations)
- vitest unit + component PASS
- next build PASS (sitemap emitted, generateStaticParams runs)
- playwright @smoke PASS (paper-noise visible, role redirects, form ux)

If anything fails — fix before declaring done.

- [ ] **Step 2: Tag the foundation milestone**

```bash
git tag foundation-v1
git log --oneline | head -20
```

---

## Final Foundation Checkpoint

- [ ] All 93 tasks completed
- [ ] `pnpm verify` green
- [ ] `pnpm dev` boots, all 12 routes navigable, paper-noise visible, header sticky, footer-postcard rendered, /_kitchen renders all atoms in dev
- [ ] 8 forms work against the backend (login/register/checkout/kyc-submit/kyc-card-update/create-product/reject-product/refund/payout-execute)
- [ ] CLAUDE.md + Stop-hook installed
- [ ] README.md describes the project

Ready for the next brainstorm — pick a cluster (public-catalog / checkout / auth / student / admin) and the foundation will receive its editorial polish + missing widgets.
