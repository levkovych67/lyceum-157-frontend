import { cookies } from "next/headers";
import { API_BASE } from "./constants";
import { ApiError, fallbackProblem, type ProblemDetail } from "./errors";

export type ServerApiInit = RequestInit & { revalidate?: number; tags?: string[] };

export async function serverApi<T>(path: string, init?: ServerApiInit): Promise<T> {
  const cookie = cookies().toString();
  const r = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> | undefined),
      Cookie: cookie,
      Accept: "application/json",
    },
    next: { revalidate: init?.revalidate, tags: init?.tags },
    cache: init?.revalidate === undefined ? "no-store" : undefined,
  });
  if (r.status === 204) return undefined as T;
  if (!r.ok) {
    const p = (await r.json().catch(() => null)) as ProblemDetail | null;
    throw new ApiError(p ?? fallbackProblem(r));
  }
  return r.json() as Promise<T>;
}
