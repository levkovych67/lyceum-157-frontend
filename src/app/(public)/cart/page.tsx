import { CartScreen } from "@/views/cart";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";
export default function Page() {
  return (
    <WidgetErrorBoundary label="Кошик">
      <CartScreen />
    </WidgetErrorBoundary>
  );
}
