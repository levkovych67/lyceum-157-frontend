import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mutateAsync = vi.fn();
const revalidateCartMock = vi.fn();

vi.mock("@/features/checkout/model/use-create-order", () => ({
  useCreateOrder: () => ({ mutateAsync, isPending: false }),
}));
vi.mock("@/features/checkout/model/cart-revalidator", () => ({
  revalidateCart: (...args: unknown[]) => revalidateCartMock(...args),
}));
vi.mock("@/shared/api/generated/delivery/delivery", () => ({
  useCities: () => ({ data: [], isError: false, isLoading: false }),
  useBranches: () => ({ data: [], isError: false, isLoading: false }),
  cities: vi.fn(),
}));

import { CheckoutForm } from "@/features/checkout/ui/checkout-form";
import { useCartStore } from "@/entities/cart";

function wrap(ui: ReactNode) {
  const c = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={c}>{ui}</QueryClientProvider>;
}

beforeEach(() => {
  // Seed cart with one item so form renders (else "Кошик порожній").
  // CartItem shape: productId, slug, title, priceUah (string), qty, thumbnailUrl, type
  useCartStore.setState({
    items: [
      {
        productId: "p-1",
        slug: "pic-1",
        title: "Pic",
        priceUah: "200",
        qty: 1,
        thumbnailUrl: null,
        type: "PHYSICAL" as const,
      },
    ],
    count: 1,
  } as never);
  mutateAsync.mockReset();
  mutateAsync.mockResolvedValue({ paymentUrl: "https://liqpay.ua/checkout/x" });
  revalidateCartMock.mockReset();
  revalidateCartMock.mockResolvedValue([]);
});

describe("<CheckoutForm/> submit gate", () => {
  it("blocks mutateAsync when delivery (city/branch) is empty", async () => {
    render(wrap(<CheckoutForm />));
    fireEvent.change(screen.getByPlaceholderText("Імʼя Прізвище"), {
      target: { value: "Тест Тестенко" },
    });
    fireEvent.change(screen.getByPlaceholderText("email@example.com"), {
      target: { value: "x@y.ua" },
    });
    fireEvent.change(screen.getByPlaceholderText("+380501234567"), {
      target: { value: "+380501234567" },
    });
    fireEvent.click(screen.getByRole("button", { name: /сплатити/i }));
    await waitFor(() => {
      expect(mutateAsync).not.toHaveBeenCalled();
    });
  });
});
