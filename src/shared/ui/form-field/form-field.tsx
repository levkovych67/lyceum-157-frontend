"use client";
import { cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/shared/lib";
import { EditorialLabel } from "@/shared/ui/editorial-label";

export type FormFieldProps = {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactElement;
  className?: string;
};

export function FormField({
  name,
  label,
  hint,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  const id = name;
  const errorId = `err-${name}`;
  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        name,
        "aria-invalid": !!error || undefined,
        "aria-describedby": error ? errorId : undefined,
      })
    : children;
  return (
    <div id={`field-${name}`} className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block">
        <EditorialLabel as="span" color="burgundy">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </EditorialLabel>
      </label>
      {child}
      {error ? (
        <p id={errorId} className="text-small text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="text-small text-ink-fade">{hint}</p>
      ) : null}
    </div>
  );
}
