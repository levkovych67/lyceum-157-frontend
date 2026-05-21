import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudentProductCard } from "@/entities/product";
import type { StudentProductDto } from "@/shared/api/generated/models/studentProductDto";

const base: StudentProductDto = {
  id: "p1",
  title: "Керамічний птах",
  priceUah: "850.00",
  type: "PHYSICAL",
  status: "DRAFT",
  imageCount: 0,
};

describe("StudentProductCard", () => {
  it("shows title, formatted price and status", () => {
    render(<StudentProductCard product={base} actions={null} />);
    expect(screen.getByText("Керамічний птах")).toBeInTheDocument();
    expect(screen.getByText(/850/)).toBeInTheDocument();
    expect(screen.getByText("Чернетка")).toBeInTheDocument();
  });
  it("renders the rejection reason when REJECTED", () => {
    render(
      <StudentProductCard
        product={{ ...base, status: "REJECTED", rejectionReason: "Фото замале" }}
        actions={null}
      />,
    );
    expect(screen.getByText(/Фото замале/)).toBeInTheDocument();
  });
  it("renders the actions slot", () => {
    render(<StudentProductCard product={base} actions={<button>Подати</button>} />);
    expect(screen.getByRole("button", { name: "Подати" })).toBeInTheDocument();
  });
});
