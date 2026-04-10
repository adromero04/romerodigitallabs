/**
 * Brewmote domain / admin operations.
 *
 * Add functions here (list users, inspect rows, run maintenance) and call them from:
 * - App Router Server Components or Server Actions
 * - `src/app/api/admin/brewmote/*` Route Handlers
 *
 * Keep all `getBrewmoteAdminClient()` usage inside this module (or submodules) so service role access stays centralized.
 */
import { getBrewmoteAdminClient } from "@/lib/supabase/brewmote-admin";
import { publicHealthDetail, publicSupabaseHealthMessage } from "@/server/safePublicError";

export type HealthSummary = { ok: boolean; detail?: string };

/**
 * Lightweight connectivity check using the Auth Admin API (service role).
 * Replace with a domain-specific query once you know which tables or metrics matter.
 */
export async function getBrewmoteHealthSummary(): Promise<HealthSummary> {
  try {
    const supabase = getBrewmoteAdminClient();
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      return { ok: false, detail: publicSupabaseHealthMessage("brewmote.health.listUsers", error.message) };
    }
    return { ok: true, detail: "Auth admin reachable" };
  } catch (e) {
    return { ok: false, detail: publicHealthDetail("brewmote.health", e) };
  }
}

/** Placeholder for future Brewmote-specific admin helpers. */
export async function brewmotePlaceholder(): Promise<void> {
  void getBrewmoteAdminClient();
}
