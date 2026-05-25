"use client";
import { useEffect, useState } from "react";
import {
  useCities,
  useBranches,
  cities as fetchCities,
} from "@/shared/api/generated/delivery/delivery";
import type { NovaPoshtaBranchDto, NovaPoshtaCityDto } from "@/shared/api/generated/models";
import { POPULAR_CITIES } from "@/shared/lib/popular-cities";
import { uk } from "@/shared/i18n/uk";
import { Input } from "@/shared/ui";
import { cn } from "@/shared/lib";

const STALE = 60 * 60 * 1000;

export function __sortBranches(items: NovaPoshtaBranchDto[]): NovaPoshtaBranchDto[] {
  return [...items].sort((a, b) => {
    const aBranch = a.type === "BRANCH";
    const bBranch = b.type === "BRANCH";
    if (aBranch !== bBranch) return aBranch ? -1 : 1;
    return (parseInt(a.number ?? "", 10) || 0) - (parseInt(b.number ?? "", 10) || 0);
  });
}

export interface NovaPoshtaPickerValue {
  cityRef: string;
  cityName: string;
  branchRef: string;
  branchNumber: string;
  branchType: "BRANCH" | "POSTBOX";
  branchAddress: string;
}

export interface NovaPoshtaPickerErrors {
  city?: string;
  branch?: string;
}

export interface NovaPoshtaPickerProps {
  value: NovaPoshtaPickerValue;
  onChange: (patch: Partial<NovaPoshtaPickerValue>) => void;
  errors: NovaPoshtaPickerErrors;
}

