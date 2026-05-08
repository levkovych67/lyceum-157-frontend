"use client";
import { type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { WidgetErrorFallback } from "./widget-error-fallback";

export type WidgetErrorBoundaryProps = {
  children: ReactNode;
  label?: string;
  fallback?: ReactNode;
  resetKeys?: unknown[];
  onError?: (error: Error, info: { componentStack?: string | null }) => void;
};

export function WidgetErrorBoundary({
  children,
  label,
  fallback,
  resetKeys,
  onError,
}: WidgetErrorBoundaryProps) {
  if (fallback !== undefined) {
    return (
      <ErrorBoundary
        fallback={<>{fallback}</>}
        resetKeys={resetKeys as unknown[] | undefined}
        onError={onError}
      >
        {children}
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary
      fallbackRender={({ resetErrorBoundary }) => (
        <WidgetErrorFallback label={label} resetErrorBoundary={resetErrorBoundary} />
      )}
      resetKeys={resetKeys as unknown[] | undefined}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
}
