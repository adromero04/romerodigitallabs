/**
 * Single source for admin nav items (sidebar + mobile tab bar).
 * `symbol` = Material Symbols Outlined ligature name.
 */
export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", symbol: "dashboard" },
  { href: "/admin/brewmote", label: "Brewmote", symbol: "local_cafe" },
  { href: "/admin/simplelist", label: "SimpleList", symbol: "checklist" },
  { href: "/admin/combined", label: "Combined", symbol: "hub" },
  { href: "/admin/settings", label: "Settings", symbol: "settings" },
] as const;

export type AdminNavItem = (typeof ADMIN_NAV)[number];
