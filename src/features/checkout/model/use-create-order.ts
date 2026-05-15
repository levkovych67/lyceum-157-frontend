"use client";
import { useMutation } from "@tanstack/react-query";
import { create1 as createOrder } from "@/shared/api/generated/orders/orders";
import {
  type CreateOrderRequest,
  type OrderCreationResponse,
  ApiError,
  clearCheckoutIdempotencyKey,
  rotateCheckoutIdempotencyKey,
  useCheckoutIdempotencyKey,
} from "@/shared/api";

async function createOrderSafe(
  body: CreateOrderRequest,
  initialKey: string,
): Promise<OrderCreationResponse> {
  try {
    return await createOrder(body, { headers: { "Idempotency-Key": initialKey } });
  } catch (e) {
    if (e instanceof ApiError && e.problem.type === "urn:l157:order/idem-conflict") {
      // Idempotency-Key collision (BE rejected reuse) — rotate and retry once.
      const fresh = rotateCheckoutIdempotencyKey();
      return createOrder(body, { headers: { "Idempotency-Key": fresh } });
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
