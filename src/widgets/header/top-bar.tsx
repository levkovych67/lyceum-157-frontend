"use client";
import { Stamp } from "@/shared/ui";

export function TopBar() {
  return (
    <div className="hidden h-9 items-center justify-center gap-4 bg-bg-noir px-5 text-[11px] uppercase tracking-[0.14em] text-white md:flex">
      <span>КИЇВ · ОБОЛОНЬ</span>
      <Stamp
        text="АРХІВ ЛІЦЕЮ 157"
        shape="octagon"
        rotation={-3}
        size={28}
        animateOn="none"
        smudge={false}
      />
      <span>ВИПУСК №47 · ТРАВЕНЬ 2026</span>
    </div>
  );
}
