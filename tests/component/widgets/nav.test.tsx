import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "@/widgets/header/nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/catalog" }));

describe("Nav", () => {
  it("рендерить чотири головні лінки навігації", () => {
    render(<Nav />);
    for (const label of ["Каталог", "Автори", "Колекції", "Про проєкт"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("позначає лінку поточного маршруту як активну", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "Каталог" }).className).toMatch(/text-burgundy/);
  });

  it("рендерить рухомий індикатор-рамку", () => {
    const { container } = render(<Nav />);
    const indicator = container.querySelector('[data-nav-indicator="true"]');
    expect(indicator).not.toBeNull();
    expect(indicator?.className).toMatch(/border-burgundy/);
  });
});
