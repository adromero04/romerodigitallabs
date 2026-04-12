import "server-only";

import { normalizeEmailSearchParam, parseUuidParam } from "@/lib/admin/queryGuards";
import {
  getRecentUsers,
  getSimpleListAdminClient,
  getUserSignupTrend,
  isSimpleListIntegrationConfigured,
  searchUsersByEmail,
  SIMPLELIST_DISABLED_GUIDE,
} from "@/lib/supabase/simplelist-admin";
import type {
  SimpleListUsersOverviewResult,
  SimpleListUserSearchResult,
  UserListsResult,
  UserTrendResult,
} from "@/server/admin/loadResultTypes";
import { publicLoadError, publicSupabaseMessage } from "@/server/safePublicError";

export type {
  SimpleListUsersOverviewResult,
  SimpleListUserSearchResult,
  UserListsResult,
  UserTrendResult,
} from "@/server/admin/loadResultTypes";

// ——— TODO(SimpleList): Set to your `public` table names, or leave `null` for a clear UI callout. ———

/** Lists table for the `listsForUser` search query. */
export const SIMPLELIST_TABLE_LISTS: string | null = null;

/**
 * Foreign key column on `SIMPLELIST_TABLE_LISTS` pointing at `auth.users.id`.
 * TODO(SimpleList): Rename if you use `owner_id`, `profile_id`, etc.
 */
export const SIMPLELIST_LISTS_USER_ID_COLUMN = "user_id";

const LISTS_PER_USER_LIMIT = 100;

export async function loadSimpleListUsersOverview(): Promise<SimpleListUsersOverviewResult> {
  if (!isSimpleListIntegrationConfigured()) {
    return { status: "not_configured", message: SIMPLELIST_DISABLED_GUIDE };
  }

  const [trendSettled, recentSettled] = await Promise.allSettled([
    getUserSignupTrend(),
    getRecentUsers(12),
  ]);

  if (trendSettled.status === "rejected") {
    return { status: "error", message: publicLoadError("simplelist.usersOverview", trendSettled.reason) };
  }

  const trendData = trendSettled.value;
  const trend: UserTrendResult = { ok: true, data: trendData };

  if (recentSettled.status === "fulfilled") {
    return {
      status: "success",
      total: trendData.totalUsers,
      recent: recentSettled.value,
      trend,
    };
  }

  return {
    status: "success",
    total: trendData.totalUsers,
    recent: [],
    trend,
    recentError: publicLoadError("simplelist.usersOverview.recent", recentSettled.reason),
  };
}

export async function loadSimpleListUserSearch(email: string | undefined): Promise<SimpleListUserSearchResult> {
  const normalized = normalizeEmailSearchParam(email);
  if (!normalized) return { status: "idle" };
  if (!isSimpleListIntegrationConfigured()) {
    return { status: "not_configured", message: SIMPLELIST_DISABLED_GUIDE };
  }
  try {
    const users = await searchUsersByEmail(normalized);
    if (users.length === 0) return { status: "empty" };
    return { status: "success", users };
  } catch (e) {
    return { status: "error", message: publicLoadError("simplelist.userSearch", e) };
  }
}

/**
 * Lists for a selected auth user (`listsForUser` query param = UUID).
 * TODO(SimpleList): Add `.order('created_at', { ascending: false })` when you confirm column names.
 */
export async function loadSimpleListListsForUser(userId: string | undefined): Promise<UserListsResult> {
  const trimmed = userId?.trim();
  if (!trimmed) return { status: "idle" };

  if (!isSimpleListIntegrationConfigured()) {
    return { status: "not_configured", message: SIMPLELIST_DISABLED_GUIDE };
  }

  const parsed = parseUuidParam(trimmed);
  if (!parsed.ok) {
    return {
      status: "invalid_param",
      message:
        process.env.NODE_ENV === "production"
          ? "That user id isn’t valid."
          : "Use a valid user id (the same id shown next to each account in search).",
    };
  }

  if (!SIMPLELIST_TABLE_LISTS) {
    return {
      status: "not_configured",
      message: "Lists lookup isn’t connected in this admin build yet.",
    };
  }
  try {
    const supabase = getSimpleListAdminClient();
    const { data, error } = await supabase
      .from(SIMPLELIST_TABLE_LISTS)
      .select("*")
      .eq(SIMPLELIST_LISTS_USER_ID_COLUMN, parsed.uuid)
      .limit(LISTS_PER_USER_LIMIT);
    if (error) return { status: "error", message: publicSupabaseMessage("simplelist.listsForUser", error.message) };
    const rows = (data ?? []) as Record<string, unknown>[];
    if (rows.length === 0) return { status: "empty" };
    return { status: "success", rows };
  } catch (e) {
    return { status: "error", message: publicLoadError("simplelist.listsForUser", e) };
  }
}
