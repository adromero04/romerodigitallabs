import "server-only";

import { normalizeCafeNameParam, normalizeEmailSearchParam } from "@/lib/admin/queryGuards";
import {
  getBrewmoteAdminClient,
  getRecentBrewmoteUsers,
  getUserSignupTrend,
  searchUsersByEmail,
} from "@/lib/supabase/brewmote-admin";
import type {
  BrewmoteUsersOverviewResult,
  CafeSearchResult,
  MetricResult,
  UserSearchResult,
  UserTrendResult,
} from "@/server/admin/loadResultTypes";
import { publicLoadError, publicSupabaseMessage } from "@/server/safePublicError";

// Re-export types for callers that imported from this module.
export type {
  BrewmoteRecentUser,
  BrewmoteUsersOverviewResult,
  CafeSearchResult,
  MetricResult,
  UserSearchResult,
  UserTrendResult,
} from "@/server/admin/loadResultTypes";

// ——— TODO(Brewmote): Map to your real `public` table names (string) or leave `null` for a clear UI callout. ———

/** Cafes (or coffee shops) table for count + name search. */
export const BREWMOTE_TABLE_CAFES: string | null = "cafes";

/** User ↔ cafe favorites (junction) for aggregate count. */
export const BREWMOTE_TABLE_USER_FAVORITES: string | null = "user_favorites";

/**
 * Structured cafe feedback (ratings, booleans, optional `review` text).
 * Brewmote: `public.cafe_feedback`. Written “reviews” / comments use the `review` column.
 */
export const BREWMOTE_TABLE_REVIEWS: string | null = "cafe_feedback";

/** Free-text review body on `BREWMOTE_TABLE_REVIEWS` (Brewmote treats this as reviews/comments). */
export const BREWMOTE_CAFE_FEEDBACK_REVIEW_COLUMN = "review";

/** Column on `BREWMOTE_TABLE_CAFES` used for `ilike` name search. */
export const BREWMOTE_CAFE_NAME_COLUMN = "name";

/** Max rows returned for cafe search. */
const CAFE_SEARCH_LIMIT = 20;

/** Cap list payload for written-reviews API / modal. */
const BREWMOTE_WRITTEN_REVIEWS_LIST_LIMIT = 200;

export type BrewmoteWrittenReviewRow = {
  id: string;
  cafe_id: string;
  user_id: string;
  review: string;
  created_at: string | null;
};

/** Signup trend (one auth scan) plus recent profiles; total matches trend. */
export async function loadBrewmoteUsersOverview(): Promise<BrewmoteUsersOverviewResult> {
  const [trendSettled, recentSettled] = await Promise.allSettled([
    getUserSignupTrend(),
    getRecentBrewmoteUsers(12),
  ]);

  if (trendSettled.status === "rejected") {
    return { status: "error", message: publicLoadError("brewmote.usersOverview", trendSettled.reason) };
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
    recentError: publicLoadError("brewmote.usersOverview.recent", recentSettled.reason),
  };
}

export async function loadBrewmoteCafesCount(): Promise<MetricResult> {
  if (!BREWMOTE_TABLE_CAFES) {
    return {
      status: "not_configured",
      message: "Cafes aren’t connected in this admin build yet.",
    };
  }
  try {
    const supabase = getBrewmoteAdminClient();
    const { count, error } = await supabase
      .from(BREWMOTE_TABLE_CAFES)
      .select("*", { count: "exact", head: true });
    if (error) return { status: "error", message: publicSupabaseMessage("brewmote.cafesCount", error.message) };
    return { status: "success", value: count ?? 0 };
  } catch (e) {
    return { status: "error", message: publicLoadError("brewmote.cafesCount", e) };
  }
}

export async function loadBrewmoteUserFavoritesCount(): Promise<MetricResult> {
  if (!BREWMOTE_TABLE_USER_FAVORITES) {
    return {
      status: "not_configured",
      message: "Favorites aren’t connected in this admin build yet.",
    };
  }
  try {
    const supabase = getBrewmoteAdminClient();
    const { count, error } = await supabase
      .from(BREWMOTE_TABLE_USER_FAVORITES)
      .select("*", { count: "exact", head: true });
    if (error)
      return { status: "error", message: publicSupabaseMessage("brewmote.userFavoritesCount", error.message) };
    return { status: "success", value: count ?? 0 };
  } catch (e) {
    return { status: "error", message: publicLoadError("brewmote.userFavoritesCount", e) };
  }
}

export async function loadBrewmoteReviewsCount(): Promise<MetricResult> {
  if (!BREWMOTE_TABLE_REVIEWS) {
    return {
      status: "not_configured",
      message: "Cafe feedback isn’t connected in this admin build yet.",
    };
  }
  try {
    const supabase = getBrewmoteAdminClient();
    const { count, error } = await supabase
      .from(BREWMOTE_TABLE_REVIEWS)
      .select("*", { count: "exact", head: true });
    if (error) return { status: "error", message: publicSupabaseMessage("brewmote.reviewsCount", error.message) };
    return { status: "success", value: count ?? 0 };
  } catch (e) {
    return { status: "error", message: publicLoadError("brewmote.reviewsCount", e) };
  }
}

