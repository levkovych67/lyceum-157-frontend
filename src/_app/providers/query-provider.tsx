"use client";
import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError, messageFor } from "@/shared/api";
import { toast } from "@/shared/ui";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: (count, err) =>
              err instanceof ApiError ? err.isTransient && count < 2 : count < 1,
            retryDelay: (a) => Math.min(1000 * 2 ** a, 8000),
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
            onError: (err) => {
              if (err instanceof ApiError && !err.isValidation) toast.error(messageFor(err));
            },
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
