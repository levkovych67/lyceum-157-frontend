"use client";
import type { FieldErrors } from "react-hook-form";

export function FormErrorSummary({
  errors,
  fieldLabels,
  threshold = 3,
}: {
  errors: FieldErrors;
  fieldLabels: Record<string, string>;
  threshold?: number;
}) {
  const list = Object.keys(errors);
  if (list.length < threshold) return null;
  return (
    <div role="alert" className="bg-error/5 rounded-md border-l-4 border-error p-4">
      <p className="text-label text-error">▌ ПОТРІБНО ВИПРАВИТИ</p>
      <ul className="mt-2 space-y-1 text-small">
        {list.map((name) => (
          <li key={name}>
            <a
              href={`#field-${name}`}
              className="text-burgundy underline underline-offset-2 hover:text-burgundy-deep"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(`field-${name}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
                document.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();
              }}
            >
              {fieldLabels[name] ?? name}: {String(errors[name]?.message ?? "невалідно")}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
