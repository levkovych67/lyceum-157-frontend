"use client";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/shared/api";
export function useRefund() {
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      adminApi.orders.refund(orderId, reason),
  });
}
