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
});
