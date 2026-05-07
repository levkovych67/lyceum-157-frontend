import { describe, it, expect } from "vitest";
import { messageFor } from "@/shared/api/error-messages";
import { ApiError } from "@/shared/api/errors";

describe("messageFor", () => {
  it("returns uk text for 401", () => {
    const e = new ApiError({
      type: "",
      title: "x",
      status: 401,
      detail: "",
      instance: "",
      timestamp: "",
    });
    expect(messageFor(e)).toMatch(/Сесія/i);
  });
  it("falls back to title for unknown", () => {
    const e = new ApiError({
      type: "",
      title: "X",
      status: 418,
      detail: "",
      instance: "",
      timestamp: "",
    });
    expect(messageFor(e)).toBe("X");
  });
});
