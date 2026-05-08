import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WidgetErrorBoundary } from "@/shared/ui/error-boundary";

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("kaboom");
  return <div>real content</div>;
}

describe("WidgetErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <WidgetErrorBoundary label="Каталог">
        <Boom shouldThrow={false} />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText("real content")).toBeInTheDocument();
  });

  it("renders default fallback with label when child throws", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <WidgetErrorBoundary label="Каталог">
        <Boom shouldThrow />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText(/Не вдалось показати/i)).toBeInTheDocument();
    expect(screen.getByText(/Каталог/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Друкувати знову/i })).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it("calls onError prop with caught error", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();
    render(
      <WidgetErrorBoundary label="X" onError={onError}>
        <Boom shouldThrow />
      </WidgetErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    const firstCall = onError.mock.calls[0];
    expect(firstCall).toBeDefined();
    expect(firstCall![0]).toBeInstanceOf(Error);
    expect((firstCall![0] as Error).message).toBe("kaboom");
    errSpy.mockRestore();
  });

  it("reset button recovers when resetKeys change", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Wrapper() {
      const [bad, setBad] = useState(true);
      return (
        <>
          <button onClick={() => setBad(false)}>fix</button>
          <WidgetErrorBoundary label="X" resetKeys={[bad]}>
            <Boom shouldThrow={bad} />
          </WidgetErrorBoundary>
        </>
      );
    }
    render(<Wrapper />);
    expect(screen.getByText(/Не вдалось показати/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("fix"));
    expect(screen.getByText("real content")).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it("renders custom fallback when provided", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <WidgetErrorBoundary label="X" fallback={<div>custom</div>}>
        <Boom shouldThrow />
      </WidgetErrorBoundary>,
    );
    expect(screen.getByText("custom")).toBeInTheDocument();
    expect(screen.queryByText(/Не вдалось показати/i)).not.toBeInTheDocument();
    errSpy.mockRestore();
  });
});
