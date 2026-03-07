import { createClient, type Client } from "@libsql/client/web";

let client: Client | null = null;
let tableCreated = false;

function getClient(): Client | null {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) return null;

  client = createClient({ url, authToken });
  return client;
}

async function ensureTable(db: Client) {
  if (tableCreated) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
    ON rate_limits (ip, endpoint, created_at)
  `);
  tableCreated = true;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

export async function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const db = getClient();
  if (!db) return { allowed: true }; // graceful fallback for local dev

  await ensureTable(db);

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - windowSeconds;

  // Clean expired entries for this IP+endpoint
  await db.execute({
    sql: "DELETE FROM rate_limits WHERE ip = ? AND endpoint = ? AND created_at < ?",
    args: [ip, endpoint, windowStart],
  });

  // Count entries in current window
  const result = await db.execute({
    sql: "SELECT COUNT(*) as count, MIN(created_at) as oldest FROM rate_limits WHERE ip = ? AND endpoint = ? AND created_at >= ?",
    args: [ip, endpoint, windowStart],
  });

  const count = Number(result.rows[0].count);

  if (count >= maxRequests) {
    const oldest = Number(result.rows[0].oldest);
    const retryAfter = oldest + windowSeconds - now;
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  // Record this request
  await db.execute({
    sql: "INSERT INTO rate_limits (ip, endpoint, created_at) VALUES (?, ?, ?)",
    args: [ip, endpoint, now],
  });

  return { allowed: true };
}

export interface RateLimitConfig {
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMITS: Record<string, RateLimitConfig[]> = {
  "/api/generate": [
    { endpoint: "/api/generate", maxRequests: 3, windowSeconds: 15 * 60 },
    { endpoint: "/api/generate-daily", maxRequests: 10, windowSeconds: 24 * 60 * 60 },
  ],
  "/api/scrape": [
    { endpoint: "/api/scrape", maxRequests: 10, windowSeconds: 15 * 60 },
  ],
  "/api/scrape-nitter": [
    { endpoint: "/api/scrape-nitter", maxRequests: 10, windowSeconds: 15 * 60 },
  ],
  "/api/receive": [
    { endpoint: "/api/receive", maxRequests: 30, windowSeconds: 15 * 60 },
  ],
};
