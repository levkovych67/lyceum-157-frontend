import { AdminPayoutsScreen } from "@/views/admin-payouts";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";
export default function Page() {
  return (
    <WidgetErrorBoundary label="Виплати">
      <AdminPayoutsScreen />
    </WidgetErrorBoundary>
  );
}
