"use client";
import { ImageSlot, Stamp } from "@/shared/ui";
import { useScrollParallax } from "@/shared/hooks/use-scroll-parallax";

/** Повноширинний фото-hero Каталогу — підлазить під прозорий хедер. */
export function CatalogHero() {
  const drift = useScrollParallax(0.15);

  return (
    <section
      aria-label="Каталог — hero"
      className="relative -mt-[100px] h-[68vh] min-h-[440px] w-full overflow-hidden bg-bg-noir md:-mt-[124px]"
    >
      {/* Документальне фото з паралакс-дрейфом */}
      <div className="absolute inset-x-0 top-0" style={{ transform: `translateY(${drift}px)` }}>
        <ImageSlot
          slot="catalog/hero/banner"
          src="/images/catalog/hero/banner.webp"
          ratio="21/9"
          variant="plain"
          caption="Документальне фото — каталог робіт"
          priority
          sizes="100vw"
          className="h-[80vh] min-h-[520px] w-full object-cover"
        />
      </div>

      {/* Скрим зліва — щоб заголовок читався */}
      <div className="from-bg-noir/85 via-bg-noir/45 absolute inset-0 bg-gradient-to-r to-transparent" />
      {/* Верхній скрим — щоб кремові лінки хедера читались над фото */}
      <div className="from-bg-noir/85 absolute inset-x-0 top-0 h-48 bg-gradient-to-b to-transparent" />

      {/* Контент */}
      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-12 pt-[100px] md:px-12 md:pb-16 md:pt-[124px]">
        <p className="text-bg-warm/80 font-body text-small font-bold uppercase tracking-[0.2em]">
          ▌ Том 47 · Травень 2026
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-h1 italic leading-[1.05] text-bg-warm md:text-mega">
          Каталог робіт
        </h1>
        {/* Музейна підпис-картка */}
        <p className="border-bg-warm/30 text-bg-warm/85 mt-6 max-w-md border-l-2 pl-4 text-body">
          Оригінальні роботи учнів ліцею. Повний перелік наявних творів.
        </p>
      </div>

      {/* Печатка — лише десктоп (на мобільному тіснилася б із заголовком) */}
      <div className="absolute right-6 top-[112px] z-10 hidden md:right-12 md:top-[150px] md:block">
        <Stamp text="MAYSTERNYA · KYIV" rotation={-10} animateOn="load" className="text-bg-warm" />
      </div>
    </section>
  );
}
