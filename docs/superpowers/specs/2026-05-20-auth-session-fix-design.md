# Auth Session Fix — Design

- **Date:** 2026-05-20
- **Status:** Approved (brainstorming complete, pending implementation plan)
- **Scope:** cross-cutting — `lyceum-157-frontend` + `lyceum-157-backend`
- **Roles in scope:** `ADMIN`, `STUDENT` (password login). `PARENT` is out of scope — parents use magic-link token flows, not a login.

## Problem

Login on production works (the `/api/v1/auth/login` call returns a valid access token), but the
session does not survive a page reload:

1. **No session bootstrap.** The access token lives only in an in-memory store
   (`shared/api/auth-token.ts`). `AuthProvider` never calls `tryRefresh()` on app start, so after
   F5 the in-memory snapshot is `null`, the role layouts see `isAuthenticated === false`, and they
   immediately redirect to `/login`. The `refresh_token` cookie exists but is never used to restore
   the session.
2. **No production admin.** `DevSeedRunner` (which creates `admin@dev.local`) is gated to the
   `local` Spring profile. On `prod` there is no admin account and no admin-registration endpoint.

Secondary weaknesses in the same code paths:

3. **Possible retry loop.** In `shared/api/client.ts`, a `401` triggers `tryRefresh()` then
   `return api(path, opts)`. If the retried request also `401`s, it refreshes and retries again
   with no bound — a potential infinite request loop.
4. **No redirect away from `/login`** for an already-authenticated user.

## Goals

- A logged-in `ADMIN` or `STUDENT` stays logged in across page reloads (F5) and across browser
  restarts within the refresh-token lifetime (7 days, already enforced by the backend).
- The first production admin is provisioned automatically, reproducibly, without manual SQL.
- Fix the retry loop and the `/login` redirect as low-risk hardening in the same files.

## Non-goals

- No new roles (no `TEACHER`/curator). Existing `ADMIN`/`STUDENT`/`PARENT` only.
- No change-password UI — the bootstrap admin password is the standing password, managed via
  `.env` (already `0600`).
- No cross-subdomain cookie sharing, no logout-everywhere, no configurable session lifetime.
- No change to the `PARENT` magic-link flows.

## Chosen approach

**Bootstrap-refresh with a 3-state `AuthProvider`.** On mount, `AuthProvider` calls `tryRefresh()`
once; consumers distinguish "still bootstrapping" from "definitely logged out" and wait instead of
redirecting.

Rejected alternatives:

- **Persist token to `localStorage`** — storing a JWT in JS-readable storage is an XSS
  exfiltration risk and contradicts the codebase's in-memory + httpOnly-cookie security stance.
  The 15-minute access token would be stale on reload anyway.
- **Server-side bootstrap (read cookie in a Server Component)** — the `refresh_token` cookie is
  host-scoped to `api.lyceum157-kiev.shop`; the Next.js server runs on the apex host and cannot
  read it. This is the same constraint that made the old middleware cookie-gate non-functional.

## Design

### Frontend — session bootstrap (3-state)

Replace the implicit 2-state (`isAuthenticated` true/false) with an explicit `status`:

| `status` | Meaning |
|---|---|
| `loading` | bootstrap refresh in flight — initial state on every page load |
| `authenticated` | a valid session snapshot is present |
| `unauthenticated` | bootstrap finished, no valid session |

`isAuthenticated` is kept as a derived convenience (`status === "authenticated"`).

**`AuthProvider` (`_app/providers/auth-provider.tsx`):**

- Add a `bootstrapped` boolean state, initially `false`.
- New mount-only `useEffect`:
  - if a snapshot already exists (e.g. client-side navigation right after login) → set
    `bootstrapped = true`, skip;
  - else `await tryRefresh()`, then set `bootstrapped = true`. `tryRefresh()` already calls
    `setSnapshot(...)` on success and `setSnapshot(null)` on failure.
- Derive `status`: `!bootstrapped → "loading"`; `bootstrapped && snap → "authenticated"`;
  `bootstrapped && !snap → "unauthenticated"`.
- The existing event-listener and proactive-refresh effects are unchanged.

**SSR safety:** `AuthProvider` is a client component. On the server and on the first client render
`bootstrapped` is `false` → `status === "loading"` in both — no hydration mismatch.

**Consumers.** Each consumer keeps its existing role-routing; the only change is adding an
explicit `loading` branch so it waits for bootstrap instead of redirecting on `loading`.

`app/admin/layout.tsx`, `app/student/layout.tsx`:

