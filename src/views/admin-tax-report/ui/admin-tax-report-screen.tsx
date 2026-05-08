"use client";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, EditorialDivider, ImageSlot, PillButton } from "@/shared/ui";
import { downloadTaxReport, getAccessToken } from "@/shared/api";

export function AdminTaxReportScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>4DF · ЗВІТ ПДФО</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Податковий звіт</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <ImageSlot
          slot="admin/reports/ledger"
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
          const token = getAccessToken();
          if (token) void downloadTaxReport("2026-01-01", "2026-12-31", token);
        }}
      >
        Завантажити CSV (2026)
      </PillButton>
    </EditorialPageShell>
  );
}
