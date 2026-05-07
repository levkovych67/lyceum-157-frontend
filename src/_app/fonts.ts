import { Fraunces, Manrope, Caveat } from "next/font/google";

// Note: Fraunces has no cyrillic subset on Google Fonts. Cyrillic glyphs fall through
// to the next font in --f-display chain (system serif). Acceptable for foundation;
// editorial-polish brainstorm may swap to a Cyrillic-capable display serif if needed.
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--f-display-raw",
});

export const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--f-body-raw",
});

export const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--f-hand-raw",
});
