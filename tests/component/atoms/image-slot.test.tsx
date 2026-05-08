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

  it("forwards blurDataURL to next/image with placeholder=blur", () => {
    const blur =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";
    const { container } = render(
      <ImageSlot
        slot="hero"
        ratio="4/5"
        variant="polaroid"
        caption="x"
        src="https://cdn.157.kyiv.ua/sample.jpg"
        blurDataURL={blur}
      />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    // jsdom strips `background-image: url(data:...)` from inline style during CSS
    // parsing, so we can't assert the data URL directly. Instead, verify next/image
    // emitted the blur-placeholder CSS scaffolding (background-size/position/repeat),
    // which it only does when `placeholder="blur"` + `blurDataURL` are passed through.
    const style = img?.getAttribute("style") ?? "";
    expect(style).toMatch(/background-size:\s*cover/);
    expect(style).toMatch(/background-position:\s*50% 50%/);
    expect(style).toMatch(/background-repeat:\s*no-repeat/);
  });
});
