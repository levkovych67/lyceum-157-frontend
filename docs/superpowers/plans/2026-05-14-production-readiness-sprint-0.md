# Sprint 0 — Production Readiness Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land Sprint 0 of `PRODUCTION-READINESS.md` — global security headers, FE CI workflow, FE Sentry, and `api.json`-driven type generation — so subsequent sprints have a working dev/CI/observability/contract baseline.

**Architecture:**
- Headers stay in `next.config.mjs` (Next 14 conventional `headers()`), preserving existing `/parent/*` and asset cache rules.
- CI is single workflow `ci.yml` running `pnpm verify` on PR + push.
- Sentry installs as `@sentry/nextjs` with three configs (`client`, `server`, `edge`) and a `beforeSend` PII scrubber; init defers to a lightweight consent flag (cookie banner work is Sprint later — for now default-off in prod, opt-in via `NEXT_PUBLIC_SENTRY_DSN`).
- API typegen via `orval` reads existing `api.json`, emits `src/shared/api/generated/`, uses `src/shared/api/client.ts:api` as the fetch mutator. Consumers stay on hand-written modules for this sprint — migration is Sprint 1+.

**Tech Stack:** Next.js 14.2 App Router · TypeScript strict · pnpm · `@sentry/nextjs` · `orval` · GitHub Actions

---

### Task 1: Global security headers (P0-3)

**Files:**
- Modify: `next.config.mjs`
- Create: `tests/e2e/security-headers.spec.ts`

- [ ] **Step 1: Write the failing E2E test**

Create `tests/e2e/security-headers.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("@smoke global security headers are present on home", async ({ request }) => {
  const res = await request.get("/");
  expect(res.status()).toBeLessThan(400);
  const h = res.headers();
  expect(h["strict-transport-security"]).toContain("max-age=63072000");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  expect(h["content-security-policy"]).toBeDefined();
  expect(h["content-security-policy"]).toContain("default-src 'self'");
});

test("/parent path retains noindex header", async ({ request }) => {
  const res = await request.get("/parent/dashboard");
  // route may 401 / redirect — what matters is the header is set
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
});
```

- [ ] **Step 2: Run the test, expect failure**

Run: `pnpm e2e tests/e2e/security-headers.spec.ts`
Expected: FAIL on `strict-transport-security` undefined.

- [ ] **Step 3: Update `next.config.mjs` with global headers**

Replace the body of `headers()` with:

```js
/** @type {import("next").NextConfig} */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://www.liqpay.ua",
  "frame-src https://www.liqpay.ua",
  "img-src 'self' data: blob: https://cdn.157.kyiv.ua https://*.s3.eu-central-1.amazonaws.com",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // Next 14 inlines runtime JS; tighten with nonces in a follow-up
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  `connect-src 'self' ${API_BASE} https://*.ingest.sentry.io https://*.ingest.de.sentry.io`,
].join("; ");

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...SECURITY_HEADERS,
          { key: "Content-Security-Policy-Report-Only", value: CSP },
        ],
      },
      {
        source: "/parent/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
      {
        source: "/textures/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/stamps/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/illustrations/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.s3.eu-central-1.amazonaws.com" },
      { protocol: "https", hostname: "cdn.157.kyiv.ua" },
    ],
  },
};

export default nextConfig;
```

> **Why Report-Only:** CSP can break Tailwind/Next inline styles and HMR. Run Report-Only for ≥1 week on staging, harvest violations from Sentry CSP-report endpoint, then flip to enforcing in a follow-up commit.

- [ ] **Step 4: Adjust test for Report-Only mode**

In `tests/e2e/security-headers.spec.ts`, replace the CSP assertion with:

```ts
expect(h["content-security-policy-report-only"]).toBeDefined();
expect(h["content-security-policy-report-only"]).toContain("default-src 'self'");
```

Remove the previous `content-security-policy` assertion.

- [ ] **Step 5: Run test, expect pass**

Run: `pnpm e2e tests/e2e/security-headers.spec.ts`
Expected: PASS.

- [ ] **Step 6: Run smoke E2E to confirm no regression**

Run: `pnpm e2e --grep @smoke`
Expected: PASS (paper-noise, stamp-drop, role redirects still work — CSP is report-only so it cannot block).

- [ ] **Step 7: Typecheck + lint + build**

Run: `pnpm typecheck && pnpm lint && pnpm build`
Expected: all PASS. Build will report headers in the build manifest.

- [ ] **Step 8: Commit**

```bash
git add next.config.mjs tests/e2e/security-headers.spec.ts
git commit -m "feat(security): add global security headers + CSP report-only"
```

---

### Task 2: FE CI workflow (P0-4)

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `package.json` (add `verify:ci` script that skips e2e when Playwright browsers absent — optional, see Step 4)

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/ci.yml`:

