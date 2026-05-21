"use client";
import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { subscribe, getSnapshot } from "@/shared/api";
import { getMe } from "@/shared/api/generated/user-account/user-account";

export type AccountIdentity = {
  isAuthenticated: boolean;
  /** Перша літера імені (фолбек — email), uppercase; null поки не завантажено. */
  initial: string | null;
  /** Ім'я для показу (firstName ‖ email); null поки не завантажено. */
  displayName: string | null;
  role: "STUDENT" | "PARENT" | "ADMIN" | null;
};

/**
 * Ідентичність користувача для хедера. Токен-снепшот читається напряму з
 * `shared/api` (той самий external store, що його юзає AuthProvider) — бо віджети
 * за FSD не можуть імпортувати `useAuth` із шару `_app`. Ім'я тягнеться з `GET /me`.
 */
export function useAccountIdentity(): AccountIdentity {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const isAuthenticated = !!snap;
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
  });
  const firstName = me.data?.firstName?.trim() || undefined;
  const email = me.data?.email?.trim() || undefined;
  const initial = (firstName?.[0] ?? email?.[0])?.toUpperCase() ?? null;
  return {
    isAuthenticated,
    initial,
    displayName: firstName ?? email ?? null,
    role: snap?.role ?? null,
  };
}
