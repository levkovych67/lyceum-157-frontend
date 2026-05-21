import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountMonogram } from "@/widgets/header/account-monogram";

describe("AccountMonogram", () => {
  it("рендерить передану літеру", () => {
    render(<AccountMonogram initial="О" />);
    expect(screen.getByText("О")).toBeInTheDocument();
  });

  it("застосовує className викликача", () => {
    render(<AccountMonogram initial="О" className="h-8 w-8" />);
    expect(screen.getByText("О").className).toMatch(/h-8/);
  });
});
