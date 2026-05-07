import { hash } from "@/shared/lib/hash";

const keyName = (scope: string, body: unknown) => `idem:${scope}:${hash(body)}`;

export function getOrCreateIdemKey(scope: string, body: unknown): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  const k = keyName(scope, body);
  let id = sessionStorage.getItem(k);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(k, id);
  }
  return id;
}

export function clearIdemKey(scope: string, body: unknown): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(keyName(scope, body));
}
