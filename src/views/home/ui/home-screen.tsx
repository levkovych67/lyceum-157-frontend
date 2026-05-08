import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Stamp, Stack, ImageSlot, EditorialDivider } from "@/shared/ui";
import type { Page, ProductCardDto } from "@/shared/api";

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
      <section aria-label="Hero колаж" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ImageSlot
          slot="home/hero/poster-1"
          ratio="3/4"
          variant="polaroid"
          caption="Учнівська робота — кераміка"
        />
        <ImageSlot
          slot="home/hero/poster-2"
          ratio="3/4"
          variant="polaroid"
          caption="Учнівська робота — графіка"
        />
        <ImageSlot
          slot="home/hero/poster-3"
          ratio="3/4"
          variant="polaroid"
          caption="Учнівська робота — текстиль"
        />
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
          ratio="4/5"
          variant="photo-print"
          caption="Ч/Б — клас на занятті"
          className="md:w-72"
        />
      </section>

      <EditorialDivider />

      {/* BLOCK 5 — Photographic Interlude (full-bleed) */}
      <section aria-label="Photographic interlude" className="-mx-6 md:-mx-12">
        <ImageSlot
          slot="home/interlude/main"
          ratio="16/9"
          variant="interlude"
          caption="Cinematic full-bleed момент"
        />
      </section>

      <EditorialDivider />

      {/* BLOCK 6 — Featured collection */}
      <section aria-label="Колекція місяця" className="space-y-4">
        <EditorialLabel>КОЛЕКЦІЯ МІСЯЦЯ</EditorialLabel>
        <ImageSlot
          slot="home/featured/cover"
          ratio="21/9"
          variant="interlude"
          caption="Банер колекції"
        />
        <p className="font-display text-h2 italic text-ink">Шевченківські дні · Графіка 11-А</p>
      </section>

      <EditorialDivider />

      {/* BLOCK 7 — Moodboard */}
      <section aria-label="Дошка натхнення" className="space-y-4">
        <EditorialLabel>ДОШКА НАТХНЕННЯ</EditorialLabel>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <ImageSlot
            slot="home/moodboard/scattered-1"
            ratio="1/1"
            variant="photo-print"
            caption="Деталь — пастель"
          />
          <ImageSlot
            slot="home/moodboard/scattered-2"
            ratio="1/1"
            variant="photo-print"
            caption="Деталь — глина"
          />
          <ImageSlot
            slot="home/moodboard/scattered-3"
            ratio="1/1"
            variant="photo-print"
            caption="Деталь — нитка"
          />
        </div>
      </section>

      <EditorialDivider />

      {/* BLOCK 8 — Author feature */}
      <section
        aria-label="Автор місяця"
        className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center"
      >
        <ImageSlot
          slot="home/authors/thumb"
          ratio="1/1"
          variant="portrait"
          caption="Портрет автора місяця"
          className="md:w-48"
        />
        <Stack gap={3}>
          <EditorialLabel>АВТОР МІСЯЦЯ</EditorialLabel>
          <p className="font-display text-h2 italic">Олена Сидоренко · 11-А</p>
          <p className="max-w-prose text-small text-ink-soft">
            Працює переважно з керамікою і текстилем. У цьому місяці — серія «Птахи».
          </p>
        </Stack>
      </section>
    </EditorialPageShell>
  );
}
