---
version: 3.0
name: Майстерня 157 — Випуск Архіву №47
description: >-
  Візуальна ідентичність магазину-галереї учнівських робіт Ліцею №157. Сайт позиціонує
  себе як 47-й щорічний випуск надрукованого вручну шкільного архіву
  (1957–2026): теплий молочний папір, бордові печатки, темно-зелені редакторські акценти,
  Fraunces для заголовків + Manrope для тексту + Caveat для рукописів. Тактильний, архівний,
  видавничий рівень — жодного SaaS-flat.

colors:
  # Brand Core
  burgundy: "#6e273d"           # primary, заголовки, ціни, печатки
  burgundy-deep: "#4d1a2a"      # hover, active states
  burgundy-soft: "#f5e6ea"      # tinted backgrounds, badges
  green: "#0c6633"              # secondary, навігація, success
  green-deep: "#00662a"         # deep accent, lines
  green-soft: "#d8e6dc"         # soft tinted bg

  # Surfaces
  bg: "#fafaf7"                 # MAIN — теплий молочний
  bg-warm: "#f3ead6"            # postcard back, warm callout
  bg-card: "#ffffff"            # картки, інтерфейсні поверхні
  bg-yellow: "#fef3c7"          # стікери, гра, акцент-секції
  bg-blue: "#dbeafe"            # стікери варіант
  bg-noir: "#1a1612"            # top bar, very bottom, contrast

  # Ink
  ink: "#1e1e1e"                # основний текст
  ink-soft: "#6b6b6b"           # secondary text
  ink-fade: "#a8a8a8"           # tertiary, hints
  line: "#ececec"               # розділювачі
  line-strong: "#c9c0b3"        # акцент-лінії на warm bg

  # Functional
  link: "#1e73be"               # посилання у плотному тексті
  stamp: "#6e273d"              # печатки
  error: "#b03030"              # помилки форми

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
    backgroundColor: "{colors.burgundy}"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px 32px
  button-primary-hover:
    backgroundColor: "{colors.green}"
    textColor: "{colors.bg}"
  button-primary-active:
    backgroundColor: "{colors.burgundy-deep}"
    textColor: "{colors.bg}"

  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.burgundy}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px 32px
  button-secondary-hover:
    backgroundColor: "{colors.burgundy}"
    textColor: "{colors.bg}"

  card-paper:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px
  card-warm:
    backgroundColor: "{colors.bg-warm}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: 24px

  sticker-note:
    backgroundColor: "{colors.bg-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.hand-m}"
    rounded: "{rounded.sm}"
    padding: 16px

  museum-label:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    padding: 12px 16px

  editorial-label:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.burgundy}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 0px

  stamp:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.stamp}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 12px

  form-field:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: 12px 16px
  form-field-error:
    backgroundColor: "{colors.bg-card}"
    textColor: "{colors.error}"

  input-link:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.link}"
    typography: "{typography.body}"

  topbar:
    backgroundColor: "{colors.bg-noir}"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    padding: 8px 24px
---

## Огляд

Сайт є **47-м щорічним випуском архіву Майстерні 157**. Архів друкується вручну на теплому молочному папері з 1957 року, ілюструється чорно-білою документальною фотографією та присвячується щороку актуальним учнівським роботам. Кожна сторінка сайту — це сторінка цього видання: головна — це обкладинка та перший розворот; каталог — це контактний аркуш; сторінка товару — це велика стаття; чекаут — поштовий бланк замовлення.

Три стовпи тримають айдентику разом:

1. **Папір.** Тактильні поверхні. Тіні від фотографій. Молочний фон. Жовті стікери. Вугільно-чорні акценти. Печатки ручної роботи. Видимі сліди фізичного процесу — нерівні краї, легкі нахили, шум паперу.
2. **Типографіка.** Це видання, а не SaaS-дашборд. Заголовки великі, італійські, з налаштованою віссю оптичного розміру. Основний текст спокійний. Рукописний шрифт Caveat живе на полях. Редакторські мітки (▌) з трекінгом 12%. Цифри збільшені.
3. **Школа.** Це не «магазин *про* школу» — це **школа показує свій архів**. Печатки з позначкою 157, шкільний герб, фотографії коридорів, учнівський почерк, цитати випускників, адреси фізичних будівель на листівках.

Тон делікатно змінюється на сайті (редакторський-офіційний на головній/каталозі/про нас, редакторський-теплий на авторі/роботі/дякуємо, функціональний-паперовий на кошику/оформленні/вході/кабінеті), але візуальна мова ніколи не змінюється — лише щільність декору.

## Кольори

