import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client/web";
import type { ScrapedProfile } from "@/types";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  return createClient({ url, authToken });
}

let tableCreated = false;

async function ensureProfileTable(db: ReturnType<typeof createClient>) {
  if (tableCreated) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS pending_profiles (
      token TEXT PRIMARY KEY,
      profile TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `);
  tableCreated = true;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(req: NextRequest) {
  try {
    // Reject oversized payloads
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 100_000) {
      return NextResponse.json(
        { success: false, error: "Payload too large" },
        { status: 413, headers: CORS_HEADERS }
      );
    }

    // Support both JSON and form-encoded data (form used to bypass CSP on x.com)
    const contentType = req.headers.get("content-type") || "";
    let token: string | undefined;
    let profile: ScrapedProfile | undefined;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const dataStr = formData.get("data");
      if (typeof dataStr === "string") {
        const parsed = JSON.parse(dataStr);
        token = parsed.token;
        profile = parsed.profile;
      }
    } else {
      const body = await req.json();
      token = body.token;
      profile = body.profile;
    }

    if (!token || !profile) {
      return NextResponse.json(
        { success: false, error: "Missing token or profile" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Validate token format (alphanumeric, 10-50 chars)
    if (typeof token !== "string" || token.length < 10 || token.length > 50 || !/^[a-z0-9]+$/i.test(token)) {
      return NextResponse.json(
        { success: false, error: "Invalid token format" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Storage not configured" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    await ensureProfileTable(db);

    // Store with 5-minute TTL
    const expiresAt = Math.floor(Date.now() / 1000) + 5 * 60;
    await db.execute({
      sql: "INSERT OR REPLACE INTO pending_profiles (token, profile, expires_at) VALUES (?, ?, ?)",
      args: [token, JSON.stringify(profile), expiresAt],
    });

    return NextResponse.json({ success: true, token }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400, headers: CORS_HEADERS }
    );
  }
}

export async function GET(req: NextRequest) {
  const headers = { "Access-Control-Allow-Origin": "*" };

  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token" },
      { status: 400, headers }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ success: false, profile: null }, { headers });
  }

  await ensureProfileTable(db);

  const now = Math.floor(Date.now() / 1000);

  // Clean expired entries
  await db.execute({ sql: "DELETE FROM pending_profiles WHERE expires_at < ?", args: [now] });

  // Fetch profile
  const result = await db.execute({
    sql: "SELECT profile FROM pending_profiles WHERE token = ? AND expires_at >= ?",
    args: [token, now],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ success: false, profile: null }, { headers });
  }

  const profile = JSON.parse(result.rows[0].profile as string);

  // Delete after retrieval (one-time use)
  await db.execute({ sql: "DELETE FROM pending_profiles WHERE token = ?", args: [token] });

  return NextResponse.json({ success: true, profile }, { headers });
}

export async function OPTIONS() {
  return NextResponse.json(null, { headers: CORS_HEADERS });
}