- `status === "loading"` → render `RoleGateSplash` (already exists); do **not** redirect.
- `status === "unauthenticated"` → redirect to `/login`.
- `status === "authenticated"` + wrong role → redirect to `/` (unchanged behaviour).
- `status === "authenticated"` + correct role → render the section.

`app/account/page.tsx` (no role layout — guards itself):

- `status === "loading"` → render `null` (unchanged gating render); do **not** redirect.
- `status === "unauthenticated"` → redirect to `/login`.
- `status === "authenticated"` + `role === "ADMIN"` → redirect to `/admin` (unchanged behaviour).
- `status === "authenticated"` + other role → render `AccountScreen`.

The public header reads `isAuthenticated` only; during `loading` it briefly shows the
logged-out state then updates. It does not redirect, so no change is required.

### Frontend — hardening

- **Retry guard (`shared/api/client.ts`).** Bound the post-`401` refresh-and-retry to exactly one
  attempt via an internal flag (e.g. a private parameter or a symbol on `opts`). A second `401`
  after a successful refresh throws the `ApiError` instead of refreshing again.
- **`/login` redirect (`app/(public)/login/`).** After bootstrap, if `status === "authenticated"`,
  redirect: `ADMIN → /admin`, otherwise `→ /account`.

### Backend — admin env-bootstrap

**New `AdminBootstrapRunner`** (`config/`, alongside `DevSeedRunner`):

- An `ApplicationRunner` — runs after context start and Flyway migration.
- `@Profile("!local")` — does not clash with `DevSeedRunner` (which seeds `admin@dev.local`
  on `local` only).
- Idempotent logic:
  - `ADMIN_EMAIL`/`ADMIN_PASSWORD` blank → log `info`, skip;
  - user with that email already exists → log "admin exists, skip";
  - otherwise → `User.createAdmin(email, passwordEncoder.encode(password))`, save, log success
    with masked email.
- Best-effort: a creation failure logs `error` but does **not** crash startup.

**Config:**

- `AppProperties` — add a nested `Admin` record with optional `bootstrapEmail` /
  `bootstrapPassword` (plain `String`, no `@NotBlank` — absent on `local`).
- `application.yml` — `app.admin.bootstrap-email: ${ADMIN_EMAIL:}` and
  `bootstrap-password: ${ADMIN_PASSWORD:}` (empty defaults → skip when unset).
- `deploy/.env.prod.example` — add `ADMIN_EMAIL=` / `ADMIN_PASSWORD=` with a comment.

## Files changed (~10)

**Frontend:**

- `src/_app/providers/auth-provider.tsx` — bootstrap effect + `status` 3-state
- `src/app/admin/layout.tsx` — respect `status`
- `src/app/student/layout.tsx` — respect `status`
- `src/app/account/page.tsx` — respect `status`
- `src/app/(public)/login/` — redirect when already authenticated
- `src/shared/api/client.ts` — retry-once guard

**Backend:**

- `src/main/java/com/lyceum157/hub/config/AdminBootstrapRunner.java` — new
- `src/main/java/com/lyceum157/hub/config/AppProperties.java` — `Admin` config record
- `src/main/resources/application.yml` — wire `app.admin.*` from env
- `deploy/.env.prod.example` — `ADMIN_EMAIL` / `ADMIN_PASSWORD`

## Error handling

- **Bootstrap refresh fails** (network error, expired/replayed token) → `tryRefresh()` sets the
  snapshot to `null` → `status` becomes `unauthenticated` → treated as logged out, no crash.
- **Retry guard** → after one failed retry, the original `ApiError` propagates to the caller.
- **Admin bootstrap** → blank config skips silently; existing email skips; creation failure logs
  `error` and startup continues.

## Testing & verification

**Frontend:**

- `pnpm typecheck`, `pnpm lint`, `pnpm test`.
- Unit tests: `AuthProvider` bootstrap `loading → authenticated` and `loading → unauthenticated`;
  `client.ts` retries at most once.
- Playwright e2e: log in → reload (F5) → still in the cabinet.

**Backend:**

- Test for `AdminBootstrapRunner`: creates the admin when absent; skips when the email exists;
  skips when config is blank.
- `./mvnw verify`.

**Manual on production:**

- Log in as admin and as student → F5 → still in the cabinet.
- Close and reopen the browser within 7 days → still logged in.

## Deployment

- Rebuild both Docker images (backend — runner + config; frontend — auth changes).
- On the VPS, add `ADMIN_EMAIL` / `ADMIN_PASSWORD` to `env/backend.env` before the backend
  rebuild so the admin is provisioned on first start.
