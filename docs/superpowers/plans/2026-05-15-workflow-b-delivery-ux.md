# Workflow B — Delivery UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Nova Poshta delivery UX on FE (entities/delivery, features/checkout-delivery, widgets/checkout-form composition root, conditional reCAPTCHA), wired to BE `/api/v1/delivery/*` endpoints and the `delivery` block on `POST /api/v1/orders`.

**Architecture:** Source-of-truth design is in BE repo: [`lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md`](../../../../lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md) **§4 (FE FSD)**. This implementation plan turns that spec into bite-sized tasks; it does **not** re-litigate design decisions.

**Tech Stack:** FSD layers, TanStack Query v5 (orval), shadcn-flavored Combobox (Radix Popover + cmdk), Zod, Vitest + RTL + MSW, Playwright.

**Spec (sprint-level):** `docs/superpowers/specs/2026-05-15-fe-be-contract-sync-design.md` §5.
**Spec (feature):** `lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md`.

**Branch:** `feat/delivery-ux` off Workflow A's tip.

---

## Prerequisites

- Workflow A merged (orval-generated `delivery/`, `novaPoshtaCityDto`, `novaPoshtaBranchDto`, `deliveryRequest`, `novaPoshtaDetailsRequest`, `createOrderRequest.delivery`/`recaptchaToken` all present).
- Verify:
```bash
ls src/shared/api/generated/delivery
ls src/shared/api/generated/models | grep -i 'novaposhta\|delivery'
grep -E "delivery|recaptchaToken" src/shared/api/generated/models/createOrderRequest.ts
```
All commands must produce output.

- `pnpm dev` works against BE branch `feat/delivery-nova-poshta-backend` running locally.

---

## Phased task list

