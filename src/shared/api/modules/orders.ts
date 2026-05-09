import { api } from "@/shared/api/client";

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
  create: (body: CreateOrderRequest, idemKey: string) =>
    api<OrderCreationResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(body),
      idemKey,
      auth: false,
    }),
};
