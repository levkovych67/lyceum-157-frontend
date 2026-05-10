import type { Metadata } from "next";
import { CheckoutScreen } from "@/views/checkout";

export const metadata: Metadata = {
  title: "Оформлення замовлення",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <CheckoutScreen />;
}
