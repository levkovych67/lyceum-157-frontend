"use client";
import { Stamp } from "@/shared/ui/stamp";
import { PillButton } from "@/shared/ui/pill-button";
import { uk } from "@/shared/i18n";
import { cn } from "@/shared/lib";

export type WidgetErrorFallbackProps = {
  label?: string;
  resetErrorBoundary: () => void;
  className?: string;
};

export function WidgetErrorFallback({
  label,
  resetErrorBoundary,
  className,
}: WidgetErrorFallbackProps) {
  return (
    <div
      role="alert"
      data-testid="widget-error-fallback"
      className={cn(
        "border-burgundy/40 flex flex-col items-center justify-center gap-4 rounded-[2px] border-2 border-dashed bg-bg-warm bg-paper-noise p-6",
        className,
      )}
    >
      <Stamp text={uk.errors.widgetFallbackStamp} rotation={-3} animateOn="load" />
      <p className="font-hand text-hand-s text-ink">
        {uk.errors.widgetFallbackBody} {label ?? "—"}
      </p>
      <PillButton variant="ghost" size="s" onClick={resetErrorBoundary}>
        {uk.errors.widgetReset}
      </PillButton>
    </div>
  );
}
