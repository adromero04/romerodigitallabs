import "server-only";

import type { User } from "@supabase/supabase-js";

import type { SignupTrendData } from "@/lib/supabase/userSignupTrend";

/** 30-day cumulative user trend + signup deltas (from one auth directory scan). */
export type UserTrendResult =
  | { ok: true; data: SignupTrendData }
  | { ok: false; message: string };

/** Shared result shapes for Brewmote / SimpleList page loaders. */
export type MetricResult =
  | { status: "success"; value: number }
  | { status: "error"; message: string }
  | { status: "not_configured"; message: string };

/** Brewmote: `public.profiles` row + Auth email for admin lists. */
export type BrewmoteRecentUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
};

export type BrewmoteUsersOverviewResult =
  | {
      status: "success";
      total: number;
      recent: BrewmoteRecentUser[];
      trend: UserTrendResult;
      recentError?: string;
    }
  | { status: "error"; message: string };

export type SimpleListUsersOverviewResult =
  | {
      status: "success";
      total: number;
      recent: User[];
      trend: UserTrendResult;
      recentError?: string;
    }
  | { status: "not_configured"; message: string }
  | { status: "error"; message: string };

export type UserSearchResult =
  | { status: "idle" }
  | { status: "success"; users: User[] }
  | { status: "empty" }
  | { status: "error"; message: string };

/** SimpleList email search; adds disabled state when SIMPLELIST_* env is omitted. */
export type SimpleListUserSearchResult =
  | UserSearchResult
  | { status: "not_configured"; message: string };

export type CafeSearchResult =
  | { status: "idle" }
  | { status: "success"; rows: Record<string, unknown>[] }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "not_configured"; message: string };

export type UserListsResult =
  | { status: "idle" }
  | { status: "success"; rows: Record<string, unknown>[] }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "not_configured"; message: string }
  | { status: "invalid_param"; message: string };
