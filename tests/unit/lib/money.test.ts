import { describe, it, expect } from "vitest";
import { fmtUAH, mulMoney, sumMoney } from "@/shared/lib/money";

describe("money", () => {
  it("formats UAH locale string", () => {
    expect(fmtUAH("850.00")).toMatch(/850/);
    expect(fmtUAH("850.00")).toMatch(/₴/);
  });
  it("multiplies precise (no float drift)", () => {
    expect(mulMoney("0.10", 3)).toBe("0.30");
    expect(mulMoney("19.99", 7)).toBe("139.93");
  });
  it("sums BigDecimal strings", () => {
    expect(sumMoney(["10.10", "20.20", "5.05"])).toBe("35.35");
  });
});
