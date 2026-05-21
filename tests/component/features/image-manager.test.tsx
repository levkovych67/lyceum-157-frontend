import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ImageManager } from "@/features/product-image-upload/ui/image-manager";
import type { ImageDto } from "@/shared/api/generated/models/imageDto";

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("ImageManager", () => {
  it("shows an empty hint when there are no images", () => {
    wrap(<ImageManager productId="p1" images={[]} editable />);
    expect(screen.getByText(/Додай фото/)).toBeInTheDocument();
  });
  it("renders each image and marks the primary one", () => {
    const images: ImageDto[] = [
      { id: "i1", url: "/a.webp", primary: true, sortOrder: 0 },
      { id: "i2", url: "/b.webp", primary: false, sortOrder: 1 },
    ];
    wrap(<ImageManager productId="p1" images={images} editable />);
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.getByText("Головне")).toBeInTheDocument();
  });
});
