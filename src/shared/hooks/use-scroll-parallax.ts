"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Зсув у px для паралакс-ефекту: повертає `window.scrollY * speed`,
 * оновлюється у `requestAnimationFrame`. Під `prefers-reduced-motion`
 * завжди повертає `0` (рух вимкнено).
 *
 * @param speed множник швидкості (0.15 = елемент рухається на 15% скролу).
 */
export function useScrollParallax(speed = 0.2): number {
  const [offset, setOffset] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onScroll = () => {
      if (frame.current != null) return;
      frame.current = requestAnimationFrame(() => {
        setOffset(window.scrollY * speed);
        frame.current = null;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [speed]);

  return offset;
}
