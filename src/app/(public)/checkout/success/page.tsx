import type { Metadata } from "next";
import { CheckoutSuccessScreen } from "@/views/checkout-success";

export const metadata: Metadata = {
  title: "Замовлення прийнято",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page({ searchParams }: { searchParams: { orderId?: string } }) {
  return <CheckoutSuccessScreen orderId={searchParams.orderId} />;
}
