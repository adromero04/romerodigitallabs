/**
 * SimpleList domain / admin operations.
 * Mirror the Brewmote patterns: all service-role Supabase calls go through here (or nested modules).
 */
import {
  getSimpleListAdminClient,
  isSimpleListIntegrationConfigured,
  SIMPLELIST_DISABLED_GUIDE,
} from "@/lib/supabase/simplelist-admin";
import { publicHealthDetail, publicSupabaseHealthMessage } from "@/server/safePublicError";

export type HealthSummary = { ok: boolean; detail?: string };

export async function getSimpleListHealthSummary(): Promise<HealthSummary> {
  if (!isSimpleListIntegrationConfigured()) {
    return { ok: false, detail: SIMPLELIST_DISABLED_GUIDE };
  }
  try {
    const supabase = getSimpleListAdminClient();
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      return { ok: false, detail: publicSupabaseHealthMessage("simplelist.health.listUsers", error.message) };
    }
    return { ok: true, detail: "Auth admin reachable" };
  } catch (e) {
    return { ok: false, detail: publicHealthDetail("simplelist.health", e) };
  }
}

/** Placeholder for future SimpleList-specific admin helpers. */
export async function simpleListPlaceholder(): Promise<void> {
  if (!isSimpleListIntegrationConfigured()) return;
  void getSimpleListAdminClient();
}
