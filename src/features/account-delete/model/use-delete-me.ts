"use client";
import { useMutation } from "@tanstack/react-query";
import { setSnapshot } from "@/shared/api";
import { deleteMyAccount } from "@/shared/api/generated/user-account/user-account";
export function useDeleteMe() {
  return useMutation({
    mutationFn: () => deleteMyAccount({ headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: () => {
      setSnapshot(null);
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* noop */
      }
      window.location.href = "/";
    },
  });
}
