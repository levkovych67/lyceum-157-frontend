import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductStatusBadge } from "@/entities/product/ui/product-status-badge";

describe("ProductStatusBadge", () => {
  it("renders the Ukrainian label for the status", () => {
    render(<ProductStatusBadge status="PENDING_REVIEW" />);
    expect(screen.getByText("На розгляді")).toBeInTheDocument();
  });
  it("exposes the status via data attribute for the tone", () => {
    render(<ProductStatusBadge status="ACTIVE" />);
    expect(screen.getByText("Активна")).toHaveAttribute("data-tone", "green");
  });
});
