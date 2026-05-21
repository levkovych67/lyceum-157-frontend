import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { RoleSectionShell } from "@/widgets/role-section-shell";

vi.mock("next/navigation", () => ({ usePathname: () => "/student" }));

describe("RoleSectionShell", () => {
  it("монтує рольовий хедер над контентом і не лишає старого інлайн-лейбла", () => {
    render(
      <RoleSectionShell role="student">
        <p>дочірній вміст</p>
      </RoleSectionShell>,
    );
    expect(screen.getByRole("link", { name: /На сайт/ })).toBeInTheDocument();
    expect(screen.getByText("Кабінет учня")).toBeInTheDocument();
    expect(screen.getByText("дочірній вміст")).toBeInTheDocument();
    expect(screen.queryByText(/▌/)).toBeNull();
  });
});
