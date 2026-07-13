import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Handles OAuth / magic-link / invite / recovery code exchange.
 * Configure this URL in Supabase Auth redirect allow list:
 *   http://localhost:3020/auth/callback
 *   https://portal.romerodigitallabs.com/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/accept-invite";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
