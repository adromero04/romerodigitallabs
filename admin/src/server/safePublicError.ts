import "server-only";

const GENERIC_LOAD = "Unable to load this data right now.";
const GENERIC_HEALTH = "Service unreachable.";

/** Logs full detail server-side; returns a safe string for HTML/JSON in production. */
export function logAdminError(context: string, err: unknown): void {
  const detail = err instanceof Error ? err.stack ?? err.message : String(err);
  console.error(`[admin:${context}]`, detail);
}

export function publicLoadError(context: string, err: unknown): string {
  logAdminError(context, err);
  if (process.env.NODE_ENV !== "production") {
    return err instanceof Error ? err.message : String(err);
  }
  return GENERIC_LOAD;
}

/** Use when you already have a Supabase/PostgREST message string (still log, sanitize outbound). */
export function publicSupabaseMessage(context: string, message: string | undefined | null): string {
  logAdminError(context, message ?? "(no message)");
  if (process.env.NODE_ENV !== "production" && message) return message;
  return GENERIC_LOAD;
}

export function publicHealthDetail(context: string, err: unknown): string {
  logAdminError(context, err);
  if (process.env.NODE_ENV !== "production" && err instanceof Error) return err.message;
  return GENERIC_HEALTH;
}

/** For health check JSON: same redaction as load errors but health-oriented copy. */
export function publicSupabaseHealthMessage(context: string, message: string | undefined | null): string {
  logAdminError(context, message ?? "(no message)");
  if (process.env.NODE_ENV !== "production" && message) return message;
  return GENERIC_HEALTH;
}
