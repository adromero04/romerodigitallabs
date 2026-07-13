import type { Profile, UserRole } from "@/types/database";

export function isAdmin(profile: Pick<Profile, "role"> | null | undefined): boolean {
  return profile?.role === "admin";
}

export function isClientUser(profile: Pick<Profile, "role"> | null | undefined): boolean {
  return profile?.role === "client_owner" || profile?.role === "client_member";
}

export function isClientOwner(profile: Pick<Profile, "role"> | null | undefined): boolean {
  return profile?.role === "client_owner";
}

/** Financial / final-approval capabilities — owners (and admins) only for MVP. */
export function canViewBilling(profile: Pick<Profile, "role"> | null | undefined): boolean {
  return isAdmin(profile) || isClientOwner(profile);
}

export function canSubmitFinalApproval(profile: Pick<Profile, "role"> | null | undefined): boolean {
  return isAdmin(profile) || isClientOwner(profile);
}

export function homePathForRole(role: UserRole | null | undefined): string {
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export type Capability =
  | "manage_clients"
  | "manage_projects"
  | "view_billing"
  | "submit_approval"
  | "invite_users";

export function hasCapability(
  profile: Pick<Profile, "role"> | null | undefined,
  capability: Capability,
): boolean {
  switch (capability) {
    case "manage_clients":
    case "manage_projects":
    case "invite_users":
      return isAdmin(profile);
    case "view_billing":
      return canViewBilling(profile);
    case "submit_approval":
      return canSubmitFinalApproval(profile);
    default:
      return false;
  }
}
