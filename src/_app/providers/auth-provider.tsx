"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  subscribe,
  getSnapshot,
  setSnapshot,
  REFRESH_PROACTIVE_MS,
  type TokenSnapshot,
  type Role,
  authApi,
} from "@/shared/api";
import { tryRefresh } from "@/shared/api/refresh";

type Ctx = {
  user: TokenSnapshot | null;
  role: Role | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => null);

  useEffect(() => {
    const handler = () => {
      setSnapshot(null);
      if (typeof window !== "undefined") window.location.href = "/login";
    };
    window.addEventListener("auth:logout-required", handler);
    return () => window.removeEventListener("auth:logout-required", handler);
  }, []);

  useEffect(() => {
    if (!snap) return;
    const ms = snap.expiresAt - Date.now() - REFRESH_PROACTIVE_MS;
    if (ms <= 0) {
      void tryRefresh();
      return;
    }
    const t = setTimeout(() => {
      void tryRefresh();
    }, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap?.expiresAt]);

  const value = useMemo<Ctx>(
    () => ({
      user: snap,
      role: snap?.role ?? null,
      isAuthenticated: !!snap,
      logout: async () => {
        await authApi.logout().catch(() => {});
        setSnapshot(null);
      },
    }),
    [snap],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): Ctx {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
