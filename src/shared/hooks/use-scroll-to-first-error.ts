"use client";
import { useEffect } from "react";
import type { FieldErrors, FieldValues } from "react-hook-form";

const HEADER_OFFSET = 120;

export function useScrollToFirstError<T extends FieldValues>(
  errors: FieldErrors<T>,
  isSubmitted: boolean,
): void {
  useEffect(() => {
    if (!isSubmitted || typeof window === "undefined") return;
    const firstName = Object.keys(errors)[0];
    if (!firstName) return;
    const el = document.querySelector<HTMLElement>(`[name="${firstName}"], #field-${firstName}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted, JSON.stringify(errors)]);
}
