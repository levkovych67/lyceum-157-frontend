import { describe, it, expect } from "vitest";
import { hash } from "@/shared/lib/hash";

describe("hash", () => {
  it("deterministic for same logical object", () => {
    expect(hash({ x: 1, y: [1, 2] })).toBe(hash({ y: [1, 2], x: 1 }));
  });
  it("differs on content change", () => {
    expect(hash({ a: 1 })).not.toBe(hash({ a: 2 }));
  });
});
