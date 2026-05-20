import { describe, it, expect } from "vitest";
import { toneForPath } from "@/widgets/header/header-tone";

describe("toneForPath", () => {
  it("returns dark for the catalog (full-bleed photo hero)", () => {
    expect(toneForPath("/catalog")).toBe("dark");
    expect(toneForPath("/catalog/anything")).toBe("dark");
  });

  it("returns dark for the authors listing (dark portrait wall)", () => {
    expect(toneForPath("/authors/all")).toBe("dark");
  });

  it("returns light for an individual author profile", () => {
    expect(toneForPath("/authors/student-olena")).toBe("light");
  });

  it("returns light for light-toned pages", () => {
    expect(toneForPath("/")).toBe("light");
    expect(toneForPath("/about")).toBe("light");
    expect(toneForPath("/collections")).toBe("light");
    expect(toneForPath("/contacts")).toBe("light");
  });
});
