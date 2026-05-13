# Nova Poshta Delivery — Design (pointer)

> **Дата:** 2026-05-13
> **Source of truth:** [`lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md`](../../../../lyceum-157-backend/docs/superpowers/specs/2026-05-13-nova-poshta-delivery-design.md)

Спека крос-каттінг (BE + FE), основний документ — у backend репо. Він містить **усю** FE-частину (FSD-структуру, Zod схеми, UX комбобоксів, 503-banner, тести).

## Quick reference для FE-розробника

| Що | Куди дивитись у спеці |
|---|---|
| FSD слайси що додаються (`entities/delivery`, `features/checkout-delivery`, `widgets/checkout-form`) | §4.1 |
| FSD-boundaries фікс (composition root у widget) | §4.2 |
| Оновлений `CheckoutSchema` + `DeliverySchema` (Zod discriminated union) | §4.3 |
| UX `CitySelect`/`BranchSelect` (debounce, групи BRANCH/POSTBOX, popular cities) | §4.4 |
| 503 banner + degraded mode | §4.5, §7.2 |
| FE-тести (vitest + MSW + RTL + Playwright smoke) | §5.2 |
| Verification команди для FE | §6 |
| Як `api.json` regen-ується після BE merge | §2.3, §6 |

## Що потрібно знати наперед

- BE мерджимо першим. FE робить regen `api.json` від live BE swagger після BE злиття.
- Новий FE atom: `shared/ui/combobox.tsx` (shadcn-стилізований Radix Popover + Command). Reusable за межами delivery.
- Один FSD-фікс: `checkout-form.tsx` мігрує з `features/checkout/ui/` у `widgets/checkout-form/ui/` (бо тепер компонує два features — `checkout` і `checkout-delivery`).
- Cart-store отримує `isPhysical` per item. Product API має повертати це поле — перевір `api.json` після BE злиття.
