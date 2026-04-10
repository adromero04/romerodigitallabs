/**
 * Edge middleware: protects `/admin` UI and `/api/admin` JSON routes.
 *
 * Supabase credentials are never read here — only the signed admin session cookie.
 * Login and logout API routes stay public so you can obtain or clear the cookie.
 *
 * See `admin/AUTH.md` for the full auth file map.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeAdminNextPath } from "@/lib/auth/safeAdminNext";
import { getAdminCookieName, verifyAdminSessionToken } from "@/server/auth/adminSessionTokens";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(getAdminCookieName())?.value;
    const authed = token ? await verifyAdminSessionToken(token) : false;
    if (authed) {
      const dest = safeAdminNextPath(request.nextUrl.searchParams.get("next"));
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return NextResponse.next();
  }
  if (pathname === "/api/admin/login" || pathname === "/api/admin/logout") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(getAdminCookieName())?.value;
    const ok = token ? await verifyAdminSessionToken(token) : false;
    if (!ok) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  /** Include `/admin` exactly so the dashboard root is never reachable without a session. */
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
