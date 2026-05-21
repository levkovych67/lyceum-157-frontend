"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Route-transition для сторфронту: контент сторінки проявляється
 * (fade + лагідний підйом 8px) на кожній навігації.
 *
 * `key={pathname}` ремаунтить піддерево на кожен перехід — CSS-анімація
 * `route-in` програється щоразу заново. Свідомо НЕ через `template.tsx`:
 * у Next 14.2 template у route-group ламає prerender (`e[o] is not a function`).
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-route-in">
      {children}
    </div>
  );
}
