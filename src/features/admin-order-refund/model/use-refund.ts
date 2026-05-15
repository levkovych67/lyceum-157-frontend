"use client";
import { useMutation } from "@tanstack/react-query";
import { refund as refundOrder } from "@/shared/api/generated/admin-orders/admin-orders";

export function useRefund() {
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      refundOrder(orderId, { reason }, { headers: { "Idempotency-Key": crypto.randomUUID() } }),
  });
}
