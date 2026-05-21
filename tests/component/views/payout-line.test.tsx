import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PayoutLine } from "@/views/student-finance/ui/payout-line";

describe("PayoutLine", () => {
  it("renders a label and a formatted amount", () => {
    render(<PayoutLine label="Валовий продаж" amount="1000.00" />);
    expect(screen.getByText("Валовий продаж")).toBeInTheDocument();
    expect(screen.getByText(/1\s?000/)).toBeInTheDocument();
  });
  it("prefixes negative lines with a minus", () => {
    render(<PayoutLine label="ПДФО 18%" amount="180.00" negative />);
    expect(screen.getByText(/−/)).toBeInTheDocument();
  });
});
