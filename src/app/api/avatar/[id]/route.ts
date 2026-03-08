import { NextRequest } from "next/server";
import { createClient } from "@libsql/client/web";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  return createClient({ url, authToken });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const db = getDb();
  if (!db) {
    return new Response("Storage not configured", { status: 500 });
  }

  const result = await db.execute({
    sql: "SELECT data, content_type FROM avatar_images WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  const row = result.rows[0];
  const buffer = Buffer.from(row.data as string, "base64");

  return new Response(buffer, {
    headers: {
      "Content-Type": row.content_type as string,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
