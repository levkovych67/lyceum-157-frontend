import { describe, it, expect, vi } from "vitest";
import { applyApiErrorToForm } from "@/shared/api/api-error-to-form";
import { ApiError } from "@/shared/api/errors";

describe("applyApiErrorToForm", () => {
  it("maps invalidParams to setError, returns true", () => {
    const setError = vi.fn();
    const err = new ApiError({
      type: "",
      title: "Validation",
      status: 400,
      detail: "",
      instance: "",
      timestamp: "",
      invalidParams: [{ field: "email", reason: "Bad" }],
    });
    expect(applyApiErrorToForm(err, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith("email", { type: "server", message: "Bad" });
  });
  it("returns false for non-validation", () => {
    const setError = vi.fn();
    const err = new ApiError({
      type: "",
      title: "x",
      status: 503,
      detail: "",
      instance: "",
      timestamp: "",
    });
    expect(applyApiErrorToForm(err, setError)).toBe(false);
    expect(setError).not.toHaveBeenCalled();
  });
});
