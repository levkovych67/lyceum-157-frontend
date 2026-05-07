import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EditorialLabel } from "@/shared/ui/editorial-label";

describe("EditorialLabel", () => {
  it("renders uppercase children", () => {
    render(<EditorialLabel>Автор травня</EditorialLabel>);
    const el = screen.getByText("Автор травня");
    expect(el).toBeInTheDocument();
    expect(el.className).toMatch(/uppercase/);
  });
});
