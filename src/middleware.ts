import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Let CORS preflight through immediately
  if (req.method === "OPTIONS") {
    return NextResponse.json(null, { headers: CORS_HEADERS });
  }

  // Don't rate limit GET polling on /api/receive (frontend polls every 2s)
  if (pathname === "/api/receive" && req.method === "GET") {
    return NextResponse.next();
  }

  // Find matching rate limit config
  const configs = RATE_LIMITS[pathname];
  if (!configs) return NextResponse.next();

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  for (const config of configs) {
    const result = await checkRateLimit(
      ip,
      config.endpoint,
      config.maxRequests,
      config.windowSeconds
    );

    if (!result.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            ...CORS_HEADERS,
            "Retry-After": String(result.retryAfter ?? 60),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/generate", "/api/generate-avatar", "/api/scrape", "/api/scrape-nitter", "/api/receive"],
};
