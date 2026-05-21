import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "var(--container-pad)",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        burgundy: {
          DEFAULT: "var(--c-burgundy)",
          deep: "var(--c-burgundy-deep)",
          soft: "var(--c-burgundy-soft)",
        },
        green: {
          DEFAULT: "var(--c-green)",
          deep: "var(--c-green-deep)",
          soft: "var(--c-green-soft)",
        },
        bg: {
          DEFAULT: "var(--c-bg)",
          warm: "var(--c-bg-warm)",
          card: "var(--c-bg-card)",
          yellow: "var(--c-bg-yellow)",
          blue: "var(--c-bg-blue)",
          noir: "var(--c-bg-noir)",
        },
        ink: {
          DEFAULT: "var(--c-ink)",
          soft: "var(--c-ink-soft)",
          fade: "var(--c-ink-fade)",
        },
        line: { DEFAULT: "var(--c-line)", strong: "var(--c-line-strong)" },
        link: "var(--c-link)",
        stamp: "var(--c-stamp)",
        error: "var(--c-error)",
        glass: "var(--header-glass-bg)",
      },
      fontFamily: {
        display: ["var(--f-display)"],
        body: ["var(--f-body)"],
        hand: ["var(--f-hand)"],
      },
      fontSize: {
        mega: [
          "clamp(80px, 12vw, 200px)",
          { lineHeight: "0.88", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        display: [
          "clamp(56px, 8vw, 96px)",
          { lineHeight: "0.92", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        h1: [
          "clamp(40px, 5vw, 64px)",
          { lineHeight: "1.0", letterSpacing: "-0.015em", fontWeight: "700" },
        ],
        h2: [
          "clamp(32px, 4vw, 48px)",
          { lineHeight: "1.05", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        h3: [
          "clamp(24px, 2.5vw, 32px)",
          { lineHeight: "1.15", letterSpacing: "0", fontWeight: "700" },
        ],
        quote: [
          "clamp(22px, 2.5vw, 32px)",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        lead: ["clamp(18px, 1.5vw, 22px)", { lineHeight: "1.55" }],
        body: ["clamp(15px, 1vw, 16px)", { lineHeight: "1.6" }],
        small: ["clamp(13px, 0.9vw, 14px)", { lineHeight: "1.5", fontWeight: "500" }],
        label: ["11px", { lineHeight: "1", letterSpacing: "0.12em", fontWeight: "700" }],
        "hand-s": ["clamp(16px, 1.2vw, 18px)", { lineHeight: "1.3" }],
        "hand-m": ["clamp(22px, 1.8vw, 26px)", { lineHeight: "1.25", fontWeight: "600" }],
        "hand-l": ["clamp(28px, 2.5vw, 36px)", { lineHeight: "1.2", fontWeight: "700" }],
      },
      spacing: {
        1: "var(--s-1)",
        2: "var(--s-2)",
        3: "var(--s-3)",
        4: "var(--s-4)",
        5: "var(--s-5)",
        6: "var(--s-6)",
        7: "var(--s-7)",
        8: "var(--s-8)",
        9: "var(--s-9)",
        10: "var(--s-10)",
        11: "var(--s-11)",
        12: "var(--s-12)",
      },
      // `spacing` 1–12 навмисно перевизначено на дизайн-токени `--s-*` (4–200px)
      // для padding/margin/gap. Але `height`/`width` теж успадковують `spacing`,
      // через що `h-9…h-12` ставали 96–200px і ламали кнопки, інпути, іконки.
      // Повертаємо `h-*`/`w-*` 1–12 до стандартних значень Tailwind.
      height: {
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        11: "2.75rem",
        12: "3rem",
      },
      width: {
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        11: "2.75rem",
        12: "3rem",
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        pill: "var(--r-pill)",
      },
      boxShadow: {
        paper: "var(--sh-paper)",
        lift: "var(--sh-lift)",
        photo: "var(--sh-photo)",
        deep: "var(--sh-deep)",
        press: "var(--sh-press)",
        "press-sm": "var(--sh-press-sm)",
      },
      transitionTimingFunction: {
        paper: "var(--ease-paper)",
        spring: "var(--ease-spring)",
        quart: "var(--ease-quart)",
        stamp: "var(--ease-stamp)",
        drawer: "var(--ease-drawer)",
      },
      transitionDuration: {
        d1: "var(--d-1)",
        d2: "var(--d-2)",
        d3: "var(--d-3)",
        d4: "var(--d-4)",
        d5: "var(--d-5)",
        d6: "var(--d-6)",
      },
      keyframes: {
        "stamp-drop": {
          "0%": {
            transform: "translateY(-180px) scale(1.6) rotate(var(--final-rotation, -8deg))",
            opacity: "0",
            filter: "blur(2px)",
          },
          "60%": {
            transform:
              "translateY(-8px) scale(0.94) rotate(calc(var(--final-rotation, -8deg) * 0.8))",
            opacity: "1",
            filter: "blur(0)",
          },
          "72%": { transform: "translateY(2px) scale(1.06) rotate(var(--final-rotation, -8deg))" },
          "85%": { transform: "translateY(0) scale(0.98) rotate(var(--final-rotation, -8deg))" },
          "100%": { transform: "translateY(0) scale(1) rotate(var(--final-rotation, -8deg))" },
        },
        "page-turn": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "tilt-into-place": {
          "0%": { transform: "rotate(calc(var(--final-rotation, 0deg) + 20deg))", opacity: "0" },
          "100%": { transform: "rotate(var(--final-rotation, 0deg))", opacity: "1" },
        },
        // Лічильник кошика: впечатується з лагідним overshoot — ніколи з scale(0).
        "badge-pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Route-transition: контент сторінки проявляється на кожній навігації.
        "route-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "stamp-drop": "stamp-drop var(--d-3) var(--ease-stamp) both",
        "page-turn": "page-turn var(--d-3) var(--ease-paper) both",
        "tilt-into-place": "tilt-into-place var(--d-4) var(--ease-spring) both",
        "badge-pop": "badge-pop var(--d-2) var(--ease-quart) both",
        // `backwards` (не `both`) — після завершення transform зникає,
        // щоб обгортка не лишалась containing-block для fixed-елементів.
        "route-in": "route-in var(--d-3) var(--ease-paper) backwards",
      },
      backgroundImage: {
        "paper-noise": "url('/textures/paper-noise.svg')",
      },
    },
  },
  plugins: [],
};

export default config;
