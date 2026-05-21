"use client";
import { useEffect, useRef, useState, type TransitionEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { ImageSlot, Stamp } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { DrawerAccount } from "./drawer-account";

/** Пункти меню — як нумерований індекс архівного випуску. */
const navItems = [
  { href: "/catalog", label: "Каталог", note: "усі учнівські роботи" },
  { href: "/authors/all", label: "Автори", note: "учні-митці ліцею" },
  { href: "/collections", label: "Колекції", note: "тематичні спецвипуски" },
  { href: "/about", label: "Про проєкт", note: "хто ми й навіщо" },
  { href: "/contacts", label: "Контакти", note: "як нас знайти" },
];

/** Мобільне меню — архівна картка «зміст випуску»: індекс + полароїд + печатка. */
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Портал у body — щоб меню не лишалось у stacking-контексті хедера
  // й малювалось над cookie-банером та рештою сторінки.
  const [mounted, setMounted] = useState(false);
  // `render` тримає панель у DOM на час exit-анімації; `shown` керує
  // open/closed-станом transition'ів. Розв'язка цих двох дає шухляді
  // анімацію закриття — без неї панель просто зникала.
  const [render, setRender] = useState(false);
  const [shown, setShown] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // prefers-reduced-motion → прибираємо stagger-затримки рядків
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Lifecycle: при open — монтуємо й через кадр вмикаємо enter-transition;
  // при close — лишаємо в DOM і чекаємо transitionend панелі (див. нижче).
  useEffect(() => {
    if (open) {
      setRender(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
  }, [open]);

  // Escape закриває — симетрично до кліку по затемненню.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !render) return null;

  // Демонтуємо лише коли панель доїхала за екран (exit завершився).
  const handlePanelTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target === panelRef.current && e.propertyName === "transform" && !open) {
      setRender(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Затемнення */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[#1a1612]/55 backdrop-blur-sm",
          "transition-opacity duration-d3 ease-paper",
          shown ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Панель — заїжджає d-3, виїжджає d-2 (exit швидший за enter) */}
      <div
        ref={panelRef}
        onTransitionEnd={handlePanelTransitionEnd}
        className={cn(
          "absolute inset-y-0 left-0 flex w-[86vw] max-w-[340px] flex-col overflow-y-auto overflow-x-hidden border-r-2 border-dashed border-line-strong bg-bg-warm shadow-deep",
          "transition-transform ease-drawer",
          shown ? "translate-x-0 duration-d3" : "-translate-x-full duration-d2",
        )}
      >
        {/* Шапка */}
        <div className="flex items-start justify-between border-b-2 border-dashed border-line-strong px-6 pb-5 pt-7">
          <div>
            <p className="-rotate-2 font-hand text-hand-m text-green">зміст випуску</p>
            <p className="mt-1.5 font-body text-[10px] uppercase tracking-[0.22em] text-ink-fade">
              Архів №47 · Травень 2026
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити меню"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-line-strong text-ink transition-[color,border-color,transform] duration-d2 ease-paper hover:border-burgundy hover:text-burgundy active:scale-90"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        {/* Блок акаунта — над індексом розділів */}
        <DrawerAccount onNavigate={onClose} />

        {/* Індекс архіву */}
        <nav className="flex-1 px-6">
          <ul>
            {navItems.map((it, i) => (
              <li
                key={it.href}
                style={{
                  transitionDelay: shown && !reduceMotion ? `${i * 45}ms` : "0ms",
                }}
                className={cn(
                  "border-line-strong/60 border-b border-dashed transition-[opacity,transform] duration-d3 ease-paper last:border-0",
                  shown ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
                )}
              >
                <Link
                  href={it.href}
                  onClick={onClose}
                  className="group flex items-center gap-4 py-5 transition-transform duration-d1 ease-paper active:scale-[0.985]"
                >
                  <span className="font-body text-[11px] font-bold tracking-[0.16em] text-burgundy">
                    0{i + 1}
                  </span>
                  <span className="h-px w-4 shrink-0 bg-line-strong" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-h3 italic leading-none text-burgundy transition-transform duration-d2 ease-paper group-hover:translate-x-1">
                      {it.label}
                    </span>
                    <span className="mt-1.5 block font-hand text-hand-s text-ink-soft">
                      {it.note}
                    </span>
                  </span>
                  <span className="font-body text-burgundy transition-transform duration-d2 ease-paper group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Підвал — полароїд + воскова печатка */}
        <div className="border-t-2 border-dashed border-line-strong px-6 pb-8 pt-6">
          <div className="flex items-end gap-5">
            <div className="rotate-[-4deg]">
              <ImageSlot
                slot="home/hero/poster-1"
                src="/images/home/hero/poster-1.webp"
                ratio="3/4"
                variant="polaroid"
                caption="З архіву Майстерні 157"
                className="w-24"
              />
            </div>
            <Stamp
              text="АРХІВ ЛІЦЕЮ 157"
              shape="octagon"
              rotation={-8}
              size={88}
              animateOn="load"
              className="text-burgundy"
            />
          </div>
          <p className="mt-6 font-body text-[10px] uppercase tracking-[0.18em] text-ink-fade">
            Київ · Оболонь · майстерня з 1957
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