```yaml
name: ci

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      NEXT_PUBLIC_API_BASE: http://localhost:8080
      NEXT_TELEMETRY_DISABLED: "1"
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Typecheck
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test

      - name: Scan image slots
        run: pnpm scan-images

      - name: Build
        run: pnpm build

      - name: E2E smoke
        run: pnpm e2e --grep @smoke

      - name: Upload Playwright report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report
          retention-days: 7
```

- [ ] **Step 2: Verify the workflow YAML is valid locally**

Run: `cat .github/workflows/ci.yml | head -1` (just confirms file exists). For schema validation, push to a branch and confirm GitHub parses it — alternatively run `pnpm dlx action-validator .github/workflows/ci.yml` if you want a local check.

Expected: file present, indentation correct.

- [ ] **Step 3: Confirm `pnpm verify` runs locally to mirror CI**

Run: `pnpm verify`
Expected: PASS end-to-end. If any step is red, fix root cause before merging the workflow (otherwise CI will go red on first PR).

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(ci): add FE CI workflow running pnpm verify on PRs"
```

- [ ] **Step 5: After merge, configure branch protection**

(Manual GitHub step, not a code change. Note it in the PR body.) In repo Settings → Branches → main → Protect matching branches → require status check `verify`.

---

### Task 3: FE Sentry (P0-5)

**Files:**
- Modify: `package.json`
- Create: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Modify: `next.config.mjs` (wrap with `withSentryConfig`)
- Create: `src/shared/observability/scrub-pii.ts`
- Create: `src/shared/observability/scrub-pii.test.ts`
- Modify: `.env.example` (add `NEXT_PUBLIC_SENTRY_DSN` placeholder + `SENTRY_AUTH_TOKEN` note)

- [ ] **Step 1: Install dependency**

```bash
pnpm add @sentry/nextjs
```

Expected: `@sentry/nextjs` appears in `dependencies`, `pnpm-lock.yaml` updates.

- [ ] **Step 2: Write the PII scrubber test (TDD)**

Create `src/shared/observability/scrub-pii.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { scrubPii } from "./scrub-pii";

describe("scrubPii", () => {
  it("redacts rnokpp from request data", () => {
    const event = {
      request: {
        url: "https://hub.157.kyiv.ua/api/kyc?rnokpp=1234567890",
        data: { rnokpp: "1234567890", firstName: "Ola" },
      },
    } as any;
    const out = scrubPii(event)!;
    expect(out.request.data.rnokpp).toBe("[redacted]");
    expect(out.request.data.firstName).toBe("Ola");
    expect(out.request.url).not.toContain("1234567890");
  });

  it("redacts password and card-like values from extra/contexts", () => {
    const event = {
      extra: { password: "hunter2", note: "ok" },
      contexts: { state: { card: "4111111111111111", count: 3 } },
    } as any;
    const out = scrubPii(event)!;
    expect(out.extra.password).toBe("[redacted]");
    expect(out.extra.note).toBe("ok");
    expect(out.contexts.state.card).toBe("[redacted]");
    expect(out.contexts.state.count).toBe(3);
  });

  it("returns event unchanged when no PII present", () => {
    const event = { message: "hello", extra: { foo: "bar" } } as any;
    expect(scrubPii(event)).toEqual(event);
  });

  it("returns null events untouched", () => {
    expect(scrubPii(null as any)).toBeNull();
  });
});
```

- [ ] **Step 3: Run, expect failure**

Run: `pnpm test src/shared/observability/scrub-pii.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 4: Implement the scrubber**

Create `src/shared/observability/scrub-pii.ts`:

```ts
import type { Event as SentryEvent } from "@sentry/types";

const SENSITIVE_KEYS = new Set([
  "rnokpp",
  "password",
  "card",
  "cardNumber",
  "cvv",
  "iban",
  "passport",
  "totp",
  "totpSecret",
  "accessToken",
  "refreshToken",
  "authorization",
]);

const URL_PARAM_KEYS = ["rnokpp", "access_token", "refresh_token", "token", "code"];

function redactObject(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(redactObject);
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEYS.has(k) ? "[redacted]" : redactObject(v);
    }
    return out;
  }
  return input;
}

function redactUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    for (const key of URL_PARAM_KEYS) {
      if (u.searchParams.has(key)) u.searchParams.set(key, "[redacted]");
    }
    return u.toString();
  } catch {
    return url;
  }
}

export function scrubPii(event: SentryEvent | null): SentryEvent | null {
  if (!event) return event;
  const scrubbed: SentryEvent = { ...event };
  if (scrubbed.request) {
    scrubbed.request = {
      ...scrubbed.request,
      url: redactUrl(scrubbed.request.url),
      data: redactObject(scrubbed.request.data),
    };
  }
  if (scrubbed.extra) scrubbed.extra = redactObject(scrubbed.extra) as SentryEvent["extra"];
  if (scrubbed.contexts) {
    scrubbed.contexts = redactObject(scrubbed.contexts) as SentryEvent["contexts"];
  }
  return scrubbed;
}
```