This plan defers to the feature-spec for code-shape details. Each phase below has acceptance — once green, move on. If a phase fails, root-cause the failure (don't relax tests).

### Phase 1 — shared atoms

- [ ] **Task 1.1:** Add `shared/ui/combobox.tsx` (Radix Popover + `cmdk` Command). API: `<Combobox value, onChange, options, onSearch, loading, error, emptyLabel, placeholder, groupBy?>`. Reusable beyond delivery.
- [ ] **Task 1.2:** Vitest + RTL tests: typing dispatches `onSearch` (debounced upstream); selecting fires `onChange`; empty list shows `emptyLabel`; loading shows spinner; `error` prop shows banner.
- [ ] **Task 1.3:** Commit: `feat(shared/ui): Combobox atom (Popover + cmdk)`.

### Phase 2 — entities/delivery

- [ ] **Task 2.1:** Create `entities/delivery/model/types.ts` (re-exports + canonical names per spec §4.1 / our spec §5.1.). Re-export `DeliveryMethod` literal, `BranchType` literal, `City`, `Branch` (orval types).
- [ ] **Task 2.2:** Create `entities/delivery/model/method-registry.ts` (per BE spec §4.1) — `Record<DeliveryMethod, MethodDescriptor>` so adding a new carrier later doesn't ripple.
- [ ] **Task 2.3:** Create `entities/delivery/index.ts` barrel.
- [ ] **Task 2.4:** Vitest: `method-registry.test.ts` — every `DeliveryMethod` member has a descriptor with `label` and `Component`.
- [ ] **Task 2.5:** Commit: `feat(entities/delivery): canonical types + method registry`.

### Phase 3 — features/checkout-delivery (data + schema)

- [ ] **Task 3.1:** Create `features/checkout-delivery/model/use-np-cities.ts` — wraps orval `useGetCities` with **300ms debounce** on `q`, `enabled: debounced.length >= 2`, `staleTime: 30 * 60_000`, `gcTime: 60 * 60_000`.
- [ ] **Task 3.2:** Create `features/checkout-delivery/model/use-np-branches.ts` — wraps orval `useGetBranches`, `enabled: !!cityRef`, same cache config, cascading refetch on city change.
- [ ] **Task 3.3:** Create `features/checkout-delivery/model/schemas.ts` — `DeliverySchema` as Zod discriminated union per BE spec §4.3.
- [ ] **Task 3.4:** Vitest hooks tests with MSW + fake timers:
  - `use-np-cities`: typing "Ки" + 300ms → query fires; `<2 chars` → `enabled:false`; MSW returns 503 → `query.error` set.
  - `use-np-branches`: enabled only after cityRef; cityRef change → fresh fetch.
- [ ] **Task 3.5:** Vitest schema tests: valid NP details pass; missing `cityRef` fails; invalid `branchType` fails.
- [ ] **Task 3.6:** Commit: `feat(checkout-delivery): debounced NP queries + Zod schema`.

### Phase 4 — features/checkout-delivery (UI)

- [ ] **Task 4.1:** Create `features/checkout-delivery/ui/city-select.tsx` (uses shared Combobox + `use-np-cities`). Label/placeholder per BE spec §4.4. Empty: "Місто не знайдено."
- [ ] **Task 4.2:** Create `features/checkout-delivery/ui/branch-select.tsx` — Combobox grouped by `BRANCH`/`POSTBOX` (use `groupBy` prop). Disabled until city chosen. Local text filter inside cmdk.
- [ ] **Task 4.3:** Create `features/checkout-delivery/ui/novaposhta-fields.tsx` composing City + Branch + snapshot capture (writes `{ cityRef, cityName, branchRef, branchNumber, branchType, branchAddress }` to form state on selection).
- [ ] **Task 4.4:** Create `features/checkout-delivery/ui/method-picker.tsx` — radio list of methods; today only `NOVA_POSHTA`, render disabled-single-item.
- [ ] **Task 4.5:** Create `features/checkout-delivery/ui/np-unavailable-banner.tsx` per BE spec §4.5; "Спробувати ще" invalidates `["np-cities"]` queries.
- [ ] **Task 4.6:** Create `features/checkout-delivery/ui/delivery-section.tsx` — switches by `method` and renders the matching fields component (today `<NovaPoshtaFields/>`).
- [ ] **Task 4.7:** RTL + MSW tests for each component per BE spec §5.2 (one row in the table per component).
- [ ] **Task 4.8:** Commit: `feat(checkout-delivery): City/Branch/Method UI + 503 banner`.

### Phase 5 — widgets/checkout-form composition

- [ ] **Task 5.1:** Move `features/checkout/ui/checkout-form.tsx` to `widgets/checkout-form/ui/checkout-form.tsx` (per BE spec §4.2 — FSD-boundaries fix). Update `app/(public)/checkout/page.tsx` import accordingly.
- [ ] **Task 5.2:** In the widget, import both `features/checkout/model` (mutation hook) **and** `features/checkout-delivery/ui` (delivery section), plus `entities/cart` to read `hasPhysical = items.some(i => i.type === "PHYSICAL")`.
- [ ] **Task 5.3:** Render `<DeliverySection/>` iff `hasPhysical`. Wire its value into form state.
- [ ] **Task 5.4:** Add `.superRefine` on `CheckoutSchema` to enforce "delivery required if hasPhysical". On submit error, set field-level error on `delivery`.
- [ ] **Task 5.5:** Update `entities/cart` types to carry `type: "PHYSICAL" | "DIGITAL"` per item, sourced from `ProductDetailDto.type` at add-to-cart time. Migrate existing zustand persist schema by reading `type` lazily on first read with default `"DIGITAL"` (safe — only PHYSICAL gates delivery; existing carts without `type` become digital-only).
- [ ] **Task 5.6:** RTL + MSW for the widget: digital cart → delivery section absent; physical cart → delivery section visible; submit without selecting city → schema error.
- [ ] **Task 5.7:** ESLint boundary check: `pnpm lint` — no boundary violations.
- [ ] **Task 5.8:** Commit: `refactor(widgets/checkout-form): composition root + hasPhysical gate`.

### Phase 6 — reCAPTCHA conditional

- [ ] **Task 6.1:** Extend `src/shared/config/env.ts` to accept optional `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`. Default `undefined`.
- [ ] **Task 6.2:** Create `features/recaptcha/model/use-recaptcha.ts`:
  - On mount, if `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` set, inject `<script src="https://www.google.com/recaptcha/api.js?render=<KEY>" defer>` once.
  - Expose `async execute(action: string): Promise<string | null>`:
    - If key set: `await new Promise(r => grecaptcha.ready(r)); return grecaptcha.execute(KEY, { action })`.
    - Else: return `null`.
- [ ] **Task 6.3:** Vitest with DOM mock: with key set → script tag present, `execute` resolves to a token (mock `grecaptcha`); without key → returns `null` immediately.
- [ ] **Task 6.4:** Wire into `widgets/checkout-form`: before `mutateAsync`, `const token = await recaptcha.execute("checkout")`, pass as `recaptchaToken`.
- [ ] **Task 6.5:** Commit: `feat(recaptcha): conditional execute via env site-key`.

### Phase 7 — error mapping

- [ ] **Task 7.1:** Extend `src/shared/api/dispatch-problem.ts` to handle these `type` URNs (FE error→UI mapping per our spec §5.2):
  - `urn:l157:delivery/required` → form error on `delivery`: "Оберіть місто і відділення Нової Пошти".
  - `urn:l157:delivery/invalid-ref` → form error on `delivery.details` + invalidate `["np-branches"]`.
  - `urn:l157:delivery/unexpected` → form error on `delivery`: "Кошик не містить фізичних товарів."
  - `urn:l157:captcha/failed` → toast: "Не вдалось пройти captcha. Спробуйте ще раз."
  - `urn:l157:novaposhta/unavailable` → render `<NpUnavailableBanner/>` and disable submit.
- [ ] **Task 7.2:** Vitest: each URN dispatches to the correct handler.
- [ ] **Task 7.3:** Commit: `feat(checkout): map delivery/captcha problem-types to form errors`.

### Phase 8 — e2e

- [ ] **Task 8.1:** New `tests/e2e/checkout-delivery.spec.ts` with `@smoke` tag:
  - MSW handlers for `GET /delivery/methods`, `GET /delivery/nova-poshta/cities?q=Ки`, `GET /delivery/nova-poshta/cities/{ref}/branches`.
  - Seed cart with a PHYSICAL product.
  - Type "Київ" → pick first city → pick first branch → submit → expect redirect to mocked LiqPay URL.
  - Body assertion: POST `/orders` request body has `delivery.method === "NOVA_POSHTA"` and `delivery.details.cityName === "Київ"`.
- [ ] **Task 8.2:** Run `pnpm e2e tests/e2e/checkout-delivery.spec.ts` — green.
- [ ] **Task 8.3:** Commit: `test(e2e): physical-cart delivery happy path`.

### Phase 9 — final verification + PR

- [ ] **Task 9.1:** `pnpm verify` green (composite — typecheck + lint + test + scan-images + build + e2e smoke).
- [ ] **Task 9.2:** Manual smoke against live BE (`feat/delivery-nova-poshta-backend` running):
  - Physical cart → fill NP fields → submit → BE returns 201 with `delivery` echo.
  - Digital cart → no delivery section → submit → BE returns 201 with `delivery: null`.
  - Mix cart → delivery section visible → flow works.
  - Stop NP-API (simulate 503 via BE config) → banner renders, submit disabled.
- [ ] **Task 9.3:** Push and open PR:
```bash
git push -u origin feat/delivery-ux
gh pr create --title "feat(checkout): Nova Poshta delivery UX" --body "$(cat <<'EOF'
## Summary
- entities/delivery + features/checkout-delivery (City/Branch/Method UI, 503 banner)
- widgets/checkout-form composition root (FSD boundary fix)
- entities/cart carries product type for hasPhysical gating
- Conditional reCAPTCHA via NEXT_PUBLIC_RECAPTCHA_SITE_KEY
- Error mapping for new problem types (delivery/captcha/np-unavailable)
- E2E smoke @smoke for physical cart happy path

## Test plan
- [ ] pnpm verify green
- [ ] Manual: physical / digital / mixed / NP-down scenarios per spec §7
- [ ] BE staging: real /orders + real /delivery endpoints

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Done criteria

- All phases green per acceptance.
- BE delivery flow exercised end-to-end with real Nova Poshta refs.
- 503 degraded mode visually verified.
- PR open; CI green; reviewer can follow BE spec §4 + our spec §5 for context.
