import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service-role client for invite / Auth Admin API only. Never import in client components or middleware. */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase service role configuration.");
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
