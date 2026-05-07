import { Fraunces, Manrope, Caveat, Source_Serif_4 } from "next/font/google";

// Fraunces ships only latin/latin-ext on Google Fonts. We keep it as the primary display
// face for Latin glyphs (numerals, ASCII), and chain Source Serif 4 — also a variable
// serif with an opsz axis — as the Cyrillic carrier. Per-glyph fallback in the
// --f-display chain means each character picks the first font that owns it.
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
  variable: "--f-display-raw",
});

export const sourceSerif = Source_Serif_4({
  subsets: ["cyrillic", "latin"],
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--f-display-cyr-raw",
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
