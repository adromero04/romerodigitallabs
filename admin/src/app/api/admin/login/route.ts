/**
 * Sets the admin session cookie after verifying `ADMIN_PASSWORD` (single operator).
 * Server-only; credentials never leave this process except as an HTTP-only cookie.
 */
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_MAX_AGE_SEC,
  adminSessionCookieOptions,
  createAdminSessionToken,
  getAdminCookieName,
} from "@/server/auth/adminSessionTokens";
import { timingSafeComparePassword } from "@/server/auth/adminPassword";

export async function POST(request: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!timingSafeComparePassword(body.password ?? "", adminPassword)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await createAdminSessionToken();
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.headers.set("Cache-Control", "no-store");
  res.cookies.set(getAdminCookieName(), token, adminSessionCookieOptions(ADMIN_SESSION_MAX_AGE_SEC));
  return res;
}
