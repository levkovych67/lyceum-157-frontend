# Auth Session Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A logged-in admin or student stays logged in across page reloads (F5), and the production admin account is provisioned automatically from environment variables.

**Architecture:** Frontend — `AuthProvider` gains an explicit 3-state `status` (`loading`/`authenticated`/`unauthenticated`) and runs a one-shot `tryRefresh()` on mount; route guards wait on `loading` instead of redirecting. Backend — a profile-gated `ApplicationRunner` creates the first `ADMIN` user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` on startup. Plus two small hardening fixes in the same files.

**Tech Stack:** Frontend — Next.js 14 (App Router), TypeScript, React, Vitest + Testing Library, Playwright. Backend — Java 21, Spring Boot 3.4, JUnit 5 + Mockito + AssertJ.

**Source spec:** `docs/superpowers/specs/2026-05-20-auth-session-fix-design.md`

---

## Before you start

This change spans **two git repositories**:

- **Backend repo:** `lyceum157/v1/lyceum-157-backend/` — Tasks 1–2.
- **Frontend repo:** `lyceum157/v1/lyceum-157-frontend/` — Tasks 3–8.

All paths in a task are relative to that task's repo root. Run each task's commands from
that repo's root directory. Tasks 1–2 and 3–8 are independent — either repo can be done first.

**Commit trailer.** End every commit message in this plan with this trailer line (preceded by a blank line):

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

The commit commands below show the message subject only; append the trailer to each.

**Pre-existing uncommitted changes.** The frontend repo already has uncommitted hotfix edits
(`src/middleware.ts`, `src/shared/api/client.ts`, `src/shared/api/refresh.ts`) from the earlier
URL/CORS/middleware fixes, plus unrelated visual-rework work-in-progress. Each task below stages
**only its own named files** — never `git add -A`.

---

## Task 1: Backend — admin bootstrap config

**Repo:** `lyceum157/v1/lyceum-157-backend`

**Files:**
- Create: `src/main/java/com/lyceum157/hub/config/AdminBootstrapProperties.java`
- Modify: `src/main/resources/application.yml`
- Modify (no commit — not version-controlled): `../deploy/.env.prod.example`

- [ ] **Step 1: Create the config record**

Create `src/main/java/com/lyceum157/hub/config/AdminBootstrapProperties.java`:

```java
package com.lyceum157.hub.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Optional credentials for the production admin bootstrap (see {@code AdminBootstrapRunner}).
 *
 * <p>Both fields are blank/absent on the {@code local} profile, where {@code DevSeedRunner}
 * seeds a dev admin instead. Not validated — a blank value means "no bootstrap". Auto-registered
 * by the {@code @ConfigurationPropertiesScan} on the {@code config} package.
 */
