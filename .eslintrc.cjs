/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["boundaries"],
  settings: {
    "boundaries/elements": [
      { type: "app", pattern: "src/app/*" },
      { type: "_app", pattern: "src/_app/*" },
      { type: "processes", pattern: "src/processes/*" },
      { type: "pages", pattern: "src/pages/*" },
      { type: "widgets", pattern: "src/widgets/*" },
      { type: "features", pattern: "src/features/*" },
      { type: "entities", pattern: "src/entities/*" },
      { type: "shared", pattern: "src/shared/*" },
    ],
    "boundaries/include": ["src/**/*"],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: "app", allow: ["_app", "processes", "pages", "widgets", "features", "entities", "shared"] },
          { from: "_app", allow: ["processes", "pages", "widgets", "features", "entities", "shared"] },
          { from: "processes", allow: ["pages", "widgets", "features", "entities", "shared"] },
          { from: "pages", allow: ["widgets", "features", "entities", "shared"] },
          { from: "widgets", allow: ["features", "entities", "shared"] },
          { from: "features", allow: ["entities", "shared"] },
          { from: "entities", allow: ["shared"] },
          { from: "shared", allow: [] },
        ],
      },
    ],
    "no-restricted-imports": [
      "error",
      { patterns: [{ group: ["../*"], message: "Use @/ alias instead of relative parent imports" }] },
    ],
  },
};
