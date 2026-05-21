import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setSnapshot } from "@/shared/api/auth-token";
import { getMe } from "@/shared/api/generated/user-account/user-account";
import { DrawerAccount } from "@/widgets/header/drawer-account";

vi.mock("@/shared/api/generated/user-account/user-account", () => ({
  getMe: vi.fn(),
}));

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("DrawerAccount", () => {
  beforeEach(() => {
    setSnapshot(null);
    vi.mocked(getMe).mockReset();
  });

  it("незалогінений → запрошення увійти в кабінет", () => {
    wrap(<DrawerAccount onNavigate={vi.fn()} />);
    expect(screen.getByRole("link", { name: /Увійти в кабінет/ })).toHaveAttribute(
      "href",
      "/account",
    );
  });

  it("залогінений учень → ім'я та лейбл ролі", async () => {
    setSnapshot({
      accessToken: "t",
      userId: "u",
      role: "STUDENT",
      expiresAt: Date.now() + 1_000_000,
    });
    vi.mocked(getMe).mockResolvedValue({ firstName: "Олег" });
    wrap(<DrawerAccount onNavigate={vi.fn()} />);
    expect(await screen.findByText("Олег")).toBeInTheDocument();
    expect(screen.getByText("Кабінет учня")).toBeInTheDocument();
  });
});
