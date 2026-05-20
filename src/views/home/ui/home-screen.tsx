import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Stamp, Stack, ImageSlot, EditorialDivider } from "@/shared/ui";
import { getBlur } from "@/shared/lib";
import type { Page, ProductCardDto } from "@/shared/api";

const SIZES_POLAROID = "(min-width: 1024px) 320px, 256px";
const SIZES_MANIFESTO = "(min-width: 768px) 288px, 100vw";
const SIZES_FULL_BLEED = "(min-width: 1280px) 1280px, 100vw";
const SIZES_MOODBOARD = "(min-width: 1024px) 320px, (min-width: 768px) 256px, 192px";
const SIZES_PORTRAIT = "(min-width: 768px) 224px, 100vw";

export function HomeScreen({ initial }: { initial: Page<ProductCardDto> | null }) {
  return (
    <EditorialPageShell>
      {/* BLOCK 1 — masthead */}
      <header className="space-y-2">
        <EditorialLabel>ВИПУСК №47 · ТРАВЕНЬ 2026</EditorialLabel>
        <h1 className="font-display text-mega italic text-burgundy">Майстерня 157</h1>
        <p className="max-w-prose text-lead text-ink-soft">
          Архів учнівських робіт Ліцею №157. Київ · Оболонь · з 1957 року.
        </p>
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
        {initial && (
          <p className="text-small text-ink-soft">Робіт у каталозі: {initial.totalElements}</p>
        )}
      </header>

      <EditorialDivider />

      {/* BLOCK 2 — hero collage with 3 polaroids */}
      <section
        aria-label="Hero колаж"
        className="relative grid grid-cols-1 gap-8 overflow-hidden py-12 md:grid-cols-3 md:gap-4 md:overflow-visible lg:gap-8"
      >
        <div className="z-10 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mt-12 md:rotate-[-3deg] md:justify-end">
          <ImageSlot
            slot="home/hero/poster-1"
            src="/images/home/hero/poster-1.webp"
            ratio="3/4"
            variant="polaroid"
            caption="Учнівська робота — кераміка"
            className="w-52 sm:w-64 lg:w-72"
            priority
            sizes={SIZES_POLAROID}
            blurDataURL={getBlur("/images/home/hero/poster-1.webp")}
          />
        </div>
        <div className="z-20 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:-mt-4 md:rotate-[2deg]">
          <ImageSlot
            slot="home/hero/poster-2"
            src="/images/home/hero/poster-2.webp"
            ratio="3/4"
            variant="polaroid"
            caption="Учнівська робота — графіка"
            className="w-52 sm:w-64 lg:w-80"
            priority
            sizes={SIZES_POLAROID}
            blurDataURL={getBlur("/images/home/hero/poster-2.webp")}
          />
        </div>
        <div className="z-10 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mt-20 md:rotate-[-5deg] md:justify-start">
          <div className="relative">
            <ImageSlot
              slot="home/hero/poster-3"
              src="/images/home/hero/poster-3.webp"
              ratio="3/4"
              variant="polaroid"
              caption="Учнівська робота — текстиль"
              className="w-52 sm:w-64 lg:w-72"
              priority
              sizes={SIZES_POLAROID}
              blurDataURL={getBlur("/images/home/hero/poster-3.webp")}
            />
            <p className="absolute -bottom-8 -right-4 hidden rotate-[-8deg] font-hand text-hand-m text-green md:block lg:-right-12 lg:bottom-12">
              ← хіт виставки!
            </p>
          </div>
        </div>
      </section>

      <EditorialDivider />

      {/* BLOCK 3 — Editor's letter / manifesto */}
      <section
        aria-label="Маніфест"
        className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-start"
      >
        <Stack gap={4}>
          <EditorialLabel>ЛИСТ РЕДАКТОРА</EditorialLabel>
          <p className="font-display text-h2 italic text-ink">
            Ми не маркетплейс. Ми архів того, що діти роблять руками між уроками.
          </p>
          <p className="max-w-prose text-body text-ink-soft">
            Кожна робота тут — це чийсь четвер. Хтось забув тінь, хтось не встиг покрити лаком. Це
            не вади — це сліди. Купуючи, ви забираєте час дитини, а не товар.
          </p>
        </Stack>
        <ImageSlot
          slot="home/manifesto/bw"
          src="/images/home/manifesto/bw.webp"
          ratio="4/5"
          variant="photo-print"
          caption="Ч/Б — клас на занятті"
          className="mx-auto w-64 sm:w-72 md:mx-0 md:w-72"
          sizes={SIZES_MANIFESTO}
          blurDataURL={getBlur("/images/home/manifesto/bw.webp")}
        />
      </section>

      <EditorialDivider />

      {/* BLOCK 5 — Photographic Interlude (full-bleed) */}
      <section aria-label="Photographic interlude" className="-mx-5 md:-mx-6">
        <ImageSlot
          slot="home/interlude/main"
          src="/images/home/interlude/main.webp"
          ratio="16/9"
          variant="interlude"
          caption="Cinematic full-bleed момент"
          sizes={SIZES_FULL_BLEED}
          blurDataURL={getBlur("/images/home/interlude/main.webp")}
        />
      </section>

      <EditorialDivider />

      {/* BLOCK 6 — Featured collection */}
      <section aria-label="Колекція місяця" className="space-y-4">
        <EditorialLabel>КОЛЕКЦІЯ МІСЯЦЯ</EditorialLabel>
        <ImageSlot
          slot="home/featured/cover"
          src="/images/home/featured/cover.webp"
          ratio="21/9"
          variant="interlude"
          caption="Банер колекції"
          sizes={SIZES_FULL_BLEED}
          blurDataURL={getBlur("/images/home/featured/cover.webp")}
        />
        <p className="font-display text-h2 italic text-ink">Шевченківські дні · Графіка 11-А</p>
      </section>

      <EditorialDivider />

      {/* BLOCK 7 — Moodboard */}
      <section aria-label="Дошка натхнення" className="space-y-12 py-8">
        <div className="flex items-start justify-between">
          <EditorialLabel>ДОШКА НАТХНЕННЯ</EditorialLabel>
          <Stamp
            text="РЕТРО"
            rotation={-12}
            animateOn="hover"
            className="hidden text-burgundy md:block"
          />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-4 lg:gap-8">
          {/* Item 1 */}
          <div className="flex justify-center md:col-span-4 md:col-start-1 md:mt-8 md:justify-end">
            <div className="rotate-[-3deg]">
              <ImageSlot
                slot="home/moodboard/scattered-1"
                src="/images/home/moodboard/scattered-1.webp"
                ratio="1/1"
                variant="photo-print"
                caption="Деталь — пастель"
                className="w-56 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                sizes={SIZES_MOODBOARD}
                blurDataURL={getBlur("/images/home/moodboard/scattered-1.webp")}
              />
            </div>
          </div>

          {/* Item 2 */}
          <div className="z-10 flex justify-center md:col-span-4 md:col-start-5 md:-mt-12">
            <div className="rotate-[2deg]">
              <ImageSlot
                slot="home/moodboard/scattered-2"
                src="/images/home/moodboard/scattered-2.webp"
                ratio="1/1"
                variant="photo-print"
                caption="Деталь — глина"
                className="w-64 border-[4px] border-bg-warm shadow-[0_12px_24px_rgba(0,0,0,0.18)] lg:w-80"
                sizes={SIZES_MOODBOARD}
                blurDataURL={getBlur("/images/home/moodboard/scattered-2.webp")}
              />
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex justify-center md:col-span-4 md:col-start-9 md:mt-16 md:justify-start">
            <div className="relative rotate-[-5deg]">
              <p className="absolute -left-12 -top-6 rotate-[-15deg] font-hand text-hand-m text-ink">
                фактура ↗
              </p>
              <ImageSlot
                slot="home/moodboard/scattered-3"
                src="/images/home/moodboard/scattered-3.webp"
                ratio="1/1"
                variant="photo-print"
                caption="Деталь — нитка"
                className="w-48 shadow-[0_12px_24px_rgba(0,0,0,0.18)]"
                sizes={SIZES_MOODBOARD}
                blurDataURL={getBlur("/images/home/moodboard/scattered-3.webp")}
              />
            </div>
          </div>

          {/* Sticker */}
          <div className="z-20 flex justify-center md:col-span-6 md:col-start-6 md:-mt-8 md:justify-end lg:-mt-16">
            <div className="w-full max-w-xs rotate-[3deg] bg-bg-yellow p-5 shadow-[0_8px_32px_rgba(110,39,61,0.12)] sm:max-w-sm sm:p-6 md:w-auto md:max-w-none">
              <p className="font-hand text-hand-m text-ink">
                «Я малюю те, чого не вистачає Києву — снігу влітку.»
              </p>
              <p className="mt-4 font-hand text-hand-s text-green">— Марта, 11-А</p>
            </div>
          </div>
        </div>
      </section>

      <EditorialDivider />

      {/* BLOCK 8 — Author feature */}
      <section
        aria-label="Автор місяця"
        className="grid grid-cols-1 gap-8 md:grid-cols-[auto_1fr] md:items-center"
      >
        <div className="relative">
          <ImageSlot
            slot="home/authors/thumb"
            src="/images/home/authors/thumb.webp"
            ratio="1/1"
            variant="portrait"
            caption="Портрет автора місяця"
            className="md:w-56"
            sizes={SIZES_PORTRAIT}
            blurDataURL={getBlur("/images/home/authors/thumb.webp")}
          />
          <div className="absolute -bottom-4 -right-4 z-10 md:-bottom-6 md:-right-6">
            <Stamp text="АВТОР МІСЯЦЯ" rotation={-8} animateOn="hover" className="text-burgundy" />
          </div>
        </div>
        <Stack gap={3} className="md:pl-8">
          <EditorialLabel>АВТОР МІСЯЦЯ</EditorialLabel>
          <p className="font-display text-h2 italic text-ink">Олена Сидоренко · 11-А</p>
          <p className="max-w-prose text-lead text-ink-soft">
            Працює переважно з керамікою і текстилем. У цьому місяці — серія «Птахи».
          </p>
          <p className="mt-2 font-hand text-hand-m text-green">
            — Найкраще працюється ввечері, коли школа порожня
          </p>
        </Stack>
      </section>
    </EditorialPageShell>
  );
}
