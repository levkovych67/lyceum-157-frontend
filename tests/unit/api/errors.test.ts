import { describe, it, expect } from "vitest";
import { ApiError } from "@/shared/api/errors";

describe("ApiError", () => {
  it("isValidation for 400", () => {
    const e = new ApiError({
      type: "",
      title: "",
      status: 400,
      detail: "",
      instance: "",
      timestamp: "",
    });
    expect(e.isValidation).toBe(true);
    expect(e.isUnauthorized).toBe(false);
  });
  it("isTransient for 5xx", () => {
    const e = new ApiError({
      type: "",
      title: "",
      status: 503,
      detail: "",
      instance: "",
      timestamp: "",
    });
    expect(e.isTransient).toBe(true);
  });
});
