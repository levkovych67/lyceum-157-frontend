import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EditorialDivider } from "@/shared/ui/editorial-divider";

describe("EditorialDivider", () => {
  it("варіант 'marks' не додає власних вертикальних відступів", () => {
    const { container } = render(<EditorialDivider variant="marks" />);
    expect(container.firstElementChild!.className).not.toMatch(/\bpy-4\b/);
  });

  it("варіант 'number' не додає власних вертикальних відступів", () => {
    const { container } = render(<EditorialDivider variant="number" number={3} />);
    expect(container.firstElementChild!.className).not.toMatch(/\bpy-4\b/);
  });

  it("дефолтний 'dashed' рендерить hr", () => {
    const { container } = render(<EditorialDivider />);
    expect(container.firstElementChild!.tagName).toBe("HR");
  });
});
