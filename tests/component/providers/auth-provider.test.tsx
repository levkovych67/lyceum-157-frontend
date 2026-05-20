import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "@/_app/providers/auth-provider";
import { setSnapshot } from "@/shared/api/auth-token";
import { tryRefresh } from "@/shared/api/refresh";

// tryRefresh is mocked below; vi.mock is hoisted, so the import above resolves to the mock.
vi.mock("@/shared/api/refresh", () => ({
  tryRefresh: vi.fn(),
}));

function Probe() {
  const { status } = useAuth();
  return <div data-testid="status">{status}</div>;
}

describe("AuthProvider bootstrap", () => {
  beforeEach(() => {
    setSnapshot(null);
    vi.mocked(tryRefresh).mockReset();
  });

  it("goes loading -> authenticated when the bootstrap refresh succeeds", async () => {
    vi.mocked(tryRefresh).mockImplementation(async () => {
      setSnapshot({
        accessToken: "t",
        userId: "u",
        role: "STUDENT",
        expiresAt: Date.now() + 1_000_000,
      });
      return { ok: true };
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
  });

  it("goes loading -> unauthenticated when the bootstrap refresh fails", async () => {
    vi.mocked(tryRefresh).mockResolvedValue({ ok: false, reason: "expired" });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
  });

  it("goes loading -> authenticated without a refresh when a snapshot already exists", async () => {
    setSnapshot({
      accessToken: "t",
      userId: "u",
      role: "STUDENT",
      expiresAt: Date.now() + 1_000_000,
    });
    vi.mocked(tryRefresh).mockImplementation(() => {
      throw new Error("tryRefresh must not be called when a snapshot already exists");
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
    expect(tryRefresh).not.toHaveBeenCalled();
  });
});
