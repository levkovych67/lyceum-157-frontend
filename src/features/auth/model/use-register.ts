"use client";
import { useMutation } from "@tanstack/react-query";
import { register } from "@/shared/api/generated/auth/auth";
import type { RegisterRequest } from "@/shared/api";

export function useRegister() {
  return useMutation({ mutationFn: (b: RegisterRequest) => register(b) });
}
