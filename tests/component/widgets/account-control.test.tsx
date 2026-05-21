import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setSnapshot } from "@/shared/api/auth-token";
import { getMe } from "@/shared/api/generated/user-account/user-account";
import { AccountControl } from "@/widgets/header/account-control";

vi.mock("@/shared/api/generated/user-account/user-account", () => ({
  getMe: vi.fn(),
}));

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("AccountControl", () => {
  beforeEach(() => {
    setSnapshot(null);
    vi.mocked(getMe).mockReset();
  });

  it("незалогінений → іконка-посилання на кабінет, без монограми", () => {
    wrap(<AccountControl dark={false} />);
    expect(screen.getByRole("link", { name: "Кабінет" })).toBeInTheDocument();
    expect(screen.queryByText("О")).toBeNull();
  });

  it("залогінений → монограма з першою літерою імені", async () => {
    setSnapshot({
      accessToken: "t",
      userId: "u",
      role: "STUDENT",
      expiresAt: Date.now() + 1_000_000,
    });
    vi.mocked(getMe).mockResolvedValue({ firstName: "Олег" });
    wrap(<AccountControl dark={false} />);
    expect(await screen.findByText("О")).toBeInTheDocument();
  });
});
