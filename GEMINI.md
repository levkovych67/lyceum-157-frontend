# Project Context: lyceum-157-frontend

Frontend for the **Майстерня 157** marketplace (Lyceum №157, Kyiv, Obolon). This project is built with a strong focus on a specific design metaphor: "Archive Issue №47," simulating a printed archival publication from 1957.

## Tech Stack
- **Framework:** Next.js 14.2 (App Router) + TypeScript (strict)
- **Styling:** Tailwind v3 + CSS Variables (Design Tokens)
- **State Management:** Zustand + Persist (Cart), Context (Auth)
- **Data Fetching:** TanStack Query v5 (Client), RSC + ISR (Public)
- **Forms:** React Hook Form + Zod via `useAppForm` wrapper
- **UI Components:** shadcn/ui (highly themed) + custom decorative atoms (Stamp, Polaroid, etc.)
- **Testing:** Vitest (Unit/Component), Playwright (E2E/Smoke)
- **Package Manager:** pnpm

## Architecture: Feature-Sliced Design (FSD)
The project follows FSD with custom layer naming to avoid Next.js routing collisions:
- `app/` — Next.js App Router (thin route handlers/pages)
- `src/_app/` — **FSD App Layer** (Providers, global styles, fonts)
- `src/processes/` — Cross-feature orchestrations (e.g., Auth bootstrap)
- `src/views/` — **FSD Pages Layer** (Screen compositions)
- `src/widgets/` — Composite UI blocks (Header, Footer, Shells)
- `src/features/` — User actions (Forms, Buttons with logic)
- `src/entities/` — Domain models (Cart, Product, Auth)
- `src/shared/` — Primitives (API client, UI atoms, lib helpers)

**Import Rules:** 
- Imports MUST flow downward only (enforced by `eslint-plugin-boundaries`).
- Use `@/` alias for all imports.
- No cross-slice imports within the same layer.

## Core Mandates & Conventions

### Design & Aesthetics
- **Metaphor:** "Archive Issue №47." Everything should feel tactile and printed.
- **Paper Texture:** `body::before` must have a visible SVG turbulence noise.
- **Stamp Animations:** Use `stamp-drop` keyframe animation for all stamps/seals. **Fade-in is prohibited.**
- **Typography:** 
    - `Fraunces` (Display/Serif) for headings and editorial pull-quotes.
    - `Manrope` (Sans) for body and labels.
    - `Caveat` (Handwriting) for margin notes and signatures.
- **Colors:** Use CSS variables (e.g., `--c-burgundy`, `--c-bg-molochny`). Never hardcode hex/rgba values.

### Development Standards
- **API Calls:** Always use `shared/api` modules. Raw `fetch` is discouraged.
- **Forms:** Use the `useAppForm` hook (`shared/lib/forms/use-app-form.ts`) to ensure consistent error handling and scrolling.
- **Money:** Always use `decimal.js` via `shared/lib/money.ts`. No floating-point math for prices.
- **Routing:** Use Next.js `<Link />`, never `<a>` for internal navigation.

## Building and Running
| Task | Command |
| :--- | :--- |
| **Development** | `pnpm dev` |
| **Build** | `pnpm build` |
| **Type Check** | `pnpm typecheck` |
| **Lint** | `pnpm lint` |
| **Unit Tests** | `pnpm test` (Vitest) |
| **E2E Tests** | `pnpm e2e` (Playwright) |
| **Verify All** | `pnpm verify` (Full CI check) |

## Key Documentation
- **Design Spec:** `MASTER-design-spec.md` (Detailed narrative and component specs)
- **Developer Guide:** `.claude/CLAUDE.md` (Workflow and testing details)
- **API Contract:** `FRONTEND-API.md`
- **Foundation Spec:** `docs/superpowers/specs/2026-05-07-frontend-foundation-design.md`
