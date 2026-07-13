import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { isAdminRoute, isAuthRoute, resolveMiddlewareRedirect } from "@/lib/auth/routes";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createMiddlewareClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  let profile: { role: string | null; is_active: boolean } | null = null;

  const needsProfile =
    Boolean(user) &&
    ((isAuthRoute(pathname) && pathname !== "/accept-invite" && pathname !== "/reset-password") ||
      isAdminRoute(pathname));

  if (user && needsProfile) {
    const { data } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  const redirectPath = resolveMiddlewareRedirect({
    pathname,
    hasUser: Boolean(user),
    profile,
  });

  if (redirectPath) {
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    if (redirectPath === "/login") {
      url.searchParams.set("next", pathname);
    } else {
      url.search = "";
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
