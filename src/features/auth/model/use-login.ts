"use client";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/shared/api/generated/auth/auth";
import { setSnapshot, type LoginRequest, type TokenResponse } from "@/shared/api";

export function useLogin() {
  return useMutation({
    mutationFn: (b: LoginRequest) => login(b) as unknown as Promise<TokenResponse>,
    onSuccess: (data) => {
      if (!data.accessToken || !data.userId || !data.role || data.expiresIn === undefined) return;
      setSnapshot({
        accessToken: data.accessToken,
        userId: data.userId,
        role: data.role,
        expiresAt: Date.now() + data.expiresIn * 1000,
      });
    },
  });
}
