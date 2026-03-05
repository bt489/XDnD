import { NextRequest, NextResponse } from "next/server";
import { scrapeNitter } from "@/lib/scraper/nitter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) {
    return NextResponse.json({ success: false, error: "Missing handle" }, { status: 400 });
  }

  try {
    const profile = await scrapeNitter(handle);

    if (profile) {
      return NextResponse.json({ success: true, profile });
    }

    return NextResponse.json(
      { success: false, error: "All Nitter instances failed or returned no data" },
      { status: 502 }
    );
  } catch (error) {
    console.error("Nitter scrape error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Nitter scrape failed" },
      { status: 500 }
    );
  }
}
