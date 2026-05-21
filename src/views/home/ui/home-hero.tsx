"use client";
import { EditorialLabel, ImageSlot, Stamp } from "@/shared/ui";
import { getBlur } from "@/shared/lib";
import { useScrollParallax } from "@/shared/hooks/use-scroll-parallax";

const SIZES_POLAROID = "(min-width: 1024px) 320px, 256px";

/** Masthead + колаж полароїдів — єдиний hero-блок Головної. */
export function HomeHero({ total }: { total: number | null }) {
  const sy = useScrollParallax(1);

  return (
    <section aria-label="Hero Головної" className="space-y-8">
      {/* Masthead */}
      <header className="space-y-2">
        <EditorialLabel>ВИПУСК №47 · ТРАВЕНЬ 2026*</EditorialLabel>
        <h1 className="font-display text-mega italic text-burgundy">Майстерня 157</h1>
        <p className="max-w-prose text-lead text-ink-soft">
          Архів учнівських робіт Ліцею №157. Київ · Оболонь · з 1957 року.
        </p>
        <Stamp text="EST. 1957" rotation={-8} animateOn="load" />
        {total != null && <p className="text-small text-ink-soft">Робіт у каталозі: {total}</p>}
      </header>

      {/* Колаж — 3 полароїди з легким скрол-дрейфом */}
      <div className="relative grid grid-cols-1 gap-8 overflow-hidden md:grid-cols-3 md:gap-4 md:overflow-visible lg:gap-8">
        <div className="z-10 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mt-12 md:rotate-[-3deg] md:justify-end">
          <div style={{ transform: `translateY(${sy * -0.06}px)` }}>
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
        </div>
        <div className="z-20 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mb-11 md:rotate-[2deg]">
          <div style={{ transform: `translateY(${sy * 0.04}px)` }}>
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
        </div>
        <div className="z-10 flex justify-center transition-transform hover:rotate-0 hover:scale-105 md:mt-20 md:rotate-[-5deg] md:justify-start">
          <div className="relative" style={{ transform: `translateY(${sy * -0.09}px)` }}>
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
      </div>
    </section>
  );
}
