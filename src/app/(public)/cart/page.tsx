import type { Metadata } from "next";
import { CartScreen } from "@/views/cart";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";

export const metadata: Metadata = {
  title: "Кошик",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <WidgetErrorBoundary label="Кошик">
      <CartScreen />
    </WidgetErrorBoundary>
  );
}
