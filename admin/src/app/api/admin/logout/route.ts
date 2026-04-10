/**
 * Clears the admin session cookie and sends the browser back to the login page.
 */
import { NextRequest, NextResponse } from "next/server";
import { adminSessionClearCookieOptions, getAdminCookieName } from "@/server/auth/adminSessionTokens";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(getAdminCookieName(), "", adminSessionClearCookieOptions());
  return res;
}
