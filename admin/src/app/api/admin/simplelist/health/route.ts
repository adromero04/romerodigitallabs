/**
 * Example JSON endpoint for the SimpleList Supabase project.
 */
import { NextResponse } from "next/server";
import { getSimpleListHealthSummary } from "@/server/services/simplelistService";

export async function GET() {
  const summary = await getSimpleListHealthSummary();
  const res = NextResponse.json(summary, { status: summary.ok ? 200 : 503 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
