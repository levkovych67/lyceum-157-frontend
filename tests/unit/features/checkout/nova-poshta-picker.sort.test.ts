import { describe, expect, it } from "vitest";
import { __sortBranches } from "@/features/checkout/ui/nova-poshta-picker";
import type { NovaPoshtaBranchDto } from "@/shared/api/generated/models";

const mk = (type: "BRANCH" | "POSTBOX", number: string): NovaPoshtaBranchDto => ({
  ref: `ref-${type}-${number}`,
  number,
  type,
  address: `${type} ${number}`,
});

describe("__sortBranches", () => {
  it("puts BRANCH before POSTBOX", () => {
    const sorted = __sortBranches([
      mk("POSTBOX", "1"),
      mk("BRANCH", "10"),
      mk("POSTBOX", "2"),
      mk("BRANCH", "1"),
    ]);
    expect(sorted.map((b) => b.type)).toEqual(["BRANCH", "BRANCH", "POSTBOX", "POSTBOX"]);
  });

  it("sorts numerically inside same type (10 after 2)", () => {
    const sorted = __sortBranches([mk("BRANCH", "10"), mk("BRANCH", "2"), mk("BRANCH", "1")]);
    expect(sorted.map((b) => b.number)).toEqual(["1", "2", "10"]);
  });
});
