# Lyceum 157 Frontend — CLAUDE.md

## Stack
Next.js 14.2 App Router · TypeScript strict · Tailwind v3 + CSS vars (MASTER spec tokens) · TanStack Query v5 · Zustand (cart only) · React Hook Form + Zod · shadcn (heavy themed) · Vitest + RTL + Playwright · pnpm

## Архітектура
Feature-Sliced Design (з ренеймом FSD `app/` → `_app/` бо колізія з Next routing, а також FSD `pages/` → `views/`).
Шари: `app → _app → processes → views → widgets → features → entities → shared`. ESLint-boundaries enforce-ить імпорти.

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