@ConfigurationProperties(prefix = "app.admin")
public record AdminBootstrapProperties(String bootstrapEmail, String bootstrapPassword) {}
```

- [ ] **Step 2: Wire the config in `application.yml`**

In `src/main/resources/application.yml`, find:

```yaml
app:
  frontend-url: ${FRONTEND_URL:http://localhost:3000}
  email:
```

Replace it with:

```yaml
app:
  frontend-url: ${FRONTEND_URL:http://localhost:3000}
  admin:
    # Production admin bootstrap (AdminBootstrapRunner). Blank on the local profile —
    # DevSeedRunner seeds a dev admin there instead. When both are set on a non-local
    # profile, an ADMIN user is created on first startup if it does not already exist.
    bootstrap-email: ${ADMIN_EMAIL:}
    bootstrap-password: ${ADMIN_PASSWORD:}
  email:
```

- [ ] **Step 3: Verify it compiles**

Run: `./mvnw -q compile`
Expected: BUILD SUCCESS, no errors.

- [ ] **Step 4: Format and commit**

Run: `./mvnw -q spotless:apply`

```bash
git add src/main/java/com/lyceum157/hub/config/AdminBootstrapProperties.java src/main/resources/application.yml
git commit -m "feat(config): add app.admin bootstrap properties"
```

- [ ] **Step 5: Update the deploy env template**

In `lyceum157/v1/deploy/.env.prod.example`, find:

```
# === Self-generated secrets (auto-filled by installer) ===
APP_AES_SECRET=
JWT_SECRET=
```

Replace it with:

```
# === Self-generated secrets (auto-filled by installer) ===
APP_AES_SECRET=
JWT_SECRET=

# === Admin bootstrap (first ADMIN account — created on first backend start) ===
# Set both to provision the production admin. Treated as a secret (.env is 0600).
# Recommended: change the password after first login. Leave blank to skip.
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

No commit — `deploy/` is not a git repository; this is an informational template edit.

---

## Task 2: Backend — `AdminBootstrapRunner`

**Repo:** `lyceum157/v1/lyceum-157-backend`

**Files:**
- Create: `src/main/java/com/lyceum157/hub/config/AdminBootstrapRunner.java`
- Test: `src/test/java/com/lyceum157/hub/config/AdminBootstrapRunnerTest.java`

- [ ] **Step 1: Write the failing test**

Create `src/test/java/com/lyceum157/hub/config/AdminBootstrapRunnerTest.java`:

```java
package com.lyceum157.hub.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.lyceum157.hub.domain.identity.model.User;
import com.lyceum157.hub.domain.identity.model.UserRole;
import com.lyceum157.hub.domain.identity.persistence.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

class AdminBootstrapRunnerTest {

  private final UserRepository userRepo = mock(UserRepository.class);
  private final PasswordEncoder encoder = mock(PasswordEncoder.class);

  private AdminBootstrapRunner runner(String email, String password) {
    return new AdminBootstrapRunner(
        new AdminBootstrapProperties(email, password), userRepo, encoder);
  }

  @Test
  void createsAdmin_whenConfiguredAndAbsent() {
    when(userRepo.existsByEmail("admin@lyceum.test")).thenReturn(false);
    when(encoder.encode("s3cret")).thenReturn("HASHED");

    runner("admin@lyceum.test", "s3cret").run(null);

    ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
    verify(userRepo).save(captor.capture());
    assertThat(captor.getValue().getEmail()).isEqualTo("admin@lyceum.test");
    assertThat(captor.getValue().getRole()).isEqualTo(UserRole.ADMIN);
  }

  @Test
  void skips_whenAdminEmailAlreadyExists() {
    when(userRepo.existsByEmail("admin@lyceum.test")).thenReturn(true);

    runner("admin@lyceum.test", "s3cret").run(null);

    verify(userRepo, never()).save(any());
  }

  @Test
  void skips_whenConfigBlank() {
    runner("", "").run(null);

    verify(userRepo, never()).existsByEmail(any());
    verify(userRepo, never()).save(any());
  }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `./mvnw -q test -Dtest=AdminBootstrapRunnerTest`
Expected: COMPILATION FAILURE — `AdminBootstrapRunner` does not exist yet.

- [ ] **Step 3: Write the runner**

Create `src/main/java/com/lyceum157/hub/config/AdminBootstrapRunner.java`:

```java
package com.lyceum157.hub.config;

import com.lyceum157.hub.api.mapper.EmailMasker;
import com.lyceum157.hub.domain.identity.model.User;
import com.lyceum157.hub.domain.identity.persistence.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the production ADMIN account on first startup from {@code ADMIN_EMAIL} /
 * {@code ADMIN_PASSWORD}.
 *
 * <p>Idempotent — skips if the email already exists. Best-effort — a failure is logged but does
 * not abort startup. Gated to non-local profiles; {@code DevSeedRunner} handles {@code local}.
 */
@Component
@Profile("!local")
@Order(100)
public class AdminBootstrapRunner implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

  private final AdminBootstrapProperties props;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public AdminBootstrapRunner(
      AdminBootstrapProperties props,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder) {
    this.props = props;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    String email = props.bootstrapEmail();
    String password = props.bootstrapPassword();
    if (email == null || email.isBlank() || password == null || password.isBlank()) {
      log.info("Admin bootstrap: ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping");
      return;
    }
    if (userRepository.existsByEmail(email)) {
      log.info("Admin bootstrap: admin {} already exists — skipping", EmailMasker.mask(email));
      return;
    }
    try {
      User admin = User.createAdmin(email, passwordEncoder.encode(password));
      userRepository.save(admin);
      log.info("Admin bootstrap: created ADMIN account {}", EmailMasker.mask(email));
    } catch (RuntimeException e) {
      log.error("Admin bootstrap: failed to create admin account", e);
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `./mvnw -q test -Dtest=AdminBootstrapRunnerTest`
Expected: PASS — 3 tests green.

- [ ] **Step 5: Format and commit**

Run: `./mvnw -q spotless:apply`

```bash
git add src/main/java/com/lyceum157/hub/config/AdminBootstrapRunner.java src/test/java/com/lyceum157/hub/config/AdminBootstrapRunnerTest.java
git commit -m "feat(config): bootstrap production admin from env on startup"
```

---

## Task 3: Frontend — bound the `client.ts` 401 retry

**Repo:** `lyceum157/v1/lyceum-157-frontend`

The post-401 refresh-and-retry in `api()` recurses with no bound: if the retried request also
401s it refreshes and retries again. Bound it to exactly one retry via an internal flag.

**Files:**
- Modify: `src/shared/api/client.ts`
- Test: `tests/unit/api/client.test.ts`

- [ ] **Step 1: Write the failing test**

Append this test inside the `describe("api client", ...)` block in `tests/unit/api/client.test.ts`, before the closing `});`:

```ts
  it("does NOT retry a second time when the retried request also 401s", async () => {
    const events: string[] = [];
    const handler = (e: Event) => events.push(e.type);
    window.addEventListener("auth:logout-required", handler);
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({
          status: 401,
          title: "U",
          type: "",
          detail: "",
          instance: "",
          timestamp: "",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "Content-Type": "application/json" }),
        json: async () => ({ accessToken: "new", expiresIn: 900, userId: "u", role: "STUDENT" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers(),
        json: async () => ({
          status: 401,
          title: "U",
          type: "",
          detail: "",
          instance: "",
          timestamp: "",
        }),
      });
    await expect(api("/protected")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(events).toContain("auth:logout-required");
    window.removeEventListener("auth:logout-required", handler);
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/unit/api/client.test.ts -t "does NOT retry a second time"`
Expected: FAIL — `fetchMock` is called more than 3 times (unbounded retry loop), or the run hangs/loops.

- [ ] **Step 3: Implement the retry guard**

In `src/shared/api/client.ts`, change the function signature on line 12 from:

```ts
export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
```

to:

```ts
export async function api<T>(path: string, opts: ApiOptions = {}, _retry = false): Promise<T> {
```

Then replace the `401` block (currently):

```ts
  if (res.status === 401 && opts.auth !== false && !path.startsWith("/api/v1/auth/")) {
    const refresh = await tryRefresh();
    if (refresh.ok) return api<T>(path, opts);
    if (typeof window !== "undefined") {
      if (refresh.reason === "replay") {
        window.dispatchEvent(
          new CustomEvent("auth:security-incident", { detail: { kind: "refresh-replay" } }),
        );
      }
      window.dispatchEvent(new Event("auth:logout-required"));
    }
  }
```

with:

```ts
  if (res.status === 401 && opts.auth !== false && !path.startsWith("/api/v1/auth/")) {
    if (_retry) {
      // Already retried once with a fresh token and still 401 — stop, force logout.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:logout-required"));
      }
    } else {
      const refresh = await tryRefresh();
      if (refresh.ok) return api<T>(path, opts, true);
      if (typeof window !== "undefined") {
        if (refresh.reason === "replay") {
          window.dispatchEvent(
            new CustomEvent("auth:security-incident", { detail: { kind: "refresh-replay" } }),
          );
        }
        window.dispatchEvent(new Event("auth:logout-required"));
      }
    }
  }
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/api/client.test.ts`
Expected: PASS — all tests green, including the existing "retries once after 401 + successful refresh" and the new "does NOT retry a second time".

- [ ] **Step 5: Commit**

```bash
git add src/shared/api/client.ts tests/unit/api/client.test.ts
git commit -m "fix(api): bound the post-401 retry to a single attempt"
```

---

## Task 4: Frontend — `AuthProvider` 3-state + session bootstrap

**Repo:** `lyceum157/v1/lyceum-157-frontend`

**Files:**
- Modify: `src/_app/providers/auth-provider.tsx`
- Test: `tests/component/providers/auth-provider.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `tests/component/providers/auth-provider.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthProvider, useAuth } from "@/_app/providers/auth-provider";
import { setSnapshot } from "@/shared/api/auth-token";

vi.mock("@/shared/api/refresh", () => ({
  tryRefresh: vi.fn(),
}));
import { tryRefresh } from "@/shared/api/refresh";

function Probe() {
  const { status } = useAuth();
  return <div data-testid="status">{status}</div>;
}

describe("AuthProvider bootstrap", () => {
  beforeEach(() => {
    setSnapshot(null);
    vi.mocked(tryRefresh).mockReset();
  });

  it("goes loading -> authenticated when the bootstrap refresh succeeds", async () => {
    vi.mocked(tryRefresh).mockImplementation(async () => {
      setSnapshot({
        accessToken: "t",
        userId: "u",
        role: "STUDENT",
        expiresAt: Date.now() + 1_000_000,
      });
      return { ok: true };
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("authenticated"));
  });

  it("goes loading -> unauthenticated when the bootstrap refresh fails", async () => {
    vi.mocked(tryRefresh).mockResolvedValue({ ok: false, reason: "expired" });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("status")).toHaveTextContent("loading");
    await waitFor(() => expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated"));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test tests/component/providers/auth-provider.test.tsx`
Expected: FAIL — `status` is `undefined` (not yet on the context), so `getByTestId("status")` never has text content "loading"/"authenticated".

- [ ] **Step 3: Implement the 3-state provider**

Replace the entire contents of `src/_app/providers/auth-provider.tsx` with:

```tsx
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  subscribe,
  getSnapshot,
  setSnapshot,
  REFRESH_PROACTIVE_MS,
  type TokenSnapshot,
  type Role,
} from "@/shared/api";
import { logout as apiLogout } from "@/shared/api/generated/auth/auth";
import { tryRefresh } from "@/shared/api/refresh";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type Ctx = {
  user: TokenSnapshot | null;
  role: Role | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [bootstrapped, setBootstrapped] = useState(false);

  // One-shot session bootstrap: on first mount, restore the session from the
  // refresh_token cookie. Until this resolves, status is "loading" so route
  // guards wait instead of redirecting to /login.
  useEffect(() => {
    let cancelled = false;
    if (getSnapshot()) {
      setBootstrapped(true);
      return;
    }
    void tryRefresh().finally(() => {
      if (!cancelled) setBootstrapped(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      setSnapshot(null);
      if (typeof window !== "undefined") window.location.href = "/login";
    };
    window.addEventListener("auth:logout-required", handler);
    return () => window.removeEventListener("auth:logout-required", handler);
  }, []);

  useEffect(() => {
    if (!snap) return;
    const ms = snap.expiresAt - Date.now() - REFRESH_PROACTIVE_MS;
    if (ms <= 0) {
      void tryRefresh();
      return;
    }
    const t = setTimeout(() => {
      void tryRefresh();
    }, ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap?.expiresAt]);

  const value = useMemo<Ctx>(() => {
    const status: AuthStatus = !bootstrapped
      ? "loading"
      : snap
        ? "authenticated"
        : "unauthenticated";
    return {
      user: snap,
      role: snap?.role ?? null,
      status,
      isAuthenticated: status === "authenticated",
      logout: async () => {
        await apiLogout().catch(() => {});
        setSnapshot(null);
      },
    };
  }, [snap, bootstrapped]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): Ctx {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test tests/component/providers/auth-provider.test.tsx`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/_app/providers/auth-provider.tsx tests/component/providers/auth-provider.test.tsx
git commit -m "feat(auth): bootstrap session on mount with 3-state AuthProvider"
```

---

## Task 5: Frontend — role layouts respect `status`

**Repo:** `lyceum157/v1/lyceum-157-frontend`

The role layouts must show the existing splash while `status === "loading"` and only redirect
once `status === "unauthenticated"`. These are integration glue — verified by `typecheck` here
and by the e2e in Task 8, not by isolated unit tests.

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/app/student/layout.tsx`

- [ ] **Step 1: Update the admin layout**

Replace the entire contents of `src/app/admin/layout.tsx` with:

```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { RoleGateSplash, RoleSectionShell } from "@/widgets/role-section-shell";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { status, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, role, router]);
  if (status !== "authenticated" || role !== "ADMIN") return <RoleGateSplash />;
  return <RoleSectionShell role="admin">{children}</RoleSectionShell>;
}
```

- [ ] **Step 2: Update the student layout**

Replace the entire contents of `src/app/student/layout.tsx` with:

```tsx
"use client";
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { RoleGateSplash, RoleSectionShell } from "@/widgets/role-section-shell";

export const dynamic = "force-dynamic";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { status, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (role !== "STUDENT") {
      router.replace("/");
    }
  }, [status, role, router]);
  if (status !== "authenticated" || role !== "STUDENT") return <RoleGateSplash />;
  return <RoleSectionShell role="student">{children}</RoleSectionShell>;
}
```

- [ ] **Step 3: Verify types**

Run: `pnpm typecheck`
Expected: PASS — no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/app/student/layout.tsx
git commit -m "fix(auth): role layouts wait for bootstrap before redirecting"
```

---

## Task 6: Frontend — account page respects `status`

**Repo:** `lyceum157/v1/lyceum-157-frontend`

**Files:**
- Modify: `src/app/account/page.tsx`

- [ ] **Step 1: Update the account page**

Replace the entire contents of `src/app/account/page.tsx` with:

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";
import { AccountScreen } from "@/views/account";

export default function Page() {
  const { status, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (role === "ADMIN") router.replace("/admin");
  }, [status, role, router]);
  if (status !== "authenticated" || role === "ADMIN") return null;
  return <AccountScreen />;
}
```

- [ ] **Step 2: Verify types**

Run: `pnpm typecheck`
Expected: PASS — no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/account/page.tsx
git commit -m "fix(auth): account page waits for bootstrap before redirecting"
```

---

## Task 7: Frontend — redirect an authenticated visitor away from `/login`

**Repo:** `lyceum157/v1/lyceum-157-frontend`

The `/login` page (`page.tsx`) is a Server Component (it exports `metadata`), so the redirect
goes in a small dedicated client component in the same route directory. This keeps the change
inside `app/` (which may import `_app/` — the role layouts already do) and avoids touching the
`views`/`features` layers, which FSD boundaries forbid from importing `_app/`.

**Files:**
- Create: `src/app/(public)/login/redirect-if-authenticated.tsx`
- Modify: `src/app/(public)/login/page.tsx`

- [ ] **Step 1: Create the redirect component**

Create `src/app/(public)/login/redirect-if-authenticated.tsx`:

```tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/_app/providers/auth-provider";

/** Sends an already-authenticated visitor away from /login to their role home. */
export function RedirectIfAuthenticated() {
  const { status, role } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(role === "ADMIN" ? "/admin" : "/account");
  }, [status, role, router]);
  return null;
}
```

- [ ] **Step 2: Render it from the login page**

Replace the entire contents of `src/app/(public)/login/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { LoginScreen } from "@/views/login";
import { RedirectIfAuthenticated } from "./redirect-if-authenticated";

export const metadata: Metadata = {
  title: "Вхід · Майстерня 157",
  description: "Вхід для учнів і адміністраторів Майстерні 157.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <>
      <RedirectIfAuthenticated />
      <LoginScreen />
    </>
  );
}
```

- [ ] **Step 3: Verify types and lint**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS — no type errors, no ESLint/FSD-boundary violations.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/login/redirect-if-authenticated.tsx" "src/app/(public)/login/page.tsx"
git commit -m "feat(auth): redirect authenticated visitors away from /login"
```

---

## Task 8: Frontend — end-to-end coverage

**Repo:** `lyceum157/v1/lyceum-157-frontend`

Removing the middleware cookie-gate (done in the earlier hotfix) makes route protection
client-side and asynchronous. The existing `role-redirects.spec.ts` asserts the URL
**synchronously** right after `goto`, which no longer holds — it must wait for the client
redirect. A new spec proves the F5 fix.

**Files:**
- Modify: `tests/e2e/role-redirects.spec.ts`
- Create: `tests/e2e/session-persistence.spec.ts`

- [ ] **Step 1: Update `role-redirects.spec.ts`**

Replace the entire contents of `tests/e2e/role-redirects.spec.ts` with:

```ts
import { test, expect, type Page } from "@playwright/test";

// Route protection is now client-side (role layouts): with no session the bootstrap
// refresh fails and the layout redirects to /login. Mock refresh -> 401 for determinism,
// and wait for the async client redirect instead of asserting the URL synchronously.
async function mockNoSession(page: Page) {
  await page.route("**/api/v1/auth/refresh", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/problem+json",
      body: JSON.stringify({
        type: "urn:l157:auth/refresh-expired",
        title: "Expired",
        status: 401,
        detail: "",
        instance: "/api/v1/auth/refresh",
        timestamp: new Date().toISOString(),
      }),
    }),
  );
}

test("@smoke /student without session redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  await mockNoSession(page);
  await page.goto("/student");
  await page.waitForURL(/\/login/);
  expect(page.url()).toContain("/login");
});

test("@smoke /admin without session redirects to /login", async ({ page }) => {
  await page.context().clearCookies();
  await mockNoSession(page);
  await page.goto("/admin");
  await page.waitForURL(/\/login/);
  expect(page.url()).toContain("/login");
});

test("@smoke /parent/kyc/x has noindex header", async ({ request }) => {
  const r = await request.get("/parent/kyc/anything");
  const robots = r.headers()["x-robots-tag"];
  expect(robots).toContain("noindex");
});
```

- [ ] **Step 2: Create the session-persistence spec**

Create `tests/e2e/session-persistence.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

// Proves the F5 fix: a valid refresh_token cookie restores the session on page load,
// so reloading a protected page keeps the user in instead of bouncing to /login.
// The bootstrap refresh is mocked to succeed; we assert the URL never lands on /login.
test("session survives a page reload", async ({ page }) => {
  await page.route("**/api/v1/auth/refresh", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        accessToken: "e2e-access-token",
        expiresIn: 900,
        userId: "11111111-1111-1111-1111-111111111111",
        role: "STUDENT",
        tokenType: "Bearer",
      }),
    }),
  );

  await page.goto("/account");
  await page.waitForResponse("**/api/v1/auth/refresh");
  await page.waitForLoadState("networkidle");
  expect(page.url()).toContain("/account");
  expect(page.url()).not.toContain("/login");

  await page.reload();
  await page.waitForResponse("**/api/v1/auth/refresh");
  await page.waitForLoadState("networkidle");
  expect(page.url()).toContain("/account");
  expect(page.url()).not.toContain("/login");
});
```

- [ ] **Step 3: Run the e2e suite**

Run: `pnpm e2e tests/e2e/role-redirects.spec.ts tests/e2e/session-persistence.spec.ts`
Expected: PASS — 4 tests green (3 role-redirects + 1 session-persistence).

Note: `pnpm e2e` builds and starts the app via `pnpm start`. If a stale dev/prod server
is already on port 3000 it is reused; otherwise allow ~2 min for the first build.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/role-redirects.spec.ts tests/e2e/session-persistence.spec.ts
git commit -m "test(e2e): cover session bootstrap and reload survival"
```

---

## Final verification

**Backend** (`lyceum157/v1/lyceum-157-backend`):

- [ ] `./mvnw -q spotless:check` — formatting clean.
- [ ] `./mvnw -q test -Dtest=AdminBootstrapRunnerTest` — runner tests green.
- [ ] `./mvnw -q test` — full unit suite green (no regressions).

**Frontend** (`lyceum157/v1/lyceum-157-frontend`):

- [ ] `pnpm typecheck` — no type errors.
- [ ] `pnpm lint` — no ESLint / FSD-boundary violations.
- [ ] `pnpm test` — full Vitest suite green (no regressions).
- [ ] `pnpm e2e --grep @smoke` — smoke e2e green.

## Deployment & manual verification

1. On the VPS, add to `/opt/lyceum157/env/backend.env`:
   ```
   ADMIN_EMAIL=<the admin email>
   ADMIN_PASSWORD=<a strong password>
   ```
2. Rebuild both images and restart:
   ```bash
   cd /opt/lyceum157
   docker compose build --pull backend frontend
   docker compose up -d backend frontend
   ```
3. Confirm in the backend logs: `Admin bootstrap: created ADMIN account ...` (first run) or
   `... already exists — skipping` (subsequent runs).
4. In an incognito window on `https://lyceum157-kiev.shop`:
   - Log in as the admin → lands in `/admin`. Press **F5** → still in `/admin`.
   - Log in as a student → lands in the cabinet. Press **F5** → still in the cabinet.
   - Close the browser, reopen within 7 days, open the site → still logged in.
   - While logged in, open `/login` → redirected to `/admin` or `/account`.
