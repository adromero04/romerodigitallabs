/**
 * Open-redirect guard for post-login navigation.
 * Only same-origin relative paths under `/admin` are allowed (middleware only ever sets `next` from pathname).
 */
export function safeAdminNextPath(raw: string | null | undefined): string {
  if (!raw) return "/admin";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  if (!raw.startsWith("/admin")) return "/admin";
  return raw;
}
