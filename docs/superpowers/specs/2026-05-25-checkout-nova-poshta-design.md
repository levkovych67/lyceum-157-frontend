# Checkout — Nova Poshta picker + delivery section — Design

> **Дата:** 2026-05-25
> **Status:** approved (через `superpowers:brainstorming`)
> **Supersedes (на FE-частину):** [`2026-05-13-nova-poshta-delivery-design.md`](./2026-05-13-nova-poshta-delivery-design.md) — старий план описує `entities/delivery` + `widgets/checkout-form` + новий `shared/ui/combobox` atom + discriminated union у Zod. Той план не зреалізовано на FE. Цей дизайн вибирає простіший calque-from-sasha підхід без нових FSD-слайсів.
> **Джерело логіки:** `F:\Progect\2026\bogdan\sasha-cehemerov\lending\` — `lib/novaposhta.ts`, `lib/checkoutSchema.ts`, `components/Checkout/NovaPoshtaPicker.tsx`.

## 1. Контекст

Поточний `checkout-form.tsx` приймає лише `buyerEmail`, `buyerName`, `buyerPhone` — доставка не питається, хоча `CreateOrderRequest` у BE OpenAPI вже має опційне поле `delivery: DeliveryRequest` з `NovaPoshtaDetailsRequest`, а ендпоінти `/api/v1/delivery/nova-poshta/cities` і `/cities/{cityRef}/branches` працюють (BE-частина старого плану реалізована, орвал-клієнт згенеровано в `shared/api/generated/delivery/`).

Завдання: принести логіку picker'а з sasha-проєкту 1-в-1, замінивши Next BFF route на готовий generated client; додати delivery-секцію у `CheckoutSchema` що дзеркалить BE-форму без mapping шару.

## 2. Архітектура та межі

### 2.1 Файли, що з'являються/змінюються

| Файл | Зміна |
|---|---|
| `src/features/checkout/model/schemas.ts` | + `DeliverySchema`, `NovaPoshtaDetailsSchema`; розширює `CheckoutSchema` полем `delivery` |
| `src/features/checkout/ui/nova-poshta-picker.tsx` | **новий** — UI вибору міста+відділення |
| `src/features/checkout/ui/checkout-form.tsx` | + fieldset «Доставка» з `<NovaPoshtaPicker/>` через RHF `Controller` |
| `src/shared/lib/popular-cities.ts` | **новий** — масив популярних міст для focus-dropdown |
| `src/shared/i18n/uk.ts` | + ключі помилок доставки (`delivery.city.required`, `delivery.branch.required`, `delivery.unavailable`) |

### 2.2 Що НЕ створюємо (відмінно від старого плану 2026-05-13)

- **Немає** `entities/delivery` — delivery state живе в RHF-формі, не в окремому FSD-слайсі
- **Немає** `widgets/checkout-form` composition root — `checkout-form.tsx` залишається в `features/checkout` бо приймає тільки один feature (себе)
- **Немає** нового `shared/ui/combobox.tsx` atom — picker лишається self-contained з власним dropdown (як у sasha; shadcn `Popover+Command` додає залежності без явної користі для одного споживача)
- **Немає** `isPhysical` per cart item — доставка required завжди (вирішено у brainstorming), не залежить від типу товару
- **Немає** Zod discriminated union `delivery: NovaPoshta | Courier` — кур'єра не підтримуємо (BE-контракт не дозволяє, sasha v2 його теж сховав)

### 2.3 FSD-межі

- `features/checkout` → `shared/api/generated/delivery`, `shared/lib/popular-cities`, `shared/ui` ✅
- `features/checkout` НЕ імпортує між-feature і не виходить вище у `widgets/views`
- Імпорти тільки через `@/` alias

## 3. Дані та DTO mapping

### 3.1 Zod-схема

```ts
import { z } from "zod";

