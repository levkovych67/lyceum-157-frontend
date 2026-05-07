"use client";
import { useEffect, useState, type RefObject } from "react";

type Opts = { threshold?: number; rootMargin?: string; once?: boolean };

export function useIntersection(ref: RefObject<Element>, opts: Opts = {}): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setSeen(true);
          if (opts.once ?? true) obs.disconnect();
        } else if (!opts.once) {
          setSeen(false);
        }
      },
      { threshold: opts.threshold ?? 0.4, rootMargin: opts.rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, opts.threshold, opts.rootMargin, opts.once]);
  return seen;
}
