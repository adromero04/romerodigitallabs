/**
 * URL / form search param normalization and validation (admin UI only).
 * Keeps query size bounded and rejects malformed UUIDs before hitting Supabase.
 */

const EMAIL_MAX_LEN = 254;
const CAFE_NAME_MAX_LEN = 120;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeEmailSearchParam(raw: string | undefined): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const t = raw.trim().slice(0, EMAIL_MAX_LEN);
  return t.length === 0 ? undefined : t;
}

export function normalizeCafeNameParam(raw: string | undefined): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const t = raw.trim().slice(0, CAFE_NAME_MAX_LEN);
  return t.length === 0 ? undefined : t;
}

export function parseUuidParam(raw: string | undefined): { ok: true; uuid: string } | { ok: false } {
  if (raw === undefined || raw === null) return { ok: false };
  const t = raw.trim();
  if (!t) return { ok: false };
  return UUID_RE.test(t) ? { ok: true, uuid: t } : { ok: false };
}
