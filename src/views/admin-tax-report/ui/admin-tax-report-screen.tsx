"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { download } from "@/shared/api/generated/admin-tax-report/admin-tax-report";
import { EditorialPageShell } from "@/widgets/editorial-page-shell";
import { EditorialLabel, Form, FormField, Input, PillButton, FormFooter, toast } from "@/shared/ui";

export function AdminTaxReportScreen() {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState("2026-12-31");

  const m = useMutation({
    mutationFn: (range: { from: string; to: string }) => download(range),
    onSuccess: (blob, range) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tax-report-${range.from}_${range.to}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV завантажено");
    },
  });

  return (
    <EditorialPageShell>
      <EditorialLabel>ПОДАТКОВИЙ ЗВІТ</EditorialLabel>
      <h1 className="font-display text-h1 italic text-burgundy">Експорт 4ДФ (CSV)</h1>
      <p className="text-body text-ink-soft">
        Звіт містить розшифровані РНОКПП батьків — кожне завантаження логується.
      </p>

      <Form
        className="max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (from > to) {
            toast.error("Початкова дата пізніша за кінцеву");
            return;
          }
          m.mutate({ from, to });
        }}
      >
        <FormField name="from" label="Дата від" required>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </FormField>
        <FormField name="to" label="Дата до" required>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </FormField>
        <FormFooter>
          <span />
          <PillButton type="submit" loading={m.isPending}>
            Завантажити CSV
          </PillButton>
        </FormFooter>
      </Form>
    </EditorialPageShell>
  );
}
