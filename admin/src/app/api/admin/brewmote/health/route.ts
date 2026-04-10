/**
 * Example JSON endpoint: delegates to the Brewmote service layer.
 * Middleware ensures only authenticated admins hit this route.
 */
import { NextResponse } from "next/server";
import { getBrewmoteHealthSummary } from "@/server/services/brewmoteService";

export async function GET() {
  const summary = await getBrewmoteHealthSummary();
  const res = NextResponse.json(summary, { status: summary.ok ? 200 : 503 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
