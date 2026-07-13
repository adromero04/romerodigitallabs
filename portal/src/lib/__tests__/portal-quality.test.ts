import { describe, expect, it } from "vitest";
import {
  isAdminRoute,
  isAuthRoute,
  isProtectedClientRoute,
  resolveMiddlewareRedirect,
} from "@/lib/auth/routes";
import {
  canSubmitFinalApproval,
  canViewBilling,
  hasCapability,
  homePathForRole,
  isAdmin,
  isClientOwner,
  isClientUser,
} from "@/lib/permissions";
import { isAllowedUpload, maxUploadBytes } from "@/lib/files";
import { formatCurrency, formatDate, truncate } from "@/lib/format";

describe("route guards", () => {
  it("classifies auth, admin, and client routes", () => {
    expect(isAuthRoute("/login")).toBe(true);
    expect(isAuthRoute("/forgot-password")).toBe(true);
    expect(isAuthRoute("/dashboard")).toBe(false);
    expect(isAdminRoute("/admin")).toBe(true);
    expect(isAdminRoute("/admin/clients")).toBe(true);
    expect(isAdminRoute("/dashboard")).toBe(false);
    expect(isProtectedClientRoute("/dashboard")).toBe(true);
    expect(isProtectedClientRoute("/projects/abc")).toBe(true);
    expect(isProtectedClientRoute("/billing")).toBe(true);
    expect(isProtectedClientRoute("/login")).toBe(false);
  });

  it("sends unauthenticated users to login for protected routes", () => {
    expect(
      resolveMiddlewareRedirect({ pathname: "/dashboard", hasUser: false, profile: null }),
    ).toBe("/login");
    expect(
      resolveMiddlewareRedirect({ pathname: "/admin", hasUser: false, profile: null }),
    ).toBe("/login");
    expect(
      resolveMiddlewareRedirect({ pathname: "/login", hasUser: false, profile: null }),
    ).toBeNull();
  });

  it("redirects signed-in users away from login to their home", () => {
    expect(
      resolveMiddlewareRedirect({
        pathname: "/login",
        hasUser: true,
        profile: { role: "admin", is_active: true },
      }),
    ).toBe("/admin");
    expect(
      resolveMiddlewareRedirect({
        pathname: "/login",
        hasUser: true,
        profile: { role: "client_owner", is_active: true },
      }),
    ).toBe("/dashboard");
  });

  it("allows accept-invite and reset-password while signed in", () => {
    expect(
      resolveMiddlewareRedirect({
        pathname: "/accept-invite",
        hasUser: true,
        profile: { role: "client_owner", is_active: true },
      }),
    ).toBeNull();
    expect(
      resolveMiddlewareRedirect({
        pathname: "/reset-password",
        hasUser: true,
        profile: { role: "client_owner", is_active: true },
      }),
    ).toBeNull();
  });

  it("blocks clients from admin routes", () => {
    expect(
      resolveMiddlewareRedirect({
        pathname: "/admin/clients",
        hasUser: true,
        profile: { role: "client_owner", is_active: true },
      }),
    ).toBe("/dashboard");
    expect(
      resolveMiddlewareRedirect({
        pathname: "/admin",
        hasUser: true,
        profile: { role: "admin", is_active: false },
      }),
    ).toBe("/dashboard");
    expect(
      resolveMiddlewareRedirect({
        pathname: "/admin/projects",
        hasUser: true,
        profile: { role: "admin", is_active: true },
      }),
    ).toBeNull();
  });
});

describe("permissions", () => {
  const admin = { role: "admin" as const };
  const owner = { role: "client_owner" as const };
  const member = { role: "client_member" as const };

  it("identifies roles", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isClientUser(owner)).toBe(true);
    expect(isClientUser(member)).toBe(true);
    expect(isClientUser(admin)).toBe(false);
    expect(isClientOwner(owner)).toBe(true);
    expect(isClientOwner(member)).toBe(false);
  });

  it("limits billing and final approval to owners and admins", () => {
    expect(canViewBilling(admin)).toBe(true);
    expect(canViewBilling(owner)).toBe(true);
    expect(canViewBilling(member)).toBe(false);
    expect(canSubmitFinalApproval(member)).toBe(false);
    expect(canSubmitFinalApproval(owner)).toBe(true);
  });

  it("maps home paths and capabilities", () => {
    expect(homePathForRole("admin")).toBe("/admin");
    expect(homePathForRole("client_owner")).toBe("/dashboard");
    expect(hasCapability(admin, "manage_clients")).toBe(true);
    expect(hasCapability(owner, "manage_projects")).toBe(false);
    expect(hasCapability(owner, "view_billing")).toBe(true);
    expect(hasCapability(member, "invite_users")).toBe(false);
  });
});

describe("file uploads", () => {
  it("rejects oversized files", () => {
    const max = maxUploadBytes();
    expect(
      isAllowedUpload({ name: "big.pdf", type: "application/pdf", size: max + 1 }),
    ).toMatch(/too large/i);
  });

  it("accepts common document types", () => {
    expect(isAllowedUpload({ name: "brief.pdf", type: "application/pdf", size: 1024 })).toBeNull();
    expect(isAllowedUpload({ name: "logo.png", type: "image/png", size: 2048 })).toBeNull();
    expect(isAllowedUpload({ name: "notes.txt", type: "text/plain", size: 100 })).toBeNull();
  });

  it("rejects unsupported types", () => {
    expect(isAllowedUpload({ name: "malware.exe", type: "application/x-msdownload", size: 10 })).toMatch(
      /not supported/i,
    );
  });
});

describe("format helpers", () => {
  it("formats currency and dates", () => {
    expect(formatCurrency(175)).toMatch(/175/);
    expect(formatDate("2026-07-12")).toMatch(/2026/);
    expect(formatDate(null)).toBe("—");
  });

  it("truncates long text", () => {
    expect(truncate("short")).toBe("short");
    expect(truncate("a".repeat(200), 40).endsWith("…")).toBe(true);
  });
});