const NovaPoshtaDetailsSchema = z.object({
  cityRef: z.string().min(1, "Оберіть місто"),
  cityName: z.string().min(1),
  branchRef: z.string().min(1, "Оберіть відділення або поштомат"),
  branchNumber: z.string(),
  branchType: z.enum(["BRANCH", "POSTBOX"]),
  branchAddress: z.string(),
});

const DeliverySchema = z.object({
  method: z.literal("NOVA_POSHTA"),
  details: NovaPoshtaDetailsSchema,
});

export const CheckoutSchema = z.object({
  buyerEmail: z.string().email("Невірний email").max(255),
  buyerName: z.string().min(1, "Обовʼязкове").max(255),
  buyerPhone: z.string().regex(/^\+380\d{9}$/, "Формат +380XXXXXXXXX"),
  delivery: DeliverySchema,
});
export type CheckoutInput = z.input<typeof CheckoutSchema>;
```

Default values для RHF:
```ts
{
  buyerEmail: "", buyerName: "", buyerPhone: "+380",
  delivery: {
    method: "NOVA_POSHTA",
    details: {
      cityRef: "", cityName: "",
      branchRef: "", branchNumber: "", branchType: "BRANCH", branchAddress: "",
    },
  },
}
```

Schema тип дзеркалить `CreateOrderRequest.delivery` 1-в-1 — без mapping шару при submit.

### 3.2 Завантаження даних

- `useCities({ q: cityQuery }, { query: { enabled: cityQuery.length >= 2, staleTime: 60 * 60 * 1000 } })` — `NovaPoshtaCityDto[]`, до 50 елементів (BE-ліміт). TanStack кешує за `[url, params]`; staleTime 1h дзеркалить BE `Cache-Control: max-age=3600`. Debounce 250ms — `setTimeout` у onChange.
- `useBranches(cityRef, { query: { enabled: !!cityRef, staleTime: 60 * 60 * 1000 } })` — `NovaPoshtaBranchDto[]`. BE віддає до 3000 елементів (NP API ліміт). Київ ~700 — клієнтська фільтрація `.includes(whQuery)` OK.

### 3.3 Сортування branches

Логіка з `lib/novaposhta.ts:41-44` sasha — як локальна helper всередині picker'а:

```ts
function sortBranches(items: NovaPoshtaBranchDto[]) {
  return [...items].sort((a, b) => {
    const aBranch = a.type === "BRANCH";
    const bBranch = b.type === "BRANCH";
    if (aBranch !== bBranch) return aBranch ? -1 : 1;
    return (parseInt(a.number ?? "", 10) || 0) - (parseInt(b.number ?? "", 10) || 0);
  });
}
```

### 3.4 Факти про BE поведінку (з BE-плану 2026-05-13)

Підтверджено зі специфікації backend:

- **BE кешує** Caffeine in-memory, TTL 24h, max 10k entries — повторні запити дешеві
- **Endpoints мають `Cache-Control: public, max-age=3600`** — для cities/branches. У TanStack Query виставляємо `staleTime: 60 * 60 * 1000` щоб дзеркалити
- **BE розрізняє BRANCH/POSTBOX** через `TypeOfWarehouse` поле NP-response АБО fallback на `Description.contains("поштомат")`. Тип у DTO повертається саме у канонічному вигляді `"BRANCH"`/`"POSTBOX"` (mapping роблено на BE), тож на FE можна типаті assertion. Якщо при імплементації побачимо інше — додаємо `mapBranchType()` helper з unit-тестом
- **BE валідує `branchRef ∈ branches(cityRef)`** при submit. Невалідна комбінація → `400` з RFC 7807 `type: "invalid-delivery-ref"` — мапимо на `errors.delivery.details.branchRef` через існуючий ApiError flow
- **BE повертає `503` з `type: "novaposhta-unavailable"`** коли NP API down + cache miss — для banner/inline error matching

## 4. UI/UX поведінка picker'а

### 4.1 Структура

```
┌─ Місто ──────────────────────────────────┐
│ [input + spinner]                         │
│ ┌─ dropdown ──────────────────────────┐  │
│ │ Популярні міста: Київ / Львів / …   │  │ ← cityQuery < 2 chars
│ │ — або —                              │  │
│ │ live результати з useCities          │  │
│ └──────────────────────────────────────┘  │
│ <error or hint>                           │
└───────────────────────────────────────────┘

