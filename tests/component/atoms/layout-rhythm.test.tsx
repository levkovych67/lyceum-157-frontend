import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Section } from "@/shared/ui/layout/section";
import { Stack } from "@/shared/ui/layout/stack";

describe("Section pad='page'", () => {
  it("дає компактний верх і просторий низ", () => {
    const { container } = render(
      <Section pad="page">
        <p>контент</p>
      </Section>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\bpt-6\b/);
    expect(cls).toMatch(/\bpb-8\b/);
    expect(cls).toMatch(/md:pt-7/);
    expect(cls).toMatch(/md:pb-9/);
  });
});

describe("Stack gap='block'", () => {
  it("дає responsive міжблоковий ритм", () => {
    const { container } = render(
      <Stack gap="block">
        <p>a</p>
        <p>b</p>
      </Stack>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).toMatch(/\bgap-6\b/);
    expect(cls).toMatch(/md:gap-8/);
  });

  it("числовий gap працює як раніше", () => {
    const { container } = render(
      <Stack gap={4}>
        <p>a</p>
      </Stack>,
    );
    expect(container.firstElementChild!.className).toMatch(/\bgap-4\b/);
  });
});
