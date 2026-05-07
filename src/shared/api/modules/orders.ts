import { api } from "@/shared/api/client";
import { getOrCreateIdemKey } from "@/shared/api/idempotency";

export type CreateOrderRequest = {
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  items: Array<{ productId: string; quantity: number }>;
};

export type OrderCreationResponse = {
  orderId: string;
  orderNumber: string;
  totalAmount: string;
  status: "PENDING_PAYMENT";
  paymentUrl: string;
};

export const ordersApi = {
  create: (body: CreateOrderRequest) => {
    const idemKey = getOrCreateIdemKey("orders.create", body);
    return api<OrderCreationResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(body),
      idemKey,
      auth: false,
    });
  },
};
