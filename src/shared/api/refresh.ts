import { setSnapshot } from "./auth-token";
import { API_BASE } from "./constants";
import type { ProblemDetail, Role } from "./types";

export type RefreshResult = { ok: true } | { ok: false; reason: "expired" | "replay" | "unknown" };

let inflight: Promise<RefreshResult> | null = null;

function reasonFromProblem(p: ProblemDetail | null): "expired" | "replay" | "unknown" {
  if (!p) return "unknown";
  if (p.type === "urn:l157:auth/refresh-replay") return "replay";
  if (p.type === "urn:l157:auth/refresh-expired") return "expired";
  return "unknown";
}

export function tryRefresh(): Promise<RefreshResult> {
  if (!inflight) {
    inflight = (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!r.ok) {
          setSnapshot(null);
          const problem = (await r.json().catch(() => null)) as ProblemDetail | null;
          return { ok: false, reason: reasonFromProblem(problem) };
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
        return { ok: true };
      } catch {
        setSnapshot(null);
        return { ok: false, reason: "unknown" };
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
