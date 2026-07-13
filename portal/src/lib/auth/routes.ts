/**
 * Route classification helpers for middleware and tests.
 * Keep authorization decisions here so redirects stay consistent.
 */

export const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password", "/accept-invite"] as const;

export const PROTECTED_CLIENT_PREFIXES = [
  "/dashboard",
  "/projects",
  "/support",
  "/account",
  "/files",
  "/billing",
] as const;

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isProtectedClientRoute(pathname: string): boolean {
  return PROTECTED_CLIENT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export type GuardProfile = {
  role: string | null;
  is_active: boolean;
} | null;

/**
 * Returns a redirect pathname, or null if the request may proceed.
 */
export function resolveMiddlewareRedirect(input: {
  pathname: string;
  hasUser: boolean;
  profile: GuardProfile;
}): string | null {
  const { pathname, hasUser, profile } = input;

  if (!hasUser && (isAdminRoute(pathname) || isProtectedClientRoute(pathname))) {
    return "/login";
  }

  if (hasUser && isAuthRoute(pathname) && pathname !== "/accept-invite" && pathname !== "/reset-password") {
    return profile?.role === "admin" ? "/admin" : "/dashboard";
  }

  if (hasUser && isAdminRoute(pathname)) {
    if (!profile?.is_active || profile.role !== "admin") {
      return "/dashboard";
    }
  }

  return null;
}
