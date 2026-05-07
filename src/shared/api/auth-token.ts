import type { TokenSnapshot } from "./types";

let snapshot: TokenSnapshot | null = null;
const listeners = new Set<(s: TokenSnapshot | null) => void>();

export const getAccessToken = (): string | null => snapshot?.accessToken ?? null;
export const getSnapshot = (): TokenSnapshot | null => snapshot;

export function setSnapshot(s: TokenSnapshot | null): void {
  snapshot = s;
  listeners.forEach((fn) => fn(s));
}

export function subscribe(fn: (s: TokenSnapshot | null) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
