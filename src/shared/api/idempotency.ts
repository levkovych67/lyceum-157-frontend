"use client";
import { useState } from "react";

const STORAGE_KEY = "checkout.idem-key";

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStored(value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value === null) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, value);
  } catch {
    // sessionStorage unavailable (private mode, SSR-shim) — okay to ignore
  }
}

/**
 * Один Idempotency-Key на entry в checkout.
 * Persists у sessionStorage щоб витримати reload сторінки.
 */
export function useCheckoutIdempotencyKey(): string {
  const [key] = useState(() => {
    const existing = readStored();
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    writeStored(fresh);
    return fresh;
  });
  return key;
}

export function clearCheckoutIdempotencyKey(): void {
  writeStored(null);
}

/**
 * Ротація ключа після `idem-conflict`. Повертає новий UUID і записує його у storage.
 */
export function rotateCheckoutIdempotencyKey(): string {
  const fresh = crypto.randomUUID();
  writeStored(fresh);
  return fresh;
}
