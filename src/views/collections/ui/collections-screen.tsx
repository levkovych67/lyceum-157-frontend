import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, Stamp } from "@/shared/ui";

const tiles = [
  {
    slot: "collections/tile-1",
    src: "/images/collections/tile-1.webp",
    title: "Шевченківські дні",
    edition: "Випуск №31 · Березень 2026",
    blurb: "Графічні портрети до Шевченкових днів — вугілля, олівець, туш.",
    rotate: "rotate-[-3deg]",
    col: "md:col-span-5 md:col-start-1 md:mt-8",
    width: "w-full md:w-72 lg:w-80",
  },
  {
    slot: "collections/tile-2",
    src: "/images/collections/tile-2.webp",
    title: "Випуск 11-А",
    edition: "Спецвипуск · Травень 2026",
    blurb: "Дипломні роботи — кераміка, текстиль, змішана техніка від випускників.",
    rotate: "rotate-[3deg]",
    col: "md:col-span-6 md:col-start-7 md:-mt-8",
    width: "w-full md:w-80 lg:w-[28rem]",
  },
  {
    slot: "collections/tile-3",
    src: "/images/collections/tile-3.webp",
    title: "Літня практика",
    edition: "Польовий зошит · Червень–Серпень 2025",
    blurb: "Пленер у Карпатах та Криму — акварель, нариси, етюди.",
    rotate: "rotate-[-5deg]",
    col: "md:col-span-5 md:col-start-2 md:mt-12",
    width: "w-full md:w-64 lg:w-72",
  },
  {
    slot: "collections/tile-4",
    src: "/images/collections/tile-4.webp",
    title: "Архів 2024",
    edition: "Ретроспектива",
    blurb: "Найкращі роботи минулого року з картотеки кураторки.",
    rotate: "rotate-[2deg]",
    col: "md:col-span-5 md:col-start-8 md:-mt-4",
    width: "w-full md:w-72 lg:w-80",
  },
] as const;

export function CollectionsScreen() {
  return (
    <EditorialPageShell>
      {/* Hero */}
      <section className="relative py-12">
        <EditorialLabel>▌ ТЕМАТИЧНІ СПЕЦВИПУСКИ</EditorialLabel>
        <h1 className="mt-4 font-display text-mega italic leading-none text-burgundy">Колекції</h1>
        <div className="absolute right-[8%] top-[20%] hidden md:block">
          <Stamp text="АРХІВ ЛІЦЕЮ 157" rotation={-8} animateOn="load" className="text-burgundy" />
        </div>
        <p className="mt-8 max-w-prose text-lead text-ink-soft">
          Кураторські добірки робіт за темою, випуском чи сезоном — не просто список товарів, а
          спецвипуски архіву.
        </p>
      </section>

      <EditorialDivider />

      {/* Featured / hero collection — full bleed */}
      <section aria-label="Колекція місяця" className="-mx-6 my-8 md:-mx-12 lg:-mx-24">
        <div className="relative">
          <ImageSlot
            slot="collections/hero"
            src="/images/collections/hero.webp"
            ratio="21/9"
            variant="plain"
            caption="Колекція місяця"
            className="h-full w-full object-cover"
          />
          <div className="from-ink/70 via-ink/20 absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t to-transparent p-8 md:p-16">
            <EditorialLabel className="border-bg-warm/30 text-bg-warm/80">
              КОЛЕКЦІЯ МІСЯЦЯ
            </EditorialLabel>
            <p className="mt-2 font-display text-h1 italic text-bg-warm drop-shadow-md">
              Шевченківські дні
            </p>
            <p className="text-bg-warm/90 mt-2 max-w-prose font-hand text-hand-m">
              ← обери на колажі нижче
            </p>
          </div>
        </div>
      </section>

      <EditorialDivider />

      {/* Asymmetric tile grid */}
      <section
        aria-label="Усі колекції"
        className="grid grid-cols-1 gap-12 py-8 md:grid-cols-12 md:gap-6"
      >
        {tiles.map((t) => (
          <article key={t.slot} className={`flex flex-col gap-4 ${t.col}`}>
            <div
              className={`flex justify-center ${t.rotate} transition-transform hover:rotate-0 hover:scale-[1.02]`}
            >
              <ImageSlot
                slot={t.slot}
                src={t.src}
                ratio="4/5"
                variant="photo-print"
                caption={t.title}
                className={`${t.width} shadow-[0_12px_24px_rgba(0,0,0,0.18)]`}
              />
            </div>
            <div className="px-2">
              <p className="font-mono text-small uppercase tracking-wider text-ink-soft">
                {t.edition}
              </p>
              <h2 className="mt-1 font-display text-h2 italic text-burgundy">{t.title}</h2>
              <p className="mt-2 max-w-prose text-body text-ink-soft">{t.blurb}</p>
            </div>
          </article>
        ))}
      </section>

      <EditorialDivider />

      {/* Decorative footer */}
      <section className="flex flex-col items-center gap-6 py-16">
        <div className="rotate-[-4deg] transition-transform hover:rotate-0">
          <ImageSlot
            slot="collections/decorative/stamp"
            src="/images/collections/decorative/stamp.webp"
            ratio="1/1"
            variant="stamp"
            caption="Архівна печатка"
            className="w-32 grayscale"
          />
        </div>
        <Stamp text="АРХІВ ЛІЦЕЮ 157" rotation={-5} animateOn="load" />
        <p className="max-w-prose text-center font-hand text-hand-m text-ink-soft">
          Нові спецвипуски виходять кожного місяця — слідкуйте за випусками.
        </p>
      </section>
    </EditorialPageShell>
  );
}