┌─ Відділення/поштомат (умовно: cityRef) ┐
│ [input] (пошук по номеру/адресі)        │
│ ┌─ dropdown ────────────────────────┐  │
│ │ №5: адреса      [Відділення/tag]  │  │
│ │ №3: ТРЦ Гулівер [Поштомат/tag]    │  │
│ └────────────────────────────────────┘  │
│ <error or hint>                         │
└──────────────────────────────────────────┘
```

### 4.2 Поведінкові правила (з sasha v2)

1. **Debounce 250ms** на пошук міст; спінер у input показуємо одразу на typing (накриває debounce + network)
2. **Min 2 chars** для запиту cities
3. **Популярні міста на focus**: dropdown коли `cityOpen && !citySelected && cityQuery.length < 2`. Клік по місту → `useCities({ q: name })` → беремо перший результат
4. **150ms blur-delay** перш ніж закривати dropdown (щоб click-on-item встиг)
5. **`onMouseDown={e.preventDefault()}`** на dropdown items — щоб клік не вкрав focus до того як onClick відробить
6. **Edit city → reset cityRef + branch**: усі залежні поля (cityRef, branchRef, branchNumber, branchType, branchAddress) очищуються
7. **Branch вибрано → показуємо label, query очищено**. Якщо користувач почне правити → `branchRef` reset, dropdown відкривається з фільтрацією по новому whQuery
8. **Сортування**: BRANCH перед POSTBOX, всередині — по числовому number
9. **`data-invalid`** атрибут на Input (shared/ui underline variant його підтримує)
10. **Формат branch label у dropdown:** `«№{number}: {address}»` + tag «Відділення»/«Поштомат» праворуч. Після вибору в input показуємо `«Відділення №5, вул. Сагайдачного 25»` або `«Поштомат №24001, вул. Хрещатик 1»` (з BE-плану §4.4) — це коротше і впізнаваніше ніж просто address

### 4.3 Інтеграція з useAppForm/RHF

Picker — controlled component, не plain input. Використовуємо `Controller`:

```tsx
<Controller
  control={form.control}
  name="delivery.details"
  render={({ field, fieldState }) => (
    <NovaPoshtaPicker
      value={field.value}
      onChange={(patch) => field.onChange({ ...field.value, ...patch })}
      errors={{
        city: form.formState.errors.delivery?.details?.cityRef?.message,
        branch: form.formState.errors.delivery?.details?.branchRef?.message,
      }}
    />
  )}
