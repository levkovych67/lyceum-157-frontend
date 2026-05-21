import Link from "next/link";
import { Container, PostageStamp, Stamp } from "@/shared/ui";

const footerNav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/authors/all", label: "Автори" },
  { href: "/collections", label: "Колекції" },
  { href: "/about", label: "Про проєкт" },
  { href: "/contacts", label: "Контакти" },
];

export function Footer() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-line bg-bg pb-0 pt-12">
      {/* Watermark "1 5 7" — центрований по висоті одноблочного футера */}
      <div className="text-burgundy/5 pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 -rotate-[4deg] select-none flex-col gap-6 font-display text-[160px] font-black leading-none lg:flex">
        <span>1</span>
        <span>5</span>
        <span>7</span>
      </div>

      {/* --- POSTCARD (зворотна сторона) --- */}
      <Container className="relative z-10 pb-12">
        <div className="border-line-strong/60 bg-bg-warm/70 relative mx-auto max-w-5xl overflow-hidden rounded-lg border-2 border-dashed p-6 shadow-paper md:p-8">
          <div className="absolute left-4 top-4 font-hand text-hand-s text-green opacity-60">
            зворотна сторона
          </div>

          <div className="relative grid grid-cols-1 gap-12 pt-6 lg:grid-cols-2">
            {/* Вертикальний шов для десктопу */}
            <div className="border-line-strong/60 absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 border-l-[1.5px] border-dashed lg:block" />

            {/* ЛІВА ПОЛОВИНА — рукописний лист */}
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

              {/* Підпис директорки */}
              <div className="relative mt-8 w-60 pt-4">
                <div className="absolute left-6 top-[-10px] -rotate-2 select-none font-hand text-[28px] italic text-burgundy opacity-95">
                  О. Поляновська
                </div>
                <div className="bg-ink/40 h-[1px] w-full" />
                <div className="mt-1.5 font-body text-[11px] uppercase tracking-wider text-ink-soft">
                  Олена Поляновська, директорка ліцею
                </div>
              </div>

              {/* Навігація — завжди видима (replaces collapsible toggle) */}
              <nav className="border-line-strong/50 mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t-[1.5px] border-dashed pt-6">
                {footerNav.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    className="text-[11px] font-bold uppercase tracking-wider text-ink transition-colors hover:text-burgundy"
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* ПРАВА ПОЛОВИНА — марка, печатки, адреси, соцмережі */}
            <div className="flex flex-col items-start gap-8 pl-0 lg:items-end lg:pl-8">
              <div className="relative flex w-full items-start justify-between gap-4">
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
                <PostageStamp className="-rotate-3 cursor-pointer shadow-photo transition-transform duration-d3 hover:-translate-y-1 hover:rotate-0" />
              </div>

              <div className="bg-line-strong/30 h-[1px] w-full" />

              {/* Адреси у стилі музейної підпис-картки */}
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

              {/* Соцмережі */}
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
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* --- COPYRIGHT (один рядок) --- */}
      <div className="border-ink/10 relative z-10 mt-12 border-t bg-bg-noir py-6 text-white">
        <Container>
          <div className="text-bg-warm/85 flex flex-col items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] md:flex-row md:gap-3">
            <span className="font-body text-xs text-burgundy-soft">★</span>
            <span>© ЛІЦЕЙ 157 · ПЛАТФОРМА РОЗВИТКУ · 2026</span>
            <span className="hidden h-4 w-[1.5px] bg-white/20 md:block" />
            <span>ПЕЧАТКА №47/2026</span>
            <span className="font-body text-xs text-burgundy-soft">★</span>
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
