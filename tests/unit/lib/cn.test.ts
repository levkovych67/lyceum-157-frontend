import { describe, it, expect } from "vitest";
import { cn } from "@/shared/lib/cn";

describe("cn", () => {
  it("merges class names", () => expect(cn("a", "b")).toBe("a b"));
  it("dedupes tailwind conflicts", () => expect(cn("p-2", "p-4")).toBe("p-4"));
  it("filters falsy", () => expect(cn("a", false, undefined, "b")).toBe("a b"));
});
