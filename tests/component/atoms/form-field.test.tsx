import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField, Input } from "@/shared/ui/form-field";

describe("FormField", () => {
  it("links label htmlFor", () => {
    render(
      <FormField name="email" label="Email">
        <Input />
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    expect(input.id).toBe("email");
  });
  it("shows error and aria-invalid", () => {
    render(
      <FormField name="email" label="Email" error="Bad">
        <Input />
      </FormField>,
    );
    expect(screen.getByText("Bad")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });
});
