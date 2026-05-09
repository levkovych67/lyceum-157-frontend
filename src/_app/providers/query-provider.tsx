"use client";
import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ApiError, dispatchProblem, IdempotencyConflictError } from "@/shared/api";

export function QueryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const [client] = useState(() => {
    // eslint-disable-next-line prefer-const
    let qc!: QueryClient;
    qc = new QueryClient({
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
            if (err instanceof IdempotencyConflictError) return;
            if (err instanceof ApiError) {
              dispatchProblem(err.problem, { queryClient: qc, router: routerRef.current });
            }
          },
        },
      },
    });
    return qc;
  });

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
