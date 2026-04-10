/**
 * Signed session tokens using Web Crypto (HMAC-SHA256).
 * Safe for Edge middleware and Node route handlers — no Node-only APIs.
 *
 * Session length must match the HTTP cookie `maxAge` set in `src/app/api/admin/login/route.ts`.
 */
export const ADMIN_SESSION_MAX_AGE_SEC = 8 * 60 * 60;

function getSecretString(): string {
  const raw = process.env.ADMIN_SESSION_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be set (min 16 characters)");
  }
  return raw;
}

const COOKIE_NAME = "rdl_admin_session";

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

function base64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function base64urlDecode(s: string): Uint8Array | null {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

async function hmacSha256(secret: string, data: Uint8Array): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, data as BufferSource);
  return new Uint8Array(buf);
}

function timingSafeEqualUint8(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a[i]! ^ b[i]!;
  return x === 0;
}

/** Cookie serialization shared by login (set) and logout (clear). Edge-safe. */
export function adminSessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export function adminSessionClearCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = getSecretString();
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SEC;
  const payload = JSON.stringify({ v: 1, sub: "admin", exp });
  const payloadBytes = new TextEncoder().encode(payload);
  const sig = await hmacSha256(secret, payloadBytes);
  return `${base64urlEncode(payloadBytes)}.${base64urlEncode(sig)}`;
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
  try {
    const secret = getSecretString();
    const dot = token.indexOf(".");
    if (dot <= 0) return false;
    const payloadPart = token.slice(0, dot);
    const sigPart = token.slice(dot + 1);
    const payloadBytes = base64urlDecode(payloadPart);
    const sigBytes = base64urlDecode(sigPart);
    if (!payloadBytes || !sigBytes) return false;
    const expectedSig = await hmacSha256(secret, payloadBytes);
    if (!timingSafeEqualUint8(sigBytes, expectedSig)) return false;
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp?: number; v?: number };
    if (payload.v !== 1 || typeof payload.exp !== "number") return false;
    if (payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}
