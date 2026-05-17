# TODO

Backlog знайденого під час Track A що виходить за scope. Не блокери для merge.

## Track B — Legal Content
- [ ] Real Privacy Policy text (юрист) — placeholder зараз `app/(public)/privacy/page.tsx`
- [ ] Real ToS text (юрист) — placeholder зараз `app/(public)/terms/page.tsx`
- [ ] Підтвердити `legal@157.kyiv.ua` як офіційний contact (інакше замінити в `shared/i18n/uk.ts`)

## Track C — Animations + Image Pipeline + E2E hardening
- [ ] String Carousel widget — реальна реалізація
- [ ] Paper Noise tuning — viewport-test на 4K/retina/zoom, можливо adjust opacity per breakpoint
- [ ] Sharp pre-build pipeline → WebP-only variants + base64 LQIP (no AVIF)
- [ ] Інтеграція blur токенів в `ImageSlot` (prop додано в Track A)
- [ ] E2E checkout: cart → checkout → success з тест-API
- [ ] E2E admin 2FA payouts/execute hardening tests

## Інше
- [ ] Виокремити catalog-grid / cart / payouts-table як reusable widgets з views (якщо буде потрібно для іншого контексту)
