"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { ImageSlot, Stamp } from "@/shared/ui";

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
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Затемнення */}
      <div
        aria-hidden
        onClick={onClose}
        className="bg-bg-noir/50 absolute inset-0 backdrop-blur-sm"
        style={{ animation: "drawer-fade var(--d-2) var(--ease-paper) both" }}
      />

      {/* Панель */}
      <div
        className="absolute inset-y-0 left-0 flex w-[86vw] max-w-[340px] flex-col overflow-y-auto overflow-x-hidden border-r-2 border-dashed border-line-strong bg-bg-warm shadow-deep"
        style={{ animation: "drawer-in var(--d-3) var(--ease-paper) both" }}
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
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-line-strong text-ink transition-colors hover:border-burgundy hover:text-burgundy"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </div>

        {/* Індекс архіву */}
        <nav className="flex-1 px-6">
          <ul>
            {navItems.map((it, i) => (
              <li
                key={it.href}
                className="border-line-strong/60 border-b border-dashed last:border-0"
              >
                <Link
                  href={it.href}
                  onClick={onClose}
                  className="group flex items-center gap-4 py-5"
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
