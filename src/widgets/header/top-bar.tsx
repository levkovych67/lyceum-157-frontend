"use client";
import { Stamp } from "@/shared/ui";

export function TopBar() {
  return (
    <div className="hidden h-9 items-center justify-between bg-bg-noir px-8 text-[11px] uppercase tracking-[0.14em] text-white md:flex">
      <span className="font-body opacity-80">КИЇВ · ОБОЛОНЬ</span>
      <div className="flex items-center gap-3">
        <div className="relative -mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-white p-0.5 shadow-paper">
          <Stamp
            text="1957"
            shape="octagon"
            rotation={-5}
            size={22}
            animateOn="none"
            smudge={false}
            className="text-burgundy"
          />
        </div>
        <span className="font-body font-bold tracking-[0.2em] text-white">АРХІВ ЛІЦЕЮ 157</span>
      </div>
      <span className="font-body opacity-80">ВИПУСК №47 · ТРАВЕНЬ 2026</span>
    </div>
  );
}
