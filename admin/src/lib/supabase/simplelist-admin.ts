import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

import { computeSignupTrendFromPaginatedUsers, type SignupTrendData } from "@/lib/supabase/userSignupTrend";

/**
 * SimpleList — server-only Supabase client (service role).
 * Never import this module from Client Components or any file that ships to the browser.
 *
 * Env: `SIMPLELIST_SUPABASE_URL`, `SIMPLELIST_SUPABASE_SERVICE_ROLE_KEY`
 */

let cached: SupabaseClient | null = null;

export function getSimpleListAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SIMPLELIST_SUPABASE_URL;
  const serviceRoleKey = process.env.SIMPLELIST_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SIMPLELIST_SUPABASE_URL or SIMPLELIST_SUPABASE_SERVICE_ROLE_KEY");
  }
  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

const LIST_PAGE_SIZE = 200;
/** TODO(SimpleList): Replace email search with RPC / indexed table — same scaling caveats as Brewmote. */
const MAX_PAGES_EMAIL_SEARCH = 50;
const MAX_PAGES_USER_COUNT = 500;

/** TODO(SimpleList): Prefer SQL/RPC count for large auth user sets. */
export async function getUserCount(): Promise<number> {
  const supabase = getSimpleListAdminClient();
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
  const supabase = getSimpleListAdminClient();
  return computeSignupTrendFromPaginatedUsers(LIST_PAGE_SIZE, MAX_PAGES_USER_COUNT, async (page, perPage) => {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    return data.users;
  });
}

/** TODO(SimpleList): Replace with ordered query on your lists/items table or profiles. */
export async function getRecentUsers(limit = 20): Promise<User[]> {
  const supabase = getSimpleListAdminClient();
  const perPage = Math.min(Math.max(limit, 1), 1000);
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage });
  if (error) throw new Error(error.message);
  const sorted = [...data.users].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return sorted.slice(0, limit);
}

/** TODO(SimpleList): Replace scan with DB-level email lookup. */
export async function searchUsersByEmail(email: string): Promise<User[]> {
  const supabase = getSimpleListAdminClient();
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

export type SimpleListTopLevelStats = {
  authUserCount: number;
  /**
   * TODO(SimpleList): e.g. total lists, items, shared lists — map to your schema:
   * `await supabase.from('TODO_LISTS_TABLE').select('*', { count: 'exact', head: true })`
   */
  todoDomainRowCount: number | null;
};

/** TODO(SimpleList): Extend with SimpleList-specific head counts / RPCs. */
export async function getTopLevelStats(): Promise<SimpleListTopLevelStats> {
  const supabase = getSimpleListAdminClient();
  const authUserCount = await getUserCount();

  // TODO(SimpleList): Example — wire to your primary entity table name.
  // const { count, error } = await supabase
  //   .from("TODO_SIMPLELIST_PRIMARY_ENTITY_TABLE")
  //   .select("*", { count: "exact", head: true });
  // if (error) throw new Error(error.message);

  void supabase;
  return {
    authUserCount,
    todoDomainRowCount: null,
  };
}
