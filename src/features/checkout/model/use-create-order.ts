"use client";
import { useMutation } from "@tanstack/react-query";
import { ordersApi, type CreateOrderRequest } from "@/shared/api";
export function useCreateOrder() {
  return useMutation({ mutationFn: (b: CreateOrderRequest) => ordersApi.create(b) });
}
