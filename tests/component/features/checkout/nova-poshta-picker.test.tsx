import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { NovaPoshtaPickerValue } from "@/features/checkout/ui/nova-poshta-picker";

// Default mock for both queries — empty success.
const useCitiesMock = vi.fn();
const useBranchesMock = vi.fn();
const citiesFnMock = vi.fn();

vi.mock("@/shared/api/generated/delivery/delivery", () => ({
  useCities: (...args: unknown[]) => useCitiesMock(...args),
  useBranches: (...args: unknown[]) => useBranchesMock(...args),
  cities: (...args: unknown[]) => citiesFnMock(...args),
}));

import { NovaPoshtaPicker } from "@/features/checkout/ui/nova-poshta-picker";

const emptyDetails: NovaPoshtaPickerValue = {
  cityRef: "",
  cityName: "",
  branchRef: "",
  branchNumber: "",
  branchType: "BRANCH",
  branchAddress: "",
};

function wrap(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

beforeEach(() => {
  useCitiesMock.mockReturnValue({ data: [], isError: false, isLoading: false });
  useBranchesMock.mockReturnValue({ data: [], isError: false, isLoading: false });
  citiesFnMock.mockReset();
});

describe("<NovaPoshtaPicker/> city UX", () => {
  it("shows popular cities header on city input focus", () => {
    render(wrap(<NovaPoshtaPicker value={emptyDetails} onChange={() => {}} errors={{}} />));
    const cityInput = screen.getByPlaceholderText("Почніть вводити назву");
    fireEvent.focus(cityInput);
    expect(screen.getByText("Популярні міста")).toBeInTheDocument();
    expect(screen.getByText("Київ")).toBeInTheDocument();
  });
});

describe("<NovaPoshtaPicker/> edit city behavior", () => {
  it("resets cityRef + branch when user edits already-selected city", () => {
    const onChange = vi.fn();
    const filled: NovaPoshtaPickerValue = {
      cityRef: "ref-1",
      cityName: "Київ",
      branchRef: "br-1",
      branchNumber: "5",
      branchType: "BRANCH",
      branchAddress: "вул. Сагайдачного, 25",
    };
    render(wrap(<NovaPoshtaPicker value={filled} onChange={onChange} errors={{}} />));
    const cityInput = screen.getByDisplayValue("Київ");
    fireEvent.change(cityInput, { target: { value: "Львів" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        cityRef: "",
        cityName: "",
        branchRef: "",
        branchNumber: "",
      }),
    );
  });
});

describe("<NovaPoshtaPicker/> error states", () => {
  it("shows unavailable inline when cities query errors", () => {
    useCitiesMock.mockReturnValue({ data: undefined, isError: true, isLoading: false });
    render(wrap(<NovaPoshtaPicker value={emptyDetails} onChange={() => {}} errors={{}} />));
    expect(screen.getByText("Сервіс Нової Пошти тимчасово недоступний")).toBeInTheDocument();
  });

  it("shows city error from errors prop", () => {
    render(
      wrap(
        <NovaPoshtaPicker
          value={emptyDetails}
          onChange={() => {}}
          errors={{ city: "Оберіть місто" }}
        />,
      ),
    );
    expect(screen.getByText("Оберіть місто")).toBeInTheDocument();
  });
});
