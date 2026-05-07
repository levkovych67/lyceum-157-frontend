"use client";
import { useMutation } from "@tanstack/react-query";
import { authApi, type RegisterRequest } from "@/shared/api";
export function useRegister() {
  return useMutation({ mutationFn: (b: RegisterRequest) => authApi.register(b) });
}
