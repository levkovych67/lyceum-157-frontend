"use client";
import { useMutation } from "@tanstack/react-query";
import { submit1 } from "@/shared/api/generated/kyc-parent/kyc-parent";
import type { KycSubmitRequest } from "@/shared/api";

export function useSubmitKyc(token: string) {
  return useMutation({
    mutationFn: (b: KycSubmitRequest) =>
      submit1(b, { token }, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
  });
}
