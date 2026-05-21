import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginForm } from "@/features/auth";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrap = (ui: React.ReactNode) => (
  <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
);

describe("LoginForm", () => {
  it("validates email and password client-side", async () => {
    render(wrap(<LoginForm />));
    await userEvent.click(screen.getByRole("button", { name: /Увійти/ }));
    await waitFor(() => {
      expect(screen.getByText(/Вкажіть email/)).toBeInTheDocument();
      expect(screen.getByText(/Вкажіть пароль/)).toBeInTheDocument();
    });
  });
});
