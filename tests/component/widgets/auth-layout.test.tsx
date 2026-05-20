import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthLayout } from "@/widgets/auth-layout";

describe("AuthLayout", () => {
  it("renders form-column children", () => {
    render(
      <AuthLayout photoSlot="auth/login/cover" photoCaption="Cover">
        <p>form here</p>
      </AuthLayout>,
    );
    expect(screen.getByText("form here")).toBeInTheDocument();
  });

  it("places the photo before the form when photoSide is left", () => {
    render(
      <AuthLayout photoSide="left" photoSlot="auth/login/cover" photoCaption="Cover">
        <p data-testid="form">form</p>
      </AuthLayout>,
    );
    const grid = screen.getByTestId("auth-grid");
    const formCol = screen.getByTestId("form").closest("[data-auth-col]")!;
    expect(grid.firstElementChild).not.toBe(formCol);
  });

  it("places the photo after the form when photoSide is right (default)", () => {
    render(
      <AuthLayout photoSlot="auth/register/cover" photoCaption="Cover">
        <p data-testid="form">form</p>
      </AuthLayout>,
    );
    const grid = screen.getByTestId("auth-grid");
    const formCol = screen.getByTestId("form").closest("[data-auth-col]")!;
    expect(grid.firstElementChild).toBe(formCol);
  });
});
