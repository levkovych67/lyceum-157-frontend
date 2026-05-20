import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PillButton } from "@/shared/ui/pill-button";

describe("PillButton", () => {
  it("renders children", () => {
    render(<PillButton>Click</PillButton>);
    expect(screen.getByRole("button", { name: "Click" })).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const fn = vi.fn();
    render(<PillButton onClick={fn}>Hit</PillButton>);
    await userEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("disables when loading", () => {
    render(<PillButton loading>Send</PillButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("primary variant is a sharp-cornered filled block with offset shadow", () => {
    render(<PillButton>P</PillButton>); // primary = default
    const cls = screen.getByRole("button").className;
    expect(cls).toMatch(/rounded-none/);
    expect(cls).toMatch(/bg-burgundy/);
    expect(cls).toMatch(/shadow-press\b/);
    expect(cls).not.toMatch(/rounded-pill/);
  });

  it("outline-d variant is a transparent ink-contour", () => {
    render(<PillButton variant="outline-d">S</PillButton>);
    const cls = screen.getByRole("button").className;
    expect(cls).toMatch(/border-2/);
    expect(cls).toMatch(/border-burgundy/);
    expect(cls).toMatch(/bg-transparent/);
  });
});
