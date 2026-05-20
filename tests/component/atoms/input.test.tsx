import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Input } from "@/shared/ui/form-field";

describe("Input", () => {
  it("defaults to the boxed variant", () => {
    const { container } = render(<Input data-testid="i" />);
    const cls = container.querySelector("input")!.className;
    expect(cls).toMatch(/rounded-md/);
    expect(cls).toMatch(/bg-bg-card/);
  });

  it("underline variant renders a bottom-rule field", () => {
    const { container } = render(<Input variant="underline" />);
    const cls = container.querySelector("input")!.className;
    expect(cls).toMatch(/border-b-\[1\.5px\]/);
    expect(cls).toMatch(/bg-transparent/);
    expect(cls).not.toMatch(/rounded-md/);
  });
});