export function NovaPoshtaPicker({ value, onChange, errors }: NovaPoshtaPickerProps) {
  const [cityQuery, setCityQuery] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [debouncedCityQ, setDebouncedCityQ] = useState("");

  const [whQuery, setWhQuery] = useState("");
  const [whOpen, setWhOpen] = useState(false);

  const citySelected = value.cityRef.length > 0;

  useEffect(() => {
    if (citySelected || cityQuery.trim().length < 2) {
      setDebouncedCityQ("");
      return;
    }
    const id = setTimeout(() => setDebouncedCityQ(cityQuery.trim()), 250);
    return () => clearTimeout(id);
  }, [cityQuery, citySelected]);

  const citiesQuery = useCities(
    { q: debouncedCityQ },
    { query: { enabled: debouncedCityQ.length >= 2, staleTime: STALE } },
  );
  const cities = citiesQuery.data ?? [];
  const citiesUnavailable = citiesQuery.isError;
  const loadingCities = !citySelected && cityQuery.trim().length >= 2 && !citiesQuery.isError;

  const branchesQuery = useBranches(value.cityRef, {
    query: { enabled: !!value.cityRef, staleTime: STALE },
  });
  const branches = __sortBranches(branchesQuery.data ?? []);
  const branchesUnavailable = branchesQuery.isError;

  function selectCity(city: NovaPoshtaCityDto) {
    setCityOpen(false);
    setCityQuery("");
    onChange({
      cityRef: city.ref ?? "",
      cityName: city.name ?? "",
      branchRef: "",
      branchNumber: "",
      branchType: "BRANCH",
      branchAddress: "",
    });
  }

  async function selectPopularCity(name: string) {
    try {
      const res = await fetchCities({ q: name });
      const first = res[0];
      if (first) selectCity(first);
    } catch {
      /* silent — користувач може ввести вручну */
    }
  }

  function editCity(text: string) {
    setCityQuery(text);
    if (value.cityRef) {
      onChange({
        cityRef: "",
        cityName: "",
        branchRef: "",
        branchNumber: "",
        branchType: "BRANCH",
        branchAddress: "",
      });
    }
  }

  function selectBranch(b: NovaPoshtaBranchDto) {
    onChange({
      branchRef: b.ref ?? "",
      branchNumber: b.number ?? "",
      branchType: b.type === "POSTBOX" ? "POSTBOX" : "BRANCH",
      branchAddress: b.address ?? "",
    });
    setWhQuery("");
    setWhOpen(false);
  }

  function resetBranch() {
    onChange({
      branchRef: "",
      branchNumber: "",
      branchType: "BRANCH",
      branchAddress: "",
    });
  }

  const showPopular = cityOpen && !citySelected && cityQuery.trim().length < 2;
  const showCityResults = cityOpen && !citySelected && cities.length > 0;

  const filteredBranches = whQuery.trim()
    ? branches.filter(
        (b) =>
          (b.address ?? "").toLowerCase().includes(whQuery.trim().toLowerCase()) ||
          (b.number ?? "").includes(whQuery.trim()),
      )
    : branches;

  const selectedBranchLabel = value.branchRef
    ? `${value.branchType === "POSTBOX" ? uk.delivery.branchTagPostbox : uk.delivery.branchTagBranch} №${value.branchNumber}, ${value.branchAddress}`
    : "";

  return (
    <div className="space-y-6">
      {/* CITY */}
      <label className="block">
        <span className="mb-2 block text-small uppercase tracking-widest text-ink-soft">
          {uk.delivery.cityLabel}
        </span>
        <div className="relative">
          <Input
            variant="underline"
            placeholder={uk.delivery.cityPlaceholder}
            autoComplete="address-level2"
            value={citySelected ? value.cityName : cityQuery}
            onChange={(e) => editCity(e.target.value)}
            onFocus={() => setCityOpen(true)}
            onBlur={() => setTimeout(() => setCityOpen(false), 150)}
            aria-invalid={errors.city ? "true" : undefined}
            aria-autocomplete="list"
            aria-expanded={cityOpen}
          />
          {loadingCities && (
            <span
              aria-hidden="true"
              className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-ink-soft border-t-transparent"
            />
          )}
        </div>
        {showPopular && (
          <ul
            role="listbox"
            className="mt-1 max-h-64 overflow-y-auto border border-line bg-bg-card shadow-md"
          >
            <li className="px-3 py-2 text-small uppercase tracking-widest text-ink-soft">
              {uk.delivery.cityPopularHeader}
            </li>
            {POPULAR_CITIES.map((name) => (
              <li
                key={name}
                role="option"
                aria-selected="false"
                className="cursor-pointer px-3 py-2 hover:bg-bg-warm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectPopularCity(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
        {showCityResults && (
          <ul
            role="listbox"
            className="mt-1 max-h-64 overflow-y-auto border border-line bg-bg-card shadow-md"
          >
            {cities.map((c) => (
              <li
                key={c.ref}
                role="option"
                aria-selected="false"
                className="cursor-pointer px-3 py-2 hover:bg-bg-warm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectCity(c)}
              >
                {c.name}
                {c.area && <span className="ml-2 text-small text-ink-soft">({c.area})</span>}
              </li>
            ))}
          </ul>
        )}
        {errors.city ? (
          <span className="mt-2 block text-small text-error">{errors.city}</span>
        ) : citiesUnavailable ? (
          <span className="mt-2 block text-small text-error">{uk.delivery.unavailable}</span>
        ) : null}
      </label>

      {/* BRANCH */}
      {citySelected && (
        <label className="block">
          <span className="mb-2 block text-small uppercase tracking-widest text-ink-soft">
            {uk.delivery.branchLabel}
          </span>
          <Input
            variant="underline"
            placeholder={uk.delivery.branchPlaceholder}
            autoComplete="off"
            value={value.branchRef ? selectedBranchLabel : whQuery}
            onChange={(e) => {
              setWhQuery(e.target.value);
              if (value.branchRef) resetBranch();
            }}
            onFocus={() => setWhOpen(true)}
            onBlur={() => setTimeout(() => setWhOpen(false), 150)}
            aria-invalid={errors.branch ? "true" : undefined}
            aria-autocomplete="list"
            aria-expanded={whOpen}
          />
          {whOpen && !value.branchRef && filteredBranches.length > 0 && (
            <ul
              role="listbox"
              className="mt-1 max-h-64 overflow-y-auto border border-line bg-bg-card shadow-md"
            >
              {filteredBranches.slice(0, 60).map((b) => (
                <li
                  key={b.ref}
                  role="option"
                  aria-selected="false"
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 px-3 py-2 hover:bg-bg-warm",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectBranch(b)}
                >
                  <span>
                    №{b.number}: {b.address}
                  </span>
                  <span className="text-small uppercase tracking-widest text-ink-soft">
                    {b.type === "POSTBOX"
                      ? uk.delivery.branchTagPostbox
                      : uk.delivery.branchTagBranch}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {errors.branch ? (
            <span className="mt-2 block text-small text-error">{errors.branch}</span>
          ) : branchesUnavailable ? (
            <span className="mt-2 block text-small text-error">{uk.delivery.unavailable}</span>
          ) : branchesQuery.isLoading ? (
            <span className="mt-2 block text-small text-ink-soft">{uk.delivery.branchLoading}</span>
          ) : branches.length === 0 ? (
            <span className="mt-2 block text-small text-ink-soft">{uk.delivery.branchEmpty}</span>
          ) : null}
        </label>
      )}
    </div>
  );
}
