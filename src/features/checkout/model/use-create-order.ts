"use client";
import { useMutation } from "@tanstack/react-query";
import {
  ordersApi,
  type CreateOrderRequest,
  type OrderCreationResponse,
  ApiError,
  IdempotencyConflictError,
  clearCheckoutIdempotencyKey,
  rotateCheckoutIdempotencyKey,
  useCheckoutIdempotencyKey,
} from "@/shared/api";

async function createOrderSafe(
  body: CreateOrderRequest,
  initialKey: string,
): Promise<OrderCreationResponse> {
  try {
    return await ordersApi.create(body, initialKey);
  } catch (e) {
    if (e instanceof IdempotencyConflictError) {
      const fresh = rotateCheckoutIdempotencyKey();
      return ordersApi.create(body, fresh);
    }
    if (e instanceof ApiError && e.problem.type === "urn:l157:order/idem-conflict") {
      // Дисптчер може ще не встигнути конвертувати ApiError → IdempotencyConflictError
      // (наприклад mutationFn кидає до того, як query-provider mutations.onError виконається).
      const fresh = rotateCheckoutIdempotencyKey();
      return ordersApi.create(body, fresh);
    }
    throw e;
  }
}

export function useCreateOrder() {
  const idemKey = useCheckoutIdempotencyKey();
  return useMutation({
    mutationFn: (body: CreateOrderRequest) => createOrderSafe(body, idemKey),
    onSuccess: () => clearCheckoutIdempotencyKey(),
  });
}
