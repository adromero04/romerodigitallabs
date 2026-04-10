import "server-only";

import type { User } from "@supabase/supabase-js";

const MS_PER_DAY = 86_400_000;

function utcDayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function dayKeyUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type SignupTrendData = {
  totalUsers: number;
  /** yyyy-mm-dd UTC, oldest first (30 entries) */
  daysUtc: string[];
  /** Total users at end of each day in `daysUtc` */
  cumulativeLast30: number[];
  /** New signups on that UTC day */
  newPerDayLast30: number[];
  newSignupsLast30: number;
  newSignupsPrior30: number;
  /** Hit pagination safety cap — series may be incomplete */
  truncated: boolean;
};

/**
 * Paginates auth users once, buckets signups into 60 UTC days (prior 30 + last 30),
 * derives cumulative totals for the chart and MoM-style signup comparison.
 */
export async function computeSignupTrendFromPaginatedUsers(
  listPageSize: number,
  maxPages: number,
  fetchPage: (page: number, perPage: number) => Promise<User[]>,
): Promise<SignupTrendData> {
  const now = new Date();
  const todayStart = utcDayStart(now);
  const windowStart = addUtcDays(todayStart, -59);

  const counts60 = new Array(60).fill(0);
  let older = 0;
  let truncated = false;

  for (let page = 1; page <= maxPages; page += 1) {
    const users = await fetchPage(page, listPageSize);
    for (const u of users) {
      const cstart = utcDayStart(new Date(u.created_at));
      const diff = cstart.getTime() - windowStart.getTime();
      if (diff < 0) {
        older += 1;
        continue;
      }
      const idx = Math.floor(diff / MS_PER_DAY);
      if (idx < 0) {
        older += 1;
        continue;
      }
      if (idx > 59) {
        counts60[59] += 1;
        continue;
      }
      counts60[idx] += 1;
    }
    if (users.length < listPageSize) break;
    if (page === maxPages) truncated = true;
  }

  const totalUsers = older + counts60.reduce((a, b) => a + b, 0);

  const prior = counts60.slice(0, 30);
  const last = counts60.slice(30, 60);
  const newSignupsPrior30 = prior.reduce((a, b) => a + b, 0);
  const newSignupsLast30 = last.reduce((a, b) => a + b, 0);

  const baseline = older + newSignupsPrior30;
  const cumulativeLast30: number[] = [];
  let run = baseline;
  const daysUtc: string[] = [];
  const newPerDayLast30: number[] = [];
  for (let i = 0; i < 30; i += 1) {
    const dayStart = addUtcDays(windowStart, 30 + i);
    daysUtc.push(dayKeyUtc(dayStart));
    run += last[i];
    cumulativeLast30.push(run);
    newPerDayLast30.push(last[i]);
  }

  return {
    totalUsers,
    daysUtc,
    cumulativeLast30,
    newPerDayLast30,
    newSignupsLast30,
    newSignupsPrior30,
    truncated,
  };
}
