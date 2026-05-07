"use client";
import { useMutation } from "@tanstack/react-query";
import { userApi, setSnapshot } from "@/shared/api";
export function useDeleteMe() {
  return useMutation({
    mutationFn: () => userApi.deleteMe(),
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
