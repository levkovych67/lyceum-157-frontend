"use client";
import { useMutation } from "@tanstack/react-query";
import { authApi, setSnapshot } from "@/shared/api";

export function useLogin() {
  return useMutation({
    mutationFn: (b: { email: string; password: string }) => authApi.login(b),
    onSuccess: (t) => {
      setSnapshot({
        accessToken: t.accessToken,
        userId: t.userId,
        role: t.role,
        expiresAt: Date.now() + t.expiresIn * 1000,
      });
    },
  });
}