/>
```

`touched` поведінка — через `formState.touchedFields` + `formState.submitCount > 0` (як sasha робив через свій state, тільки тепер RHF).

### 4.4 503 / помилки Нової Пошти

- `useCities.isError` або `useBranches.isError` з `type === "novaposhta-unavailable"` → inline error під полем міста: «Сервіс Нової Пошти тимчасово недоступний». Дані з TanStack кешу (попередні успішні запити) залишаються видимими — користувач який раніше вибрав місто може все одно вибрати відділення з кеша.
- Submit НЕ блокується на NP-помилку. Якщо `cityRef`+`branchRef` уже заповнені — submit іде як зазвичай. BE може відхилити з `invalid-delivery-ref` якщо ref'и застаріли — це окрема обробка через ApiError.
- Empty result (200 OK з порожнім масивом) → у dropdown: «Місто не знайдено» / «Немає відділень у цьому місті».
- BE `400 invalid-delivery-ref` після submit → `ApiError.problem.errors[]` мапиться на RHF поля `delivery.details.cityRef`/`branchRef` стандартним `useAppForm` flow з повідомленням «Оберіть місто/відділення зі списку ще раз».

### 4.5 Accessibility

- `aria-autocomplete="list"`, `aria-controls={dropdownId}`, `aria-expanded`
- `role="listbox"` на dropdown, `role="option"` на items
- Keyboard навігація стрілками — **поза scope** першої ітерації (follow-up якщо буде запит)

## 5. Submit flow

`use-create-order.ts` залишається **без змін** — `CreateOrderRequest` уже приймає опційне `delivery`. У `checkout-form.tsx` onSubmit:

```ts
await m.mutateAsync({
  buyerEmail: data.buyerEmail,
  buyerName: data.buyerName,
  buyerPhone: data.buyerPhone,
  delivery: data.delivery, // ← новий блок
  items: items.map(i => ({ productId: i.productId, quantity: i.qty })),
});
```

Error mapping:
- Zod errors → RHF errors → `FormErrorSummary` показує всі (включно з `delivery.details.cityRef`, `delivery.details.branchRef`)
- BE 400 (RFC 7807) → `ApiError` → `useAppForm` мапить на RHF поля (існуюча інфраструктура)

## 6. Тести

### 6.1 Unit — `nova-poshta-picker.test.tsx`

- MSW моки на `/api/v1/delivery/nova-poshta/cities` і `/cities/{ref}/branches`
- На focus з порожнім query — показує популярні міста
- Ввод "Ки" → 250ms → cities API → результати
- Клік на місто → onChange отримує `{ cityRef, cityName, branchRef: "", … }`
- Після вибору міста — рендериться branches input, useBranches викликаний з правильним cityRef
- Сортування: BRANCH перед POSTBOX, всередині по number
- Edit city → branchRef очищується
- 503 від cities → inline error, submit-кнопка не дізаблиться

### 6.2 Schema — `schemas.test.ts`

- Валідний payload зі всіма delivery полями — safeParse success
- Порожній cityRef → error "Оберіть місто" на правильному path
- branchType "FOO" → enum error

### 6.3 Integration — `checkout-form.test.tsx`

- Submit без delivery → FormErrorSummary показує помилки міста і відділення
- Happy path → mutateAsync викликаний з `delivery: {method: "NOVA_POSHTA", details: {...}}`

### 6.4 E2E — `tests/e2e/checkout-delivery.spec.ts`

- `@smoke`: відкрити /checkout з товаром, побачити секцію доставки
- Golden path: заповнити форму, вибрати місто+відділення через моки (`page.route()`), submit → редірект на LiqPay URL
- Error path: submit з пустою доставкою → FormErrorSummary з обома помилками

## 7. Verification

```bash
cd lyceum-157-frontend
pnpm typecheck
pnpm lint
pnpm test src/features/checkout
pnpm build
pnpm e2e -g "checkout delivery"
```

Якщо потрібен `mapBranchType()` (Risk 3.4) — додаткові unit-тести на pure function.

## 8. Що НЕ робимо в цьому циклі

- Курʼєрський режим (BE не приймає, sasha v2 теж сховав)
- Keyboard nav по dropdown
- Окремі entities/widgets-слайси, новий combobox atom (старий план — over-scope)
- BE-зміни (контракт повний, ендпоінти живі)

## 9. Відкриті питання

- Список популярних міст: фінальний набір. З BE-плану §9 згадуються Київ, Львів, Одеса, Харків, Дніпро, Запоріжжя, Вінниця, Полтава — як кандидати для BE pre-warm cache. Для FE focus-dropdown пропоную ті ж 8 міст у `shared/lib/popular-cities.ts`
- Чи реально BE віддає `branchType` як `"BRANCH"`/`"POSTBOX"` (BE-план каже що mapping роблено в провайдері) — перевірити при першому viewing branches у dev. Якщо ні — додаємо `mapBranchType()` (низький ризик)
- BE pre-warm cache для топ-N міст (BE-план §9) — це BE follow-up, FE не блокується
