import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageSlot } from "@/shared/ui/image-slot";

describe("ImageSlot", () => {
  it("renders placeholder when src is undefined", () => {
    render(
      <ImageSlot
        slot="home/hero/poster-1"
        ratio="3/4"
        variant="polaroid"
        caption="Учнівська фоторамка №1"
      />,
    );
    const ph = screen.getByRole("img", { name: /Учнівська фоторамка №1.*placeholder/i });
    expect(ph).toBeInTheDocument();
    expect(ph).toHaveAttribute("data-slot", "home/hero/poster-1");
    expect(ph).toHaveAttribute("data-variant", "polaroid");
    expect(ph).toHaveAttribute("data-ratio", "3/4");
  });

  it("shows slot id, ratio and variant in placeholder body", () => {
    render(
      <ImageSlot
        slot="catalog/hero/banner"
        ratio="16/9"
        variant="interlude"
        caption="Банер каталогу"
      />,
    );
    expect(screen.getByText("catalog/hero/banner")).toBeInTheDocument();
    expect(screen.getByText("16/9")).toBeInTheDocument();
    expect(screen.getByText("interlude")).toBeInTheDocument();
    expect(screen.getByText("Банер каталогу")).toBeInTheDocument();
  });

  it("renders next/image when src is provided", () => {
    render(
      <ImageSlot
        slot="x/y/z"
        ratio="1/1"
        variant="plain"
        caption="cap"
        src="/images/test.jpg"
        alt="Test alt"
      />,
    );
    const img = screen.getByAltText("Test alt");
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
    expect(screen.queryByRole("img", { name: /placeholder/i })).not.toBeInTheDocument();
  });

  it("applies aspect-ratio CSS to placeholder container", () => {
    const { container } = render(
      <ImageSlot slot="x/y/z" ratio="4/5" variant="photo-print" caption="cap" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.aspectRatio).toBe("4 / 5");
  });
});
