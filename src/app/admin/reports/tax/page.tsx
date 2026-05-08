import { AdminTaxReportScreen } from "@/views/admin-tax-report";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";
export default function Page() {
  return (
    <WidgetErrorBoundary label="Податковий звіт">
      <AdminTaxReportScreen />
    </WidgetErrorBoundary>
  );
}
