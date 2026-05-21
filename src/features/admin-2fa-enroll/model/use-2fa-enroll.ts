"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enroll, confirm } from "@/shared/api/generated/admin-2fa/admin-2fa";
import { adminKeys } from "@/shared/api/admin-keys";

/** Begins TOTP enrollment — returns QR code, secret and recovery codes. */
export function useEnroll2fa() {
  return useMutation({ mutationFn: () => enroll() });
}

/** Confirms TOTP enrollment with the first code. */
export function useConfirm2fa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      confirm({ code }, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.me() }),
  });
}
