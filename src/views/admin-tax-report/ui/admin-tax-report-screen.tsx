"use client";
import { EditorialPageShell, PageStubBanner } from "@/widgets/editorial-page-shell";
import { EditorialLabel, PillButton } from "@/shared/ui";
import { downloadTaxReport, getAccessToken } from "@/shared/api";

export function AdminTaxReportScreen() {
  return (
    <EditorialPageShell>
      <EditorialLabel>4DF · ЗВІТ ПДФО</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Податковий звіт</h1>
      <PillButton
        onClick={() => {
          const token = getAccessToken();
          if (token) void downloadTaxReport("2026-01-01", "2026-12-31", token);
        }}
      >
        Завантажити CSV
      </PillButton>
      <PageStubBanner cluster="admin" />
    </EditorialPageShell>
  );
}
