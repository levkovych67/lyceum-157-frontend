import { describe, expect, it } from "vitest";
import { CheckoutSchema } from "@/features/checkout/model/schemas";

const validDetails = {
  cityRef: "db5c8892-aaaa-0000-0000-000000000001",
  cityName: "Київ",
  branchRef: "1ec0d34e-aaaa-0000-0000-000000000005",
  branchNumber: "5",
  branchType: "BRANCH" as const,
  branchAddress: "вул. Сагайдачного, 25",
};

const validInput = {
  buyerEmail: "ivan@example.com",
  buyerName: "Іван Іванов",
  buyerPhone: "+380501234567",
  delivery: { method: "NOVA_POSHTA" as const, details: validDetails },
};

describe("CheckoutSchema with delivery", () => {
  it("accepts valid payload with delivery", () => {
    const r = CheckoutSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("rejects empty cityRef with 'Оберіть місто'", () => {
    const r = CheckoutSchema.safeParse({
      ...validInput,
      delivery: { method: "NOVA_POSHTA", details: { ...validDetails, cityRef: "" } },
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find((i) => i.path.join(".") === "delivery.details.cityRef");
      expect(issue?.message).toBe("Оберіть місто");
    }
  });

  it("rejects empty branchRef with 'Оберіть відділення або поштомат'", () => {
    const r = CheckoutSchema.safeParse({
      ...validInput,
      delivery: { method: "NOVA_POSHTA", details: { ...validDetails, branchRef: "" } },
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const issue = r.error.issues.find((i) => i.path.join(".") === "delivery.details.branchRef");
      expect(issue?.message).toBe("Оберіть відділення або поштомат");
    }
  });

  it("rejects invalid branchType enum", () => {
    const r = CheckoutSchema.safeParse({
      ...validInput,
      delivery: {
        method: "NOVA_POSHTA",
        details: { ...validDetails, branchType: "FOO" as unknown as "BRANCH" },
      },
    });
    expect(r.success).toBe(false);
  });

  it("requires delivery block (not optional)", () => {
    const { delivery: _unused, ...rest } = validInput;
    const r = CheckoutSchema.safeParse(rest);
    expect(r.success).toBe(false);
  });
});
