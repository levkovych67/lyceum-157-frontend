"use client";
import Link from "next/link";
import { Container } from "@/shared/ui";

/**
 * Верхня плашка хедера — «дейтлайн» архівного видання.
 * Тонка летерпрес-смуга: гравірувальна штриховка, перфорований нижній кант,
 * три відсіки з волосяними роздільниками, серифний номер як акцент.
 */
export function TopBar() {
  return (
    <div className="relative hidden h-9 select-none overflow-hidden border-b border-dashed border-white/15 bg-bg-noir md:block">
      {/* гравірувальна штриховка — фактура офіційного бланку */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(243,234,214,0.055) 0 1px, transparent 1px 9px)",
        }}
      />
      {/* тепле сяйво за маркою — глибина */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-9 w-[420px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background: "radial-gradient(ellipse at center, rgba(243,234,214,0.10), transparent 72%)",
        }}
      />
      {/* верхній блик — летерпрес-кант */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/[0.07]" />

      <Container className="relative z-10 flex h-full items-center">
        {/* ЛІВА — місце видання */}
        <div className="flex flex-1 animate-page-turn items-center gap-2">
          <Mark />
          <span className="font-body text-[11px] uppercase tracking-[0.18em] text-bg-warm opacity-70">
            Київ · Оболонь
          </span>
        </div>

        <Rule />

        {/* ЦЕНТР — марка архіву */}
        <Link
          href="/about"
          aria-label="Архів Ліцею 157 — про проєкт"
          className="group flex flex-none animate-page-turn items-baseline gap-2 px-6 [animation-delay:90ms]"
        >
          <span className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-bg-warm transition-colors duration-d2 group-hover:text-white">
            Архів Ліцею
          </span>
          <span className="font-display text-[15px] font-bold italic leading-none text-white transition-all duration-d3 ease-spring group-hover:-translate-y-px group-hover:text-burgundy-soft">
            157
          </span>
        </Link>

        <Rule />

        {/* ПРАВА — поточний випуск */}
        <div className="flex flex-1 animate-page-turn items-center justify-end gap-2 [animation-delay:180ms]">
          <span className="font-body text-[11px] uppercase tracking-[0.18em] text-bg-warm opacity-70">
            Випуск №47 · Травень 2026
          </span>
          <Mark />
        </div>
      </Container>
    </div>
  );
}

/** Волосяний вертикальний роздільник між відсіками. */
function Rule() {
  return <span aria-hidden className="h-3.5 w-px shrink-0 bg-white/15" />;
}

/** Дрібний зірковий фініал — перегук із колофоном футера. */
function Mark() {
  return (
    <span aria-hidden className="text-[9px] leading-none text-burgundy-soft opacity-80">
      ✦
    </span>
  );
}
