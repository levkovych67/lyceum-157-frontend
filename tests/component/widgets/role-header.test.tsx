import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { RoleHeader } from "@/widgets/role-section-shell/role-header";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

describe("RoleHeader", () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue("/student");
  });

  it("рендерить пункти навігації учня", () => {
    render(<RoleHeader role="student" />);
    for (const label of ["Панель", "Мої роботи", "Фінанси"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.queryByRole("link", { name: "Модерація" })).toBeNull();
  });

  it("рендерить пункти навігації адміна", () => {
    vi.mocked(usePathname).mockReturnValue("/admin");
    render(<RoleHeader role="admin" />);
    for (const label of ["Модерація", "Виплати", "Звіти", "2FA"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("посилання «На сайт» веде на головну", () => {
    render(<RoleHeader role="student" />);
    expect(screen.getByRole("link", { name: /На сайт/ })).toHaveAttribute("href", "/");
  });

  it("позначає активний підрозділ через aria-current, але не корінь", () => {
    vi.mocked(usePathname).mockReturnValue("/student/products");
    render(<RoleHeader role="student" />);
    expect(screen.getByRole("link", { name: "Мої роботи" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Панель" })).not.toHaveAttribute("aria-current");
  });
});
