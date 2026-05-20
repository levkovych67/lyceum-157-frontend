"use client";
import Link from "next/link";
import { useState } from "react";
import { Container, PostageStamp, Stamp } from "@/shared/ui";
import { cn } from "@/shared/lib";

export function Footer() {
  const [isSectionsOpen, setIsSectionsOpen] = useState(false);

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-bg pb-0 pt-12">
      {/* Watermark "1 5 7" behind the content */}
      <div className="text-burgundy/5 pointer-events-none absolute left-10 top-[10%] hidden -rotate-[4deg] select-none flex-col gap-6 font-display text-[160px] font-black leading-none lg:flex">
        <span>1</span>
        <span>5</span>
        <span>7</span>
      </div>

      {/* --- POSTCARD FRONT SIDE --- */}
      <Container className="relative z-10 mb-12">
        <div className="border-line-strong/60 relative mx-auto max-w-5xl overflow-hidden rounded-lg border-2 border-dashed bg-bg p-6 shadow-paper md:p-8">
          {/* Postcard Label badge */}
          <div className="absolute left-4 top-4 font-hand text-hand-s text-green opacity-60">
            лицьова сторона
          </div>

          <div className="mt-6 grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto]">
            <div className="flex flex-col items-center justify-center gap-4 text-center md:items-start md:text-left">
              {/* Detailed SVG Architectural sketch of the school building */}
              <div className="w-full max-w-[400px] md:max-w-[460px]">
                <svg
                  viewBox="0 0 460 240"
                  className="h-auto w-full select-none text-ink opacity-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Detailed building lines */}
                  <rect x="40" y="80" width="380" height="110" />
                  <line x1="40" y1="120" x2="420" y2="120" />
                  <line x1="40" y1="160" x2="420" y2="160" />
                  {/* Windows columns */}
                  <line x1="80" y1="80" x2="80" y2="190" />
                  <line x1="120" y1="80" x2="120" y2="190" />
                  <line x1="160" y1="80" x2="160" y2="190" />
                  <line x1="200" y1="80" x2="200" y2="190" />
                  <line x1="240" y1="80" x2="240" y2="190" />
                  <line x1="280" y1="80" x2="280" y2="190" />
                  <line x1="320" y1="80" x2="320" y2="190" />
                  <line x1="360" y1="80" x2="360" y2="190" />
                  <line x1="400" y1="80" x2="400" y2="190" />
                  {/* Entrance porch */}
                  <rect x="215" y="150" width="30" height="40" fill="#fafaf7" />
                  <line x1="215" y1="150" x2="230" y2="135" />
                  <line x1="245" y1="150" x2="230" y2="135" />
                  {/* Burgundy flag marker */}
                  <path
                    d="M 230,135 L 230,115 L 240,120 L 230,125 Z"
                    fill="var(--c-burgundy)"
                    stroke="var(--c-burgundy)"
                  />
                  {/* Left trees */}
                  <path d="M 30,190 Q 20,150 35,130 Q 50,110 30,90 Q 15,120 20,150 Z" />
                  <path d="M 30,190 L 30,140" />
                  <line x1="20" y1="190" x2="440" y2="190" />
                </svg>
              </div>

              {/* Sub-caption */}
              <p className="mt-2 max-w-sm font-hand text-hand-s italic text-green">
                ── корпус старшої школи · проспект Оболонський, 12в ──
              </p>
            </div>

            {/* Circle Seal EST 1957 */}
            <div className="flex items-center justify-center">
              <Stamp
                text="EST. 1957"
                shape="circle"
                rotation={-10}
                size={110}
                animateOn="scroll"
                className="text-burgundy"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* --- PUNCH-HOLE PERFORATION DIVIDER (SEAM) --- */}
      <div className="relative my-10 flex h-6 w-full items-center justify-between overflow-hidden bg-bg-warm py-2 shadow-sm">
        <div className="border-line-strong/40 absolute inset-x-0 h-[1.5px] border-t border-dashed" />
        <div className="z-10 flex w-full justify-around px-4">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className="border-line-strong/20 h-3 w-3 rounded-full border bg-bg shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)]"
            />
          ))}
        </div>
      </div>

      {/* --- POSTCARD BACK SIDE --- */}
      <Container className="relative z-10 mt-12 pb-12">
        <div className="border-line-strong/60 bg-bg-warm/70 relative mx-auto max-w-5xl overflow-hidden rounded-lg border-2 border-dashed p-6 shadow-paper md:p-8">
          {/* Postcard Label badge */}
          <div className="absolute left-4 top-4 font-hand text-hand-s text-green opacity-60">
            зворотна сторона
          </div>

          <div className="relative grid grid-cols-1 gap-12 pt-6 lg:grid-cols-2">
            {/* Vertical Seam Line for desktop */}
            <div className="border-line-strong/60 absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 border-l-[1.5px] border-dashed lg:block" />

            {/* LEFT HALF — Handwritten letter */}
            <div className="space-y-5 pr-0 font-hand text-hand-s leading-relaxed text-ink lg:pr-8">
              <p className="text-[14px] text-ink-soft opacity-70">Київ · 20 травня 2026</p>
              <p className="-rotate-1 text-hand-m font-bold text-burgundy">Дорогий друже,</p>
              <p className="text-[18px]">
                ми пишемо тобі з Майстерні 157. Тут, на проспекті Оболонському,{" "}
                <span className="relative inline-block px-1">
                  1351 учень
                  <span className="bg-green/30 absolute bottom-[-1px] left-0 h-[3px] w-full rounded-full" />
                </span>{" "}
                щодня щось створює.
              </p>
              <p className="text-[18px]">
                Хтось пише вірші, хтось ліпить чашки, хтось знімає на плівку. Усе, що бачиш на цьому
                сайті —{" "}
                <span className="relative inline-block px-1">
                  насправді існує
                  <span className="bg-green/30 absolute bottom-[-1px] left-0 h-[3px] w-full rounded-full" />
                </span>
                . Можна прийти, поторкати, зустрітись із автором.
              </p>
              <p className="text-[18px]">Заходь, коли матимеш час. Завжди радо приймаємо.</p>
              <div className="pt-2">
                <span className="text-[18px]">З Любов&apos;ю —</span>
                <br />
                <span className="mt-1 block font-display text-[20px] font-bold italic text-burgundy">
                  команда Ліцею №157
                </span>
              </div>

              {/* Director signature overlay */}
              <div className="relative mt-8 w-60 pt-4">
                <div className="absolute left-6 top-[-10px] -rotate-2 select-none font-hand text-[28px] italic text-burgundy opacity-95">
                  О. Поляновська
                </div>
                <div className="bg-ink/40 h-[1px] w-full" />
                <div className="mt-1.5 font-body text-[11px] uppercase tracking-wider text-ink-soft">
                  Олена Поляновська, директорка ліцею
                </div>
              </div>

              {/* Collapsible shortcuts */}
              <div className="pt-8">
                <button
                  onClick={() => setIsSectionsOpen(!isSectionsOpen)}
                  className="group flex items-center gap-2 font-hand text-hand-s text-green transition-colors hover:text-burgundy focus:outline-none"
                >
                  <span className="font-bold">
                    {isSectionsOpen ? "↓ згорнути зміст" : "→ обери розділ:"}
                  </span>
                  <span className="font-body text-[9px] uppercase tracking-widest text-ink-fade">
                    ({isSectionsOpen ? "сховати" : "розгорнути"})
                  </span>
                </button>

                <div
                  className={cn(
                    "grid gap-x-4 gap-y-2 overflow-hidden transition-all duration-d4 ease-paper",
                    isSectionsOpen
                      ? "mt-4 max-h-40 grid-cols-2 opacity-100 md:grid-cols-3"
                      : "max-h-0 opacity-0",
                  )}
                >
                  <Link
                    href="/catalog"
                    className="group relative text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
                  >
                    Каталог
                    <span className="absolute bottom-[-1px] left-0 h-[1.5px] w-0 bg-burgundy transition-all duration-d2 group-hover:w-full" />
                  </Link>
                  <Link
                    href="/authors/all"
                    className="group relative text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
                  >
                    Автори
                    <span className="absolute bottom-[-1px] left-0 h-[1.5px] w-0 bg-burgundy transition-all duration-d2 group-hover:w-full" />
                  </Link>
                  <Link
                    href="/collections"
                    className="group relative text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
                  >
                    Колекції
                    <span className="absolute bottom-[-1px] left-0 h-[1.5px] w-0 bg-burgundy transition-all duration-d2 group-hover:w-full" />
                  </Link>
                  <Link
                    href="/about"
                    className="group relative text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
                  >
                    Про проєкт
                    <span className="absolute bottom-[-1px] left-0 h-[1.5px] w-0 bg-burgundy transition-all duration-d2 group-hover:w-full" />
                  </Link>
                  <Link
                    href="/contacts"
                    className="group relative text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
                  >
                    Контакти
                    <span className="absolute bottom-[-1px] left-0 h-[1.5px] w-0 bg-burgundy transition-all duration-d2 group-hover:w-full" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT HALF — Postage Stamp, overlapping seals, addresses, socials */}
            <div className="flex flex-col items-start gap-8 pl-0 lg:items-end lg:pl-8">
              {/* Postage Stamp & Dual Wax Seals container */}
              <div className="relative flex w-full items-start justify-between gap-4">
                {/* Overlapping wax seals */}
                <div className="relative mt-4 flex select-none gap-2">
                  <Stamp
                    text="АРХІВ ЛІЦЕЮ 157"
                    shape="octagon"
                    rotation={-8}
                    size={84}
                    animateOn="scroll"
                    className="cursor-pointer text-burgundy opacity-90 transition-transform hover:scale-105"
                  />
                  <Stamp
                    text="ПЕРЕДАНО З ОБОЛОНІ"
                    shape="circle"
                    rotation={5}
                    size={80}
                    animateOn="scroll"
                    className="-ml-8 mt-4 cursor-pointer text-ink opacity-80 transition-transform hover:scale-105"
                  />
                </div>

                {/* Main Postage Stamp with hover peel */}
                <PostageStamp className="-rotate-3 cursor-pointer shadow-photo transition-transform duration-d3 hover:-translate-y-1 hover:rotate-0" />
              </div>

              {/* Thin divisor line */}
              <div className="bg-line-strong/30 h-[1px] w-full" />

              {/* Museum Label styled Addresses */}
              <div className="flex w-full flex-col gap-6 text-left font-body lg:text-right">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-burgundy">
                    ПОЧАТКОВІ КЛАСИ
                  </span>
                  <p className="group mt-1 flex cursor-pointer items-center justify-start gap-1 text-sm font-semibold text-ink transition-colors hover:text-burgundy lg:justify-end">
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                    <span>пр. Володимира Івасюка, 23а</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-soft opacity-80">
                    +38 (044) 418-39-20 · +38 (044) 464-80-47
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-burgundy">
                    СТАРШІ КЛАСИ
                  </span>
                  <p className="group mt-1 flex cursor-pointer items-center justify-start gap-1 text-sm font-semibold text-ink transition-colors hover:text-burgundy lg:justify-end">
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                    <span>пр. Оболонський, 12в</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-soft opacity-80">
                    +38 (044) 418-75-08 · obolon_157@i.ua
                  </p>
                </div>
              </div>

              {/* Social Channels */}
              <div className="mt-4 flex w-full flex-col items-start gap-3 lg:items-end">
                <span className="-rotate-1 font-hand text-hand-s text-green">знайди нас тут</span>
                <div className="flex gap-3">
                  {["facebook", "youtube", "instagram", "telegram"].map((soc) => (
                    <a
                      key={soc}
                      href={`https://${soc}.com`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-burgundy bg-transparent text-burgundy transition-all duration-d2 hover:-translate-y-1 hover:bg-burgundy hover:text-white hover:shadow-paper focus:outline-none"
                      aria-label={soc}
                    >
                      <SocialIcon name={soc} />
                    </a>
                  ))}
                </div>

                {/* Footnote Easter Egg Clover */}
                <div className="mt-4 flex select-none items-center gap-1 font-body text-[10px] text-ink-fade transition-colors hover:text-green">
                  <span>лизни марку — на удачу</span>
                  <svg
                    className="h-3.5 w-3.5 animate-pulse text-green"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C11.5 2 11 2.5 11 3C11 3.5 11.5 4 12 4C14.2 4 16 5.8 16 8C16 8.5 16.5 9 17 9C17.5 9 18 8.5 18 8C18 4.7 15.3 2 12 2M12 22C12.5 22 13 21.5 13 21C13 20.5 12.5 20 12 20C9.8 20 8 18.2 8 16C8 15.5 7.5 15 7 15C6.5 15 6 15.5 6 16C6 19.3 8.7 22 12 22M16 16C16.5 16 17 15.5 17 15C17 14.5 16.5 14 16 14C13.8 14 12 12.2 12 10C12 9.5 11.5 9 11 9C10.5 9 10 9.5 10 10C10 13.3 12.7 16 16 16M8 8C8 7.5 7.5 7 7 7C6.5 7 6 7.5 6 8C6 10.2 7.8 12 10 12C10.5 12 11 11.5 11 11C11 10.5 10.5 10 10 10C8.9 10 8 9.1 8 8Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* --- COPYRIGHT BAR --- */}
      <div className="border-ink/10 relative z-10 mt-12 border-t bg-bg-noir py-6 text-white">
        <Container>
          <div className="text-bg-warm/85 flex flex-col items-center justify-between gap-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] md:flex-row">
            <div className="flex items-center justify-center gap-2">
              <span className="font-body text-xs text-burgundy-soft">★</span>
              <span>© ЛІЦЕЙ 157 · ПЛАТФОРМА РОЗВИТКУ · 2026</span>
            </div>
            <div className="hidden h-4 w-[1.5px] bg-white/20 md:block" />
            <span>ЗРОБЛЕНО В КЛАСІ №14 КОРПУС «ОБОЛОНЬ»</span>
            <div className="hidden h-4 w-[1.5px] bg-white/20 md:block" />
            <div className="flex items-center justify-center gap-2">
              <span>ПЕЧАТКА №47/2026</span>
              <span className="font-body text-xs text-burgundy-soft">★</span>
            </div>
          </div>
          <div className="mt-4 select-none text-center font-body text-[9px] uppercase tracking-[0.2em] text-white/30">
            ★ made by Lyceum 157 archive team · 2026
          </div>
        </Container>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  switch (name) {
    case "facebook":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    case "youtube":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.54a29 29 0 0 0 .46 5.12 2.78 2.78 0 0 0 1.95 1.96c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.12 29 29 0 0 0-.46-5.12z" />
          <polygon points="9.75 15.02 15.5 11.54 9.75 8.06 9.75 15.02" fill="currentColor" />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case "telegram":
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    default:
      return null;
  }
}
