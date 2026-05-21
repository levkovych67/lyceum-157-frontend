import { describe, it, expect } from "vitest";
import { productStatusLabel, productStatusTone } from "@/entities/product/model/product-status";

describe("product-status", () => {
  it("maps every status to a Ukrainian label", () => {
    expect(productStatusLabel("DRAFT")).toBe("Чернетка");
    expect(productStatusLabel("PENDING_REVIEW")).toBe("На розгляді");
    expect(productStatusLabel("ACTIVE")).toBe("Активна");
    expect(productStatusLabel("HIDDEN")).toBe("Прихована");
    expect(productStatusLabel("REJECTED")).toBe("Відхилена");
    expect(productStatusLabel("SOLD_OUT")).toBe("Розпродано");
  });
  it("maps status to a tone", () => {
    expect(productStatusTone("ACTIVE")).toBe("green");
    expect(productStatusTone("REJECTED")).toBe("burgundy");
    expect(productStatusTone("DRAFT")).toBe("muted");
  });
});
