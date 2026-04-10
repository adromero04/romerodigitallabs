import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { computeSignupTrendFromPaginatedUsers, type SignupTrendData } from "@/lib/supabase/userSignupTrend";
import type { BrewmoteRecentUser } from "@/server/admin/loadResultTypes";

/**
 * Brewmote — server-only Supabase client (service role).
 * Never import this module from Client Components or any file that ships to the browser.
 *
 * Env: `BREWMOTE_SUPABASE_URL`, `BREWMOTE_SUPABASE_SERVICE_ROLE_KEY`
 */

let cached: SupabaseClient | null = null;

export function getBrewmoteAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.BREWMOTE_SUPABASE_URL;
  const serviceRoleKey = process.env.BREWMOTE_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing BREWMOTE_SUPABASE_URL or BREWMOTE_SUPABASE_SERVICE_ROLE_KEY");
  }
  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Mirrors `public.profiles` in Brewmote (id → auth.users). */
const BREWMOTE_PROFILES_TABLE = "profiles";

const LIST_PAGE_SIZE = 200;
/** Cap pagination for email scan — TODO(Brewmote): replace with RPC/SQL against `auth.users` or a `profiles` table with an email index. */
const MAX_PAGES_EMAIL_SEARCH = 50;
/** Hard stop for full user counts (200 × 500 = 100k users) to bound admin API work. */
const MAX_PAGES_USER_COUNT = 500;

/**
 * Total auth users via Admin API pagination.
 * TODO(Brewmote): For large projects, prefer a Postgres RPC that `SELECT count(*) FROM auth.users` (service role) to avoid paging every user.
 */
export async function getUserCount(): Promise<number> {
  const supabase = getBrewmoteAdminClient();
  let total = 0;
  let page = 1;
  for (;;) {
    if (page > MAX_PAGES_USER_COUNT) {
      throw new Error(
        "Auth user count exceeded pagination safety cap; add a SQL/RPC count for large directories.",
      );
    }
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: LIST_PAGE_SIZE });
    if (error) throw new Error(error.message);
    const batch = data.users;
    total += batch.length;
    if (batch.length < LIST_PAGE_SIZE) break;
    page += 1;
  }
  return total;
}

/** One full auth scan: totals plus 30-day cumulative trend vs prior 30 days (UTC days). */
export async function getUserSignupTrend(): Promise<SignupTrendData> {
  const supabase = getBrewmoteAdminClient();
  return computeSignupTrendFromPaginatedUsers(LIST_PAGE_SIZE, MAX_PAGES_USER_COUNT, async (page, perPage) => {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    return data.users;
  });
}

/**
 * Recent signups ordered by `public.profiles.created_at` (global), with email from Auth admin `getUserById`.
 */
export async function getRecentBrewmoteUsers(limit = 20): Promise<BrewmoteRecentUser[]> {
  const supabase = getBrewmoteAdminClient();
  const lim = Math.min(Math.max(limit, 1), 100);
  const { data: profiles, error } = await supabase
    .from(BREWMOTE_PROFILES_TABLE)
    .select("id, full_name, created_at")
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(lim);
  if (error) throw new Error(error.message);
  const rows = profiles ?? [];

  return Promise.all(
    rows.map(async (p: { id: string; full_name: string | null; created_at: string | null }) => {
      const { data, error: userErr } = await supabase.auth.admin.getUserById(p.id);
      const authUser = userErr ? null : data.user;
      const created =
        authUser?.created_at ??
        p.created_at ??
        new Date(0).toISOString();
      return {
        id: p.id,
        email: authUser?.email ?? null,
        full_name: p.full_name,
        created_at: created,
      };
    }),
  );
}

/**
 * Linear scan of auth users across pages until `email` matches (case-insensitive) or pages exhausted.
 * TODO(Brewmote): Replace with a secure RPC or query against a table that stores email with an index
 * (GoTrue Admin JS does not expose `getUserByEmail`; scanning does not scale).
 */
export async function searchUsersByEmail(email: string): Promise<User[]> {
  const supabase = getBrewmoteAdminClient();
  const needle = email.trim().toLowerCase();
  if (!needle) return [];

  const matches: User[] = [];
  for (let page = 1; page <= MAX_PAGES_EMAIL_SEARCH; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: LIST_PAGE_SIZE });
    if (error) throw new Error(error.message);
    for (const u of data.users) {
      if ((u.email ?? "").toLowerCase() === needle) matches.push(u);
    }
    if (data.users.length < LIST_PAGE_SIZE) break;
  }
  return matches;
}

export type BrewmoteTopLevelStats = {
  authUserCount: number;
  /**
   * TODO(Brewmote): Map to real tables, e.g.:
   * `await supabase.from('TODO_ITEMS_TABLE').select('*', { count: 'exact', head: true })`
   */
  todoDomainRowCount: number | null;
};

/**
 * Aggregates a few high-level counts for the Brewmote project.
 * TODO(Brewmote): Add joins or multiple `.from('...')` head counts for your actual schema.
 */
export async function getTopLevelStats(): Promise<BrewmoteTopLevelStats> {
  const supabase = getBrewmoteAdminClient();
  const authUserCount = await getUserCount();

  // TODO(Brewmote): Uncomment and set the real table name(s), e.g. brew_sessions, recipes, etc.
  // const { count, error } = await supabase
  //   .from("TODO_BREWMOTE_PRIMARY_ENTITY_TABLE")
  //   .select("*", { count: "exact", head: true });
  // if (error) throw new Error(error.message);

  void supabase;
  return {
    authUserCount,
    todoDomainRowCount: null,
  };
}
