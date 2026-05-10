import type { Metadata } from "next";
import { CheckoutFailureScreen } from "@/views/checkout-failure";

export const metadata: Metadata = {
  title: "Помилка платежу",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function Page() {
  return <CheckoutFailureScreen />;
}
