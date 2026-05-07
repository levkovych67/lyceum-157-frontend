import type { UseFormSetError, FieldValues, Path } from "react-hook-form";
import { ApiError } from "./errors";

export function applyApiErrorToForm<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(err instanceof ApiError) || !err.isValidation) return false;
  const params = err.problem.invalidParams ?? [];
  if (!params.length) return false;
  for (const { field, reason } of params) {
    setError(field as Path<T>, { type: "server", message: reason });
  }
  return true;
}
