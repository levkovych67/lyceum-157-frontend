import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  PaperSkeleton,
  PaperSkeletonGrid,
  PaperSkeletonForm,
  PaperSkeletonProfile,
  PaperSkeletonArticle,
  PaperSkeletonPage,
} from "@/shared/ui/paper-skeleton";

describe("PaperSkeleton primitive", () => {
  it("renders dashed-border block by default", () => {
    render(<PaperSkeleton />);
    const el = screen.getByTestId("paper-skeleton-block");
    expect(el.className).toContain("border-dashed");
    expect(el.className).toContain("border-burgundy/40");
  });

  it("supports line variant", () => {
    render(<PaperSkeleton variant="line" />);
    expect(screen.getByTestId("paper-skeleton-line")).toBeInTheDocument();
  });

  it("supports circle variant", () => {
    render(<PaperSkeleton variant="circle" />);
    expect(screen.getByTestId("paper-skeleton-circle")).toBeInTheDocument();
  });
});

describe("PaperSkeleton variants", () => {
  it("PaperSkeletonGrid renders cols * rows tiles + loading stamp", () => {
    render(<PaperSkeletonGrid cols={3} rows={2} />);
    expect(screen.getAllByTestId("paper-skeleton-block")).toHaveLength(6);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonForm renders N field placeholders + stamp", () => {
    render(<PaperSkeletonForm fields={4} />);
    expect(screen.getAllByTestId("paper-skeleton-line").length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByTestId("paper-skeleton-block").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonProfile renders header + 3 sections", () => {
    render(<PaperSkeletonProfile />);
    expect(screen.getAllByTestId("paper-skeleton-block").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonArticle renders photo + paragraph lines", () => {
    render(<PaperSkeletonArticle />);
    expect(screen.getAllByTestId("paper-skeleton-block").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByTestId("paper-skeleton-line").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
  });

  it("PaperSkeletonPage renders fullscreen stamp only", () => {
    render(<PaperSkeletonPage />);
    expect(screen.getByText("ДРУКУЄТЬСЯ")).toBeInTheDocument();
    expect(screen.queryByTestId("paper-skeleton-block")).not.toBeInTheDocument();
  });

  it("variants expose role='status' with i18n aria-label", () => {
    render(<PaperSkeletonPage />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-label", "Завантаження…");
  });
});
