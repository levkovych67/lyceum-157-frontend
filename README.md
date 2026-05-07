# lyceum-157-frontend

Frontend for Маистерня 157 marketplace (Ліцей №157, Київ · Оболонь).

## Stack
- **Framework:** Next.js 14.2 (App Router) + TypeScript strict
- **Architecture:** Feature-Sliced Design (FSD `app/` renamed to `_app/`, FSD `pages/` renamed to `views/`)
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
- `views/` — screen compositions (e.g. HomeScreen) — FSD `pages/` renamed to avoid Next collision
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
