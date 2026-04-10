import { NextResponse } from "next/server";
import { loadBrewmoteWrittenReviewsList } from "@/server/brewmotePageLoaders";

export async function GET() {
  const result = await loadBrewmoteWrittenReviewsList();
  if (!result.ok) {
    const res = NextResponse.json({ error: result.message }, { status: 500 });
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  const res = NextResponse.json({ reviews: result.reviews });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
