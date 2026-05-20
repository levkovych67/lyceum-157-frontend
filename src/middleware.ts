import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/parent/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  }

  // Route protection for /student, /admin, /account is enforced client-side by the
  // role layouts (useAuth) and by the backend (@PreAuthorize on every endpoint).
  // The previous middleware cookie-gate was removed: the refresh_token cookie is
  // host-scoped to the api. subdomain with path /api/v1/auth, so it is never present
  // on requests to the apex frontend host — the gate always falsely redirected to /login.
  return NextResponse.next();
}

export const config = {
  matcher: ["/parent/:path*"],
};
