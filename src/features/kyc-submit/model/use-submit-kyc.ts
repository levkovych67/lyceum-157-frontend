"use client";
import { useMutation } from "@tanstack/react-query";
import { kycApi, type KycSubmitRequest } from "@/shared/api";
export function useSubmitKyc(token: string) {
  return useMutation({ mutationFn: (b: KycSubmitRequest) => kycApi.submit(token, b) });
}