- [ ] **Step 5: Run, expect pass**

Run: `pnpm test src/shared/observability/scrub-pii.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Create `sentry.client.config.ts`**

```ts
import * as Sentry from "@sentry/nextjs";
import { scrubPii } from "@/shared/observability/scrub-pii";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.1,
    integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
    beforeSend: (event) => scrubPii(event),
    beforeBreadcrumb: (crumb) => {
      if (crumb.category === "fetch" && crumb.data?.url) {
        crumb.data.url = String(crumb.data.url).replace(
          /([?&](?:access_token|refresh_token|token|code|rnokpp)=)[^&]+/gi,
          "$1[redacted]",
        );
      }
      return crumb;
    },
  });
}
```

- [ ] **Step 7: Create `sentry.server.config.ts`**

```ts
import * as Sentry from "@sentry/nextjs";
import { scrubPii } from "@/shared/observability/scrub-pii";

const DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend: (event) => scrubPii(event),
  });
}
```

- [ ] **Step 8: Create `sentry.edge.config.ts`**

```ts
import * as Sentry from "@sentry/nextjs";
import { scrubPii } from "@/shared/observability/scrub-pii";

const DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.SENTRY_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.05,
    beforeSend: (event) => scrubPii(event),
  });
}
```

- [ ] **Step 9: Wrap `next.config.mjs` with `withSentryConfig`**

At the bottom of `next.config.mjs`, replace `export default nextConfig;` with:

```js
import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: false,
});
```

> If sourcemap upload requires `SENTRY_AUTH_TOKEN`, leave it empty in CI for now — Sentry only uploads when the token is present, otherwise it is a no-op and the build succeeds.

- [ ] **Step 10: Add env placeholders**

If `.env.example` exists, append:

```
# Sentry (optional — empty disables Sentry init)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
# CI-only — token for sourcemap upload, never commit a real value
# SENTRY_AUTH_TOKEN=
```

If `.env.example` does not exist, skip this step (do not create the file unless an existing convention asks for it).

- [ ] **Step 11: Typecheck + unit + build**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: PASS. Without DSN, Sentry init is skipped — build completes the same.

- [ ] **Step 12: Verify bundle delta**

Run: `pnpm build` and inspect the route-level "First Load JS" report at the end of the build log. Sentry overhead should be roughly +50–60 kB gzipped on first-load chunks. If you see >100 kB delta, investigate — likely full SDK was pulled into a server-only path.

- [ ] **Step 13: Commit**

```bash
git add package.json pnpm-lock.yaml sentry.client.config.ts sentry.server.config.ts sentry.edge.config.ts next.config.mjs src/shared/observability/
git add .env.example 2>/dev/null || true
git commit -m "feat(observability): wire @sentry/nextjs with PII scrubbing"
```

---

### Task 4: api.json sync + orval type generation (P0-API-1)

**Files:**
- Modify: `package.json` (scripts + devDependency)
- Create: `orval.config.ts`
- Create: `src/shared/api/orval-mutator.ts`
- Modify: `.gitignore` (no — generated code IS committed per PRODUCTION-READINESS.md P0-API-1)

- [ ] **Step 1: Install orval**

```bash
pnpm add -D orval
```

Expected: `orval` appears in `devDependencies`, lockfile updates.

- [ ] **Step 2: Create the orval mutator**

Create `src/shared/api/orval-mutator.ts`:

```ts
import { api, type ApiOptions } from "@/shared/api/client";

export type OrvalRequestConfig = {
  url: string;
  method: "get" | "post" | "put" | "patch" | "delete" | "head";
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  responseType?: string;
};

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return (
    "?" +
    entries
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&")
  );
}

export const customFetch = <T>(cfg: OrvalRequestConfig): Promise<T> => {
  const path = `${cfg.url}${buildQuery(cfg.params)}`;
  const opts: ApiOptions = {
    method: cfg.method.toUpperCase(),
    headers: cfg.headers,
    signal: cfg.signal,
  };
  if (cfg.data !== undefined) {
    opts.body = cfg.data instanceof FormData ? cfg.data : JSON.stringify(cfg.data);
  }
  return api<T>(path, opts);
};