Правило 60-30-10 керує розподілом поверхонь:

- **60%** будь-якого вигляду — це `bg` (#fafaf7 молочний папір).
- **30%** розподілено між `burgundy` (бордовий) блоками та теплими вставками (`bg-warm`, `bg-yellow`).
- **10%** зарезервовано для точкових акцентів — `green` (глибокий зелений) та `bg-noir`.

- **`burgundy` (#6e273d "Бордовий"):** єдиний голос бренду. Заголовки, ціни, печатки, найважливіший заклик до дії на кожному екрані. Ніколи не використовується для основного тексту.
- **`burgundy-deep` (#4d1a2a):** стан active/pressed основних поверхонь; ніколи не як статична заливка.
- **`burgundy-soft` (#f5e6ea):** тоновані фони для бейджів та підказок, які повинні виглядати як частина бренду, але не кричати.
- **`green` (#0c6633 "Редакторський зелений"):** стан спокою навігації, стани успіху та інвертований hover для `button-primary`. Чергування зеленого та бордового є навмисним — воно нагадує друкарські акцентні чорнила.
- **`bg` (#fafaf7):** молочний папір, який тримає все разом. Чисто білий (`bg-card`) зарезервовано для піднятих поверхонь (картки, поля вводу), щоб сама сторінка виглядала теплішою.
- **`bg-warm` (#f3ead6):** зворотна сторона поштової листівки. Використовується для композиції футера та теплих вставок.
- **`bg-yellow` / `bg-blue`:** стікери — рукописні коментарі на полях, ніколи не основний контент.
- **`bg-noir` (#1a1612):** майже чорний з відтінком тепла. Використовується лише для верхньої технічної смуги та самого низу сторінки; ніколи як звичайний темний фон.
- **`ink` родина (#1e1e1e → #a8a8a8):** ієрархія тексту. Основний текст завжди `ink`; метадані використовують `ink-soft`; підказки, плейсхолдери, неактивний стан використовують `ink-fade`.
- **`link` (#1e73be):** єдиний дозволений синій, і тільки для гіперпосилань, вбудованих у текст. Кнопки ніколи його не використовують.
- **`error` (#b03030):** тепліший, більш бордовий червоний — сидить усередині палітри, а не сперечається з нею.

## Типографіка

Три гарнітури, усі варіативні, усі з Google Fonts:

- **Fraunces** (display) — із засічками, з віссю `opsz` (оптичний розмір) та `WONK`. Задає тон видання.
- **Manrope** (body) — нейтральний гротеск, товщина 200–800.
- **Caveat** (handwriting) — нотатки на полях, підписи, ніколи не основний текст.

Курсив Fraunces зарезервований для `display`, `h2` та `quote` — ніколи не використовується як загальний стиль виділення. Вісь оптичного розміру відображає традиційний друк: `opsz 144` на найбільших заголовках (м'якші, більш контрастні криві) та `opsz 9–24` на меншому робочому тексті. Штучний курсив та синтетичні нахили заборонені.

Токен `label` — це великі літери Manrope з трекінгом 12% — це голос редакторської мітки, який замінює прийом "▌ НАЗВА РОЗДІЛУ" по всьому сайту. Рукописні токени (`hand-s/m/l`) використовуються помірно: маргіналії, підпис редактора, поодинокі атрибуції цитат. Основний текст ніколи не використовує Caveat.

## Макет

- **Контейнер:** максимальна ширина 1280px, горизонтальні відступи 24px (десктоп) / 20px (мобільний).
- **Вертикальний ритм:** секції дихають на 120px на десктопі, 64px на мобільному. Все, що щільніше, здається плоским; все, що ширше, ламає ритм перегортання сторінок.
- **Сітка:** 12-колонкова з відступом 24px (16px мобільний). Сітка *присутня*, але **ніколи не симетрична** — контент навмисно зважений ліворуч або праворуч, багато фотографій з одного боку, багато тексту з іншого.
- **Шкала відступів:** щільна з кроком 4–32px для внутрішнього простору компонентів; стрибає до 48–200px для вільного простору. Ніколи не використовуйте значення, якого немає на шкалі.

## Висота та Глибина

Тіні теплі, ніколи не нейтрально-сірі. Бордові альфа-шари замінюють тіні від чорнила, які ви б побачили на складеному папері.

- **Paper-rest** (`0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(110,39,61,0.06)`) — за замовчуванням для карток. Імітує аркуш, що лежить на сторінці під ним.
- **Lift** (`0 8px 32px rgba(110,39,61,0.12)`) — стан наведення для карток товарів, входу в модальне вікно.
- **Photo-print** (`0 12px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10)`) — чорно-білі фотографії, що лежать на сторінці; навмисно холодніші та жорсткіші за тінь паперу.
- **Deep** (`0 32px 64px rgba(0,0,0,0.24)`) — лише для накладень і лайтбоксів.

Слабке бордове віньєтування (`radial-gradient at center, transparent 60%, rgba(110,39,61,0.04) 100%`) накладається на фото-секції. Гласморфізм заборонений, окрім прилипаючого хедера.

## Форми

- `rounded.sm` (6px) — теги, малі бейджі, поля вводу.
- `rounded.md` (12px) — фотографії, картки контенту.
- `rounded.lg` (20px) — великі картки функцій.
- `rounded.full` (9999px) — кнопки-пігулки, печатки.
- `rounded.none` — редакторські мітки, музейні мітки, розділювальні лінії. Гострі кути сигналізують про «надируковане».

Межі бувають чотирьох видів: тонкі (`1px solid line`) для звичайних розділювачів, сильні (`1.5px solid ink`) для наголосу, бордові (`1.5px solid burgundy`) для фірмових поверхонь і пунктирні (`1.5px dashed ink`) для поштових/формних розділювачів.

## Компоненти

Компоненти у frontmatter охоплюють базовий словник. Кожен іменований стан (`-hover`, `-active`, `-error`) є сестринським токеном, а не вкладеним об'єктом — це дозволяє звертатися до них з тем Tailwind та експортів DTCG.

Умовності:

- **Кнопки** мають форму пігулки, використовують шрифт `label`, на всю ширину на мобільному. При наведенні `burgundy` змінюється на `green`, а не затемнюється — це фірмова взаємодія бренду.
- **Картки** знаходяться на `bg-card` (білий) з `rounded.md` і висотою `paper-rest`. Теплі вставки замість цього використовують `bg-warm`.
- **Печатки** — це круглі блоки `rounded.full` кольору `stamp`, які застосовуються з рухом `stamp-drop` (масштаб 1.4 → 1, обертання ±10° від фінального, `cubic-bezier(0.5, -0.6, 0.5, 1.6)` протягом 280мс). Плавне зникнення (fade-in) заборонено для печаток.
- **Стікери** використовують `bg-yellow` і рукописний Caveat — це декоративні анотації, ніколи не основний контент.
- **Поля форм** використовують `bg-card`, `rounded.sm`, основний шрифт. Помилки відображають текст у `error`, залишаючи поверхню незмінною — колір керує попередженням, а не червона коробка.
- **Редакторські мітки** — це великі літери Manrope `label` (11px, трекінг 12%), яким передує символ ▌; rounded.none, без відступів, розташовані прямо над заголовками.

## Що робити і чого не робити

**Робіть**

- Зарезервуйте `burgundy` (бордовий) для єдиної найважливішої дії на кожному екрані.
- Використовуйте угоду про іменування сестринських станів (`button-primary-hover`, а не вкладені об'єкти).
- Зберігайте накладення шуму паперу видимим на кожній сторінці (`body::before`, непрозорість 0.04, змішування multiply).
- Анімуйте печатки пружною кривою `ease-stamp` — невелике перестрибування є фірмовим.
- Свідомо поєднуйте курсивний і прямий Fraunces; курсив означає "назва розділу" і "цитата", прямий — усе інше.
- Дотримуйтесь правила 60-30-10 щодо поверхонь у кожній композиції.

**Не робіть**

- Не вводьте жорстко закодовані кольори, розміри або шрифти в компонентах — лише класи, похідні від токенів.
- Не замінюйте `stamp-drop` на плавне зникнення. Плавне зникнення є неприйнятним кроком назад.
- Не використовуйте симетричні сітки товарів 4×N — вони виглядають як стандартний Shopify. Схиляйтеся до асиметрії.
- Не використовуйте градієнтні фони, гласморфізм (окрім прилипаючого хедера), фіолетові світіння по кутах або стандартні цикли Lottie — це ознаки AI-генерації, які специфікація прямо забороняє.
- Не поєднуйте Inter / Space Grotesk / Roboto з цією палітрою. Або Fraunces + Manrope + Caveat, або нічого.
- Не змішуйте `rounded.sm` і `rounded.lg` в одній композиції — оберіть один регістр і тримайте його.
- Не використовуйте емодзі як елементи інтерфейсу; натомість використовуйте друкарські знаки (★ ▌ → ⊙).
- Не допускайте поєднань кольорів, що не відповідають WCAG. Основний текст на `bg` повинен перевищувати 4.5:1 — перевірте за допомогою контрастної перевірки.
