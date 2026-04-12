import "server-only";

import { getRecentBrewmoteUsers as brewmoteRecent, getUserSignupTrend as brewmoteUserSignupTrend } from "@/lib/supabase/brewmote-admin";
import {
  getRecentUsers as simpleListRecent,
  getUserSignupTrend as simpleListUserSignupTrend,
  isSimpleListIntegrationConfigured,
  SIMPLELIST_DISABLED_LABEL,
} from "@/lib/supabase/simplelist-admin";
import type { SignupTrendData } from "@/lib/supabase/userSignupTrend";
import type { UserTrendResult } from "@/server/admin/loadResultTypes";
import { publicLoadError } from "@/server/safePublicError";

export type { UserTrendResult } from "@/server/admin/loadResultTypes";

export type CountResult = { ok: true; value: number } | { ok: false; message: string };

export type RecentSignupRow = {
  id: string;
  source: "brewmote" | "simplelist";
  email: string | null;
  createdAt: string;
};

export type DashboardSnapshot = {
  simpleListIntegrationConfigured: boolean;
  brewmoteUsers: CountResult;
  simpleListUsers: CountResult;
  brewmoteUserTrend: UserTrendResult;
  simpleListUserTrend: UserTrendResult;
  recentSignups: RecentSignupRow[];
};

function mergeCombinedUserTrend(a: SignupTrendData, b: SignupTrendData): SignupTrendData {
  const cumulativeLast30 = a.cumulativeLast30.map((v, i) => v + b.cumulativeLast30[i]);
  const newPerDayLast30 = a.newPerDayLast30.map((v, i) => v + b.newPerDayLast30[i]);
  return {
    totalUsers: a.totalUsers + b.totalUsers,
    daysUtc: a.daysUtc,
    cumulativeLast30,
    newPerDayLast30,
    newSignupsLast30: a.newSignupsLast30 + b.newSignupsLast30,
    newSignupsPrior30: a.newSignupsPrior30 + b.newSignupsPrior30,
    truncated: a.truncated || b.truncated,
  };
}

/**
 * Parallel loads from both remote Supabase projects for the admin overview.
 * One project failing does not block counts for the other.
 */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const slOn = isSimpleListIntegrationConfigured();

  if (!slOn) {
    const [bc, br] = await Promise.allSettled([brewmoteUserSignupTrend(), brewmoteRecent(6)]);

    const brewmoteUsers =
      bc.status === "fulfilled"
        ? { ok: true as const, value: bc.value.totalUsers }
        : { ok: false as const, message: publicLoadError("dashboard.brewmoteUserTrend", bc.reason) };
    const simpleListUsers = { ok: false as const, message: SIMPLELIST_DISABLED_LABEL };
    const brewmoteUserTrend: UserTrendResult =
      bc.status === "fulfilled"
        ? { ok: true, data: bc.value }
        : { ok: false, message: publicLoadError("dashboard.brewmoteUserTrend", bc.reason) };
    const simpleListUserTrend: UserTrendResult = { ok: false, message: SIMPLELIST_DISABLED_LABEL };

    const recentSignups: RecentSignupRow[] = [];
    if (br.status === "fulfilled") {
      for (const u of br.value) {
        recentSignups.push({
          id: `brewmote-${u.id}`,
          source: "brewmote",
          email: u.email ?? null,
          createdAt: u.created_at,
        });
      }
    }
    recentSignups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      simpleListIntegrationConfigured: false,
      brewmoteUsers,
      simpleListUsers,
      brewmoteUserTrend,
      simpleListUserTrend,
      recentSignups: recentSignups.slice(0, 8),
    };
  }

  const [bc, sc, br, sr] = await Promise.allSettled([
    brewmoteUserSignupTrend(),
    simpleListUserSignupTrend(),
    brewmoteRecent(6),
    simpleListRecent(6),
  ]);

  const brewmoteUsers =
    bc.status === "fulfilled"
      ? { ok: true as const, value: bc.value.totalUsers }
      : { ok: false as const, message: publicLoadError("dashboard.brewmoteUserTrend", bc.reason) };
  const simpleListUsers =
    sc.status === "fulfilled"
      ? { ok: true as const, value: sc.value.totalUsers }
      : { ok: false as const, message: publicLoadError("dashboard.simplelistUserTrend", sc.reason) };

  const brewmoteUserTrend: UserTrendResult =
    bc.status === "fulfilled"
      ? { ok: true, data: bc.value }
      : { ok: false, message: publicLoadError("dashboard.brewmoteUserTrend", bc.reason) };
  const simpleListUserTrend: UserTrendResult =
    sc.status === "fulfilled"
      ? { ok: true, data: sc.value }
      : { ok: false, message: publicLoadError("dashboard.simplelistUserTrend", sc.reason) };

  const recentSignups: RecentSignupRow[] = [];
  if (br.status === "fulfilled") {
    for (const u of br.value) {
      recentSignups.push({
        id: `brewmote-${u.id}`,
        source: "brewmote",
        email: u.email ?? null,
        createdAt: u.created_at,
      });
    }
  }
  if (sr.status === "fulfilled") {
    for (const u of sr.value) {
      recentSignups.push({
        id: `simplelist-${u.id}`,
        source: "simplelist",
        email: u.email ?? null,
        createdAt: u.created_at,
      });
    }
  }

  recentSignups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    simpleListIntegrationConfigured: true,
    brewmoteUsers,
    simpleListUsers,
    brewmoteUserTrend,
    simpleListUserTrend,
    recentSignups: recentSignups.slice(0, 8),
  };
}

/** Sum of per-app trends for the combined overview card (both must be loaded when SimpleList is enabled). */
export function getCombinedUserTrend(
  brewmote: UserTrendResult,
  simpleList: UserTrendResult,
): UserTrendResult {
  if (!isSimpleListIntegrationConfigured()) {
    return brewmote.ok ? { ok: true, data: brewmote.data } : brewmote;
  }
  if (!brewmote.ok || !simpleList.ok) {
    return { ok: false, message: "Both projects must load to show combined trend." };
  }
  return { ok: true, data: mergeCombinedUserTrend(brewmote.data, simpleList.data) };
}
