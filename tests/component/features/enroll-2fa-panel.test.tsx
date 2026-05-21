import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Enroll2faPanel } from "@/features/admin-2fa-enroll/ui/enroll-2fa-panel";

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("Enroll2faPanel", () => {
  it("shows the enroll call-to-action before enrollment starts", () => {
    wrap(<Enroll2faPanel />);
    expect(screen.getByRole("button", { name: /Почати enroll/ })).toBeInTheDocument();
  });
});
