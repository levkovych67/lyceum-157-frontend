"use client";
import { useRef } from "react";
import { EditorialLabel, ImageSlot } from "@/shared/ui";
import { useIntersection } from "@/shared/hooks/use-intersection";
import { cn } from "@/shared/lib";

/** Розворот-маніфест Про проєкт: Ч/Б фото + текст-заява, що проявляється. */
export function AboutHero() {
  const textRef = useRef<HTMLDivElement>(null);
  const shown = useIntersection(textRef, { threshold: 0.3, once: true });

  const revealClass = cn(
    "transition-all duration-d4 ease-paper",
    "motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:!transition-none",
    shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
  );

  return (
    <section
      aria-label="Про проєкт — hero"
      className="grid grid-cols-1 items-stretch md:grid-cols-2"
    >
      {/* Фото-половина */}
      <div className="relative min-h-[340px] bg-bg-noir md:min-h-[72vh]">
        <ImageSlot
          slot="about/hero/portrait"
          src="/images/about/hero/portrait.webp"
          ratio="3/4"
          variant="plain"
          caption="Архівне фото — фасад ліцею"
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover contrast-125 grayscale"
        />
      </div>

      {/* Текст-половина */}
      <div
        ref={textRef}
        className="flex flex-col justify-center gap-6 bg-bg-warm px-5 py-16 md:px-12 md:py-0"
      >
        <div className={revealClass} style={{ transitionDelay: "0ms" }}>
          <EditorialLabel>▌ Редакторська колонка</EditorialLabel>
        </div>
        <h1
          className={cn(
            "font-display text-display italic leading-[1.1] text-burgundy",
            revealClass,
          )}
          style={{ transitionDelay: "120ms" }}
        >
          Це не магазин.
          <br />
          Це архів.
        </h1>
        <p
          className={cn("max-w-prose text-lead text-ink-soft", revealClass)}
          style={{ transitionDelay: "240ms" }}
        >
          Кожен учень приносить додому не оцінку, а слід — фізичний обʼєкт, зроблений руками. Цей
          архів — продовження тієї ж практики онлайн.
        </p>
      </div>
    </section>
  );
}
