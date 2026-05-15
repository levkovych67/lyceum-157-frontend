"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, PillButton } from "@/shared/ui";
import { download as downloadTaxReport } from "@/shared/api/generated/admin-tax-report/admin-tax-report";

async function downloadCsv(from: string, to: string) {
  const blob = await downloadTaxReport({ from, to });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `4DF_${from}_${to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminTaxReportScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>4DF · ЗВІТ ПДФО</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Податковий звіт</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <ImageSlot
          slot="admin/reports/ledger"
          src="/images/admin/reports/ledger.png"
          ratio="4/5"
          variant="photo-print"
          caption="Книга реєстрації"
          className="md:w-56"
        />
        <p className="max-w-prose text-body text-ink-soft">
          FRONTEND-API §3.12 — експорт CSV за діапазоном дат. Поки що лежить демо-кнопка з
          фіксованим діапазоном на 2026 рік. Форма з date-range зʼявиться тут.
        </p>
      </div>
      <EditorialDivider />
      <PillButton
        onClick={() => {
          void downloadCsv("2026-01-01", "2026-12-31");
        }}
      >
        Завантажити CSV (2026)
      </PillButton>
    </EditorialPageShell>
  );
}
