import { setSnapshot } from "./auth-token";
import { API_BASE } from "./constants";
import type { Role } from "./types";

let inflight: Promise<boolean> | null = null;

export function tryRefresh(): Promise<boolean> {
  if (!inflight) {
    inflight = (async () => {
      try {
        const r = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!r.ok) {
          setSnapshot(null);
          return false;
        }
        const t = (await r.json()) as {
          accessToken: string;
          expiresIn: number;
          userId: string;
          role: Role;
        };
        setSnapshot({
          accessToken: t.accessToken,
          userId: t.userId,
          role: t.role,
          expiresAt: Date.now() + t.expiresIn * 1000,
        });
        return true;
      } catch {
        setSnapshot(null);
        return false;
      } finally {
        inflight = null;
      }
    })();
  }
  return inflight;
}

export function _resetRefreshForTest(): void {
  inflight = null;
}
