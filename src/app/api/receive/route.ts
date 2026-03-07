import { NextRequest, NextResponse } from "next/server";
import type { ScrapedProfile } from "@/types";

// In-memory store with TTL
const store = new Map<string, { profile: ScrapedProfile; expires: number }>();

// Clean up expired entries periodically
function cleanup() {
  const now = Date.now();
  store.forEach((value, key) => {
    if (value.expires < now) {
      store.delete(key);
    }
  });
}

export async function POST(req: NextRequest) {
  cleanup();

  // CORS headers for bookmarklet requests from x.com
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    // Reject oversized payloads
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 100_000) {
      return NextResponse.json(
        { success: false, error: "Payload too large" },
        { status: 413, headers }
      );
    }

    const body = await req.json();
    const { token, profile } = body;

    if (!token || !profile) {
      return NextResponse.json(
        { success: false, error: "Missing token or profile" },
        { status: 400, headers }
      );
    }

    // Validate token format (alphanumeric, 10-50 chars)
    if (typeof token !== "string" || token.length < 10 || token.length > 50 || !/^[a-z0-9]+$/i.test(token)) {
      return NextResponse.json(
        { success: false, error: "Invalid token format" },
        { status: 400, headers }
      );
    }

    // Store with 5-minute TTL
    store.set(token, {
      profile,
      expires: Date.now() + 5 * 60 * 1000,
    });

    return NextResponse.json({ success: true, token }, { headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400, headers }
    );
  }
}

export async function GET(req: NextRequest) {
  cleanup();

  const headers = {
    "Access-Control-Allow-Origin": "*",
  };

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token" },
      { status: 400, headers }
    );
  }

  const entry = store.get(token);
  if (!entry || entry.expires < Date.now()) {
    return NextResponse.json({ success: false, profile: null }, { headers });
  }

  // Delete after retrieval (one-time use)
  store.delete(token);

  return NextResponse.json({ success: true, profile: entry.profile }, { headers });
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