/** Rows where `review` is present and non-empty (text reviews / comments in product terms). */
export async function loadBrewmoteCafeFeedbackWithReviewTextCount(): Promise<MetricResult> {
  if (!BREWMOTE_TABLE_REVIEWS) {
    return {
      status: "not_configured",
      message: "Cafe feedback isn’t connected in this admin build yet.",
    };
  }
  try {
    const supabase = getBrewmoteAdminClient();
    const col = BREWMOTE_CAFE_FEEDBACK_REVIEW_COLUMN;
    const { count, error } = await supabase
      .from(BREWMOTE_TABLE_REVIEWS)
      .select("*", { count: "exact", head: true })
      .not(col, "is", null)
      .neq(col, "");
    if (error)
      return {
        status: "error",
        message: publicSupabaseMessage("brewmote.cafeFeedbackReviewTextCount", error.message),
      };
    return { status: "success", value: count ?? 0 };
  } catch (e) {
    return { status: "error", message: publicLoadError("brewmote.cafeFeedbackReviewTextCount", e) };
  }
}

/** Non-empty `review` text rows, newest first (for admin modal / API). */
export async function loadBrewmoteWrittenReviewsList(): Promise<
  { ok: true; reviews: BrewmoteWrittenReviewRow[] } | { ok: false; message: string }
> {
  if (!BREWMOTE_TABLE_REVIEWS) {
    return { ok: false, message: "Cafe feedback isn’t available." };
  }
  try {
    const supabase = getBrewmoteAdminClient();
    const col = BREWMOTE_CAFE_FEEDBACK_REVIEW_COLUMN;
    const { data, error } = await supabase
      .from(BREWMOTE_TABLE_REVIEWS)
      .select("id, cafe_id, user_id, review, created_at")
      .not(col, "is", null)
      .neq(col, "")
      .order("created_at", { ascending: false })
      .limit(BREWMOTE_WRITTEN_REVIEWS_LIST_LIMIT);
    if (error)
      return { ok: false, message: publicSupabaseMessage("brewmote.writtenReviewsList", error.message) };
    const raw = data ?? [];
    const reviews: BrewmoteWrittenReviewRow[] = [];
    for (const r of raw) {
      if (r == null || typeof r !== "object") continue;
      const row = r as Record<string, unknown>;
      const review = row.review;
      if (typeof review !== "string" || review === "") continue;
      reviews.push({
        id: String(row.id ?? ""),
        cafe_id: String(row.cafe_id ?? ""),
        user_id: String(row.user_id ?? ""),
        review,
        created_at: typeof row.created_at === "string" ? row.created_at : null,
      });
    }
    return { ok: true, reviews };
  } catch (e) {
    return { ok: false, message: publicLoadError("brewmote.writtenReviewsList", e) };
  }
}

export async function loadBrewmoteUserSearch(email: string | undefined): Promise<UserSearchResult> {
  const normalized = normalizeEmailSearchParam(email);
  if (!normalized) return { status: "idle" };
  try {
    const users = await searchUsersByEmail(normalized);
    if (users.length === 0) return { status: "empty" };
    return { status: "success", users };
  } catch (e) {
    return { status: "error", message: publicLoadError("brewmote.userSearch", e) };
  }
}

/** Strip ILIKE wildcards so user input cannot broaden the pattern. */
function sanitizeIlikeLiteral(raw: string): string {
  return raw.trim().replace(/[%_]/g, "");
}

export async function loadBrewmoteCafeSearch(name: string | undefined): Promise<CafeSearchResult> {
  const normalized = normalizeCafeNameParam(name);
  if (!normalized) return { status: "idle" };
  if (!BREWMOTE_TABLE_CAFES) {
    return {
      status: "not_configured",
      message: "Cafe search isn’t available until cafes are connected.",
    };
  }
  const q = sanitizeIlikeLiteral(normalized);
  if (!q) return { status: "empty" };
  try {
    const supabase = getBrewmoteAdminClient();
    const { data, error } = await supabase
      .from(BREWMOTE_TABLE_CAFES)
      .select("*")
      .ilike(BREWMOTE_CAFE_NAME_COLUMN, `%${q}%`)
      .limit(CAFE_SEARCH_LIMIT);
    if (error) return { status: "error", message: publicSupabaseMessage("brewmote.cafeSearch", error.message) };
    const rows = (data ?? []) as Record<string, unknown>[];
    if (rows.length === 0) return { status: "empty" };
    return { status: "success", rows };
  } catch (e) {
    return { status: "error", message: publicLoadError("brewmote.cafeSearch", e) };
  }
}
