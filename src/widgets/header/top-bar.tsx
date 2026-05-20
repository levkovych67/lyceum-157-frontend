"use client";
import { Stamp } from "@/shared/ui";

export function TopBar() {
  return (
    <div className="hidden h-9 items-center justify-between bg-bg-noir px-8 text-[11px] uppercase tracking-[0.14em] text-white md:flex">
      <span>КИЇВ · ОБОЛОНЬ</span>
      <div className="flex items-center gap-2">
        <Stamp
          text="1957"
          shape="octagon"
          rotation={-3}
          size={24}
          animateOn="none"
          smudge={false}
          className="text-burgundy"
        />
        <span className="font-bold tracking-widest text-white">АРХІВ ЛІЦЕЮ 157</span>
      </div>
      <span>ВИПУСК №47 · ТРАВЕНЬ 2026</span>
    </div>
  );
}
