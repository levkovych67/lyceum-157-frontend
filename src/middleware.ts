import { NextRequest, NextResponse } from "next/server";

const ROLE_PROTECTED = ["/student", "/admin", "/account"] as const;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/parent/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return res;
  }

  for (const prefix of ROLE_PROTECTED) {
    if (pathname.startsWith(prefix)) {
      const hasRefresh = req.cookies.has("refresh_token");
      if (!hasRefresh) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/account", "/parent/:path*"],
};