export default customFetch;
```

> Reuses the existing `api()` from `src/shared/api/client.ts` — preserves auth header injection, refresh handling, problem+json error parsing, and the `/auth/*` credentials policy.

- [ ] **Step 3: Create `orval.config.ts`**

Create `orval.config.ts` at the project root:

```ts
import { defineConfig } from "orval";

export default defineConfig({
  lyceumApi: {
    input: { target: "./api.json" },
    output: {
      mode: "tags-split",
      target: "./src/shared/api/generated/endpoints.ts",
      schemas: "./src/shared/api/generated/models",
      client: "react-query",
      prettier: true,
      clean: true,
      override: {
        mutator: {
          path: "./src/shared/api/orval-mutator.ts",
          name: "customFetch",
        },
        query: {
          useQuery: true,
          useMutation: true,
          options: { staleTime: 60_000 },
          signal: true,
        },
      },
    },
  },
});
```

- [ ] **Step 4: Add npm scripts**

Edit `package.json` `scripts`:

```json
{
  "scripts": {
    "sync-api": "node -e \"require('fs').writeFileSync('api.json', require('child_process').execSync('curl -sSf ' + (process.env.API_BASE || 'http://localhost:8080') + '/v3/api-docs'))\"",
    "gen-types": "orval --config orval.config.ts",
    "sync": "pnpm sync-api && pnpm gen-types && pnpm typecheck"
  }
}
```

> The `sync-api` script uses Node + `curl` to be cross-shell. On Windows PowerShell developer machines, `curl` is aliased to `Invoke-WebRequest`; using `execSync` with the literal `curl` invokes the real `curl.exe` shipped with Windows 10+.

- [ ] **Step 5: Generate types from existing `api.json`**

Run: `pnpm gen-types`
Expected: `src/shared/api/generated/` populated with `endpoints/`, `models/`. No errors.

- [ ] **Step 6: Typecheck**

Run: `pnpm typecheck`
Expected: PASS. Generated code must compile under strict mode. If a tag-split file imports a model that strict mode rejects, re-run `pnpm gen-types` to confirm reproducibility, then patch via `orval.config.ts override` rather than hand-editing generated files.

- [ ] **Step 7: Lint check (FSD boundaries)**

Run: `pnpm lint`
Expected: PASS. Generated code lives under `src/shared/api/generated/` — already in `shared`, so eslint-plugin-boundaries permits any consumer to import it.

If lint fails on generated files (e.g., unused vars, react-hooks rules), add an override at the top of `.eslintrc.cjs` (or whichever config file the project uses) for `src/shared/api/generated/**` — `rules: { "@typescript-eslint/no-unused-vars": "off", "react-hooks/rules-of-hooks": "off" }`. Make this an additive override; do not relax rules elsewhere.

- [ ] **Step 8: Build**

Run: `pnpm build`
Expected: PASS. Build must succeed even though no consumer imports the generated hooks yet — orval generates tree-shakeable code.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml orval.config.ts src/shared/api/orval-mutator.ts src/shared/api/generated/
git commit -m "feat(api): orval type generation infra + customFetch mutator"
```

> Generated code IS committed (per PRODUCTION-READINESS.md P0-API-1 acceptance: "`src/shared/api/generated/` committed"). CI drift-check (P0-API-2) is a separate task that lands in Sprint 1.

---

## Verification (full Sprint 0 acceptance)

After all four tasks merge, run from `lyceum-157-frontend/`:

```bash
pnpm verify
```

This runs: `typecheck → lint → test → scan-images → build → e2e --grep @smoke`. Every leg must pass.

Then sanity-check the artifacts:
- `curl -sI http://localhost:3000/ | grep -iE 'strict-transport|x-frame|content-security'` — confirms headers present.
- GitHub Actions tab — confirms the `verify` job ran on the PR.
- With a Sentry DSN set in `.env.local`, throw a test error: `throw new Error("sentry-test")` in a client component, confirm it appears in the Sentry project with sourcemaps and no RNOKPP/password/token strings in the payload.
- `pnpm gen-types` is idempotent — running twice produces no diff.

---

## Out-of-scope (deferred to Sprint 1+)

- Migrating existing `src/shared/api/modules/*` callers to generated hooks (P0-API-1 Step 5 — large refactor, deserves its own plan).
- CSP enforcement (currently Report-Only — flip to enforcing after one week of staging telemetry).
- CI api.json drift-check job (P0-API-2 — needs BE Docker image in GHCR or artifact-download flow).
- Cookie consent banner gating Sentry init (P0-LEGAL-FE-1).
- Branch protection rule (manual GitHub UI step, not code).
