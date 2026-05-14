import { api, type ApiOptions } from "@/shared/api/client";

export const customFetch = <T>(url: string, init?: RequestInit): Promise<T> => {
  const opts: ApiOptions = {
    method: init?.method,
    headers: init?.headers as ApiOptions["headers"],
    body: init?.body as ApiOptions["body"],
    signal: init?.signal ?? undefined,
  };
  return api<T>(url, opts);
};

export default customFetch;
