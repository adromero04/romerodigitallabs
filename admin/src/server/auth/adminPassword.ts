/**
 * Password check for admin login — Node route handlers only (uses `crypto`).
 */
import { timingSafeEqual } from "crypto";

export function timingSafeComparePassword(input: string, expected: string): boolean {
  if (!expected || expected.length === 0) return false;
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
