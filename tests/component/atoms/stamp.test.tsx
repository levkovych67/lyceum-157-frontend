import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stamp } from "@/shared/ui/stamp";

describe("Stamp", () => {
  it("renders text", () => {
    render(<Stamp text="EST. 1957" animateOn="none" />);
    expect(screen.getByText("EST. 1957")).toBeInTheDocument();
  });
  it("applies rotation as inline css var", () => {
    const { container } = render(<Stamp text="EST. 1957" rotation={-12} animateOn="none" />);
    const el = container.querySelector(".stamp") as HTMLElement;
    expect(el.style.getPropertyValue("--final-rotation")).toBe("-12deg");
  });
});
