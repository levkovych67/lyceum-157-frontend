import Link from "next/link";
import type { ReactNode } from "react";
import { Container, EditorialLabel, PostageStamp, Stamp } from "@/shared/ui";

const footerNav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про проєкт" },
  { href: "/contacts", label: "Контакти" },
];

const socials = ["facebook", "youtube", "instagram", "telegram"] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg pt-7 md:pt-8">
      <Container className="relative z-10">
        {/* ─── ЛИСТІВКА · зворотна сторона ─── */}
        <article className="relative -rotate-[0.4deg] overflow-hidden rounded-md border-2 border-dashed border-line-strong bg-bg-warm p-6 shadow-paper md:p-8">
          {/* кутові поштові позначки */}
          <span className="absolute left-5 top-4 font-hand text-hand-s text-green">
            зворотна сторона
          </span>
          <span className="absolute right-5 top-4 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-ink-fade">
            Київ · UA-04210
          </span>

          <div className="relative grid grid-cols-1 gap-7 pt-3 lg:grid-cols-2 lg:gap-8">
            {/* вертикальний шов листівки */}
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 top-1 hidden -translate-x-1/2 border-l border-dashed border-line-strong lg:block"
            />

            {/* ── ЛІВА ПОЛОВИНА · рукописний лист ── */}
            <div className="flex flex-col font-hand text-ink">
              <p className="font-body text-[11px] uppercase tracking-[0.16em] text-ink-fade">
                Київ · 20 травня 2026
              </p>
              <p className="mt-3 -rotate-1 text-hand-m font-bold text-burgundy">Дорогий друже,</p>

              <div className="mt-3 space-y-3 text-[18px] leading-relaxed">
                <p>
                  ми пишемо тобі з Майстерні 157. Тут, на проспекті Оболонському,{" "}
                  <Marker>1351 учень</Marker> щодня щось створює.
                </p>
                <p>
                  Хтось пише вірші, хтось ліпить чашки, хтось знімає на плівку. Усе, що ти тут бачиш
                  — <Marker>насправді існує</Marker>. Можна прийти, поторкати, зустріти автора.
                </p>
                <p>Заходь, коли матимеш час. Завжди радо приймаємо.</p>
              </div>

              <p className="mt-4 text-[18px]">
                З Любов&apos;ю —{" "}
                <span className="font-display text-[19px] font-bold italic text-burgundy">
                  команда Ліцею&nbsp;№157
                </span>
              </p>

              {/* підпис директорки */}
              <div className="relative mt-6 w-64 max-w-full pt-7 lg:mt-auto">
                <span className="absolute left-5 top-1 -rotate-2 select-none font-hand text-[26px] italic text-burgundy">
                  О. Поляновська
                </span>
                <div className="h-px w-full bg-line-strong" />
                <p className="mt-1.5 font-body text-[11px] font-semibold text-ink">
                  Олена Поляновська
                </p>
                <p className="font-body text-[11px] italic text-ink-soft">
                  директорка ліцею&nbsp;№157
                </p>
              </div>
            </div>

            {/* ── ПРАВА ПОЛОВИНА · поштова сторона ── */}
            <div className="flex flex-col gap-6 lg:items-end lg:justify-between">
              {/* марка + штемпелі — недбало прикладена трійка */}
              <div className="flex select-none items-start justify-start lg:justify-end">
                <Stamp
                  text="АРХІВ ЛІЦЕЮ 157"
                  shape="octagon"
                  rotation={-10}
                  size={66}
                  animateOn="scroll"
                  className="text-burgundy"
                />
                <Stamp
                  text="ПЕРЕДАНО З ОБОЛОНІ"
                  shape="circle"
                  rotation={8}
                  size={60}
                  animateOn="scroll"
                  className="-ml-4 mt-6 text-ink"
                />
                <PostageStamp
                  size={86}
                  className="-ml-3 -rotate-3 shadow-photo transition-transform duration-d3 ease-paper hover:-translate-y-1 hover:rotate-0"
                />
              </div>

              {/* адреси корпусів */}
              <div className="flex w-full flex-col gap-4 lg:items-end">
                <Campus
                  label="ПОЧАТКОВІ КЛАСИ"
                  addr="пр. Володимира Івасюка, 23а"
                  contact="+38 (044) 418-39-20 · +38 (044) 464-80-47"
                />
                <Campus
                  label="СТАРШІ КЛАСИ"
                  addr="пр. Оболонський, 12в"
                  contact="+38 (044) 418-75-08 · obolon_157@i.ua"
                />
              </div>

              {/* соцмережі */}
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <span className="-rotate-2 font-hand text-hand-s text-green">знайди нас тут →</span>
                <div className="flex gap-2">
                  {socials.map((soc) => (
                    <a
                      key={soc}
                      href={`https://${soc}.com`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={soc}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-burgundy text-burgundy transition-[transform,background-color,color,box-shadow] duration-d2 ease-paper hover:-translate-y-0.5 hover:bg-burgundy hover:text-white hover:shadow-paper active:scale-95"
                    >
                      <SocialIcon name={soc} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* нижній індекс — навігація */}
          <nav className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-dashed border-line-strong pt-5">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {footerNav.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  className="relative inline-block font-body text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-burgundy after:transition-transform after:duration-d2 after:ease-paper after:content-[''] hover:text-burgundy hover:after:scale-x-100"
                >
                  {it.label}
                </Link>
              ))}
            </div>
            <span className="-rotate-2 font-hand text-hand-s text-ink-soft">архів №157</span>
          </nav>
        </article>
      </Container>

      {/* ─── КОЛОФОН · поштовий штемпель ─── */}
      <div className="relative mt-7 overflow-hidden border-t border-white/10 bg-bg-noir md:mt-8">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 select-none font-display text-[132px] font-black leading-none text-white opacity-[0.05] md:block"
        >
          157
        </span>
        <Container className="relative z-10">
          <div className="flex flex-col items-center justify-center gap-1.5 py-5 text-center font-body text-[10px] font-bold uppercase tracking-[0.16em] text-bg-warm md:flex-row md:gap-3">
            <span className="hidden text-sm text-burgundy-soft md:inline">★</span>
            <span className="max-w-full">
              © Ліцей 157 <span className="hidden md:inline">· платформа розвитку </span>· 2026
            </span>
            <span className="hidden h-3 w-px bg-white/25 md:block" />
            <span className="max-w-full">печатка №47/2026</span>
            <span className="hidden text-sm text-burgundy-soft md:inline">★</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}

/** Highlighter-маркер під словом — м'яка зелена смужка позаду тексту. */
function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block px-0.5">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-[1px] z-0 h-[8px] -rotate-1 rounded-[2px] bg-green-soft"
      />
    </span>
  );
}

/** Адреса корпусу у стилі музейної підпис-картки. */
function Campus({ label, addr, contact }: { label: string; addr: string; contact: string }) {
  return (
    <div className="w-full lg:text-right">
      <EditorialLabel color="burgundy">{label}</EditorialLabel>
      <Link href="/contacts" className="group mt-1.5 flex items-baseline gap-1.5 lg:justify-end">
        <span className="font-body text-sm font-semibold text-ink transition-colors group-hover:text-burgundy">
          {addr}
        </span>
        <span className="font-body text-xs text-burgundy transition-transform duration-d2 group-hover:translate-x-1">
          ↗
        </span>
      </Link>
      <p className="mt-1 font-body text-[11px] leading-relaxed text-ink-soft">{contact}</p>
    </div>
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
