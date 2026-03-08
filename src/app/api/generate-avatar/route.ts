import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import crypto from "crypto";
import { createClient } from "@libsql/client/web";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  return createClient({ url, authToken });
}

let tableCreated = false;

async function ensureAvatarTable(db: ReturnType<typeof createClient>) {
  if (tableCreated) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS avatar_images (
      id TEXT PRIMARY KEY,
      traits_hash TEXT,
      data TEXT NOT NULL,
      content_type TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  // Add traits_hash column to existing tables (no-op if already present)
  await db.execute("ALTER TABLE avatar_images ADD COLUMN traits_hash TEXT").catch(() => {});
  tableCreated = true;
}

function traitsHash(race: string, characterClass: string, subclass: string | undefined, alignment: string | undefined): string {
  const key = [race, characterClass, subclass || "", alignment || "neutral"]
    .map((s) => s.toLowerCase().trim())
    .join("|");
  return crypto.createHash("sha256").update(key).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { success: false, error: "Image generation not configured" },
        { status: 500 }
      );
    }

    const { race, characterClass, subclass, alignment } = await req.json();

    if (!race || !characterClass) {
      return NextResponse.json(
        { success: false, error: "Missing race or class" },
        { status: 400 }
      );
    }

    // Check cache first — reuse existing avatar for the same trait combo
    const hash = traitsHash(race, characterClass, subclass, alignment);
    const db = getDb();
    if (db) {
      await ensureAvatarTable(db);
      const cached = await db.execute({
        sql: "SELECT id FROM avatar_images WHERE traits_hash = ? LIMIT 1",
        args: [hash],
      });
      if (cached.rows.length > 0) {
        return NextResponse.json({ success: true, imageUrl: `/api/avatar/${cached.rows[0].id}` });
      }
    }

    const subclassStr = subclass ? ` (${subclass})` : "";
    const prompt = `Fantasy portrait of a ${race} ${characterClass}${subclassStr}, ${alignment || "neutral"} alignment. Dungeons and Dragons character art style, dramatic cinematic lighting, detailed fantasy illustration, oil painting aesthetic, dark atmospheric background, upper body portrait, facing slightly to the side, intricate armor and clothing details appropriate to their class.`;

    const replicate = new Replicate({ auth: apiToken });

    const output = await replicate.run("black-forest-labs/flux-dev", {
      input: {
        prompt,
        aspect_ratio: "3:4",
        output_quality: 80,
        num_outputs: 1,
      },
    });

    // FLUX Dev returns an array of FileOutput objects (ReadableStream with url)
    const results = output as Array<{ url: () => string } | string>;
    let tempUrl: string;

    if (typeof results[0] === "string") {
      tempUrl = results[0];
    } else if (results[0] && typeof results[0] === "object" && "url" in results[0]) {
      tempUrl = String(results[0].url());
    } else {
      tempUrl = String(results[0]);
    }

    // Fetch the image from the temporary CDN URL and persist it
    const imageResponse = await fetch(tempUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch generated image" },
        { status: 500 }
      );
    }

    const contentType = imageResponse.headers.get("content-type") || "image/webp";
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Data = imageBuffer.toString("base64");

    if (!db) {
      // Fallback: return temp URL if DB not configured
      return NextResponse.json({ success: true, imageUrl: tempUrl });
    }

    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO avatar_images (id, traits_hash, data, content_type, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [id, hash, base64Data, contentType, Math.floor(Date.now() / 1000)],
    });

    return NextResponse.json({ success: true, imageUrl: `/api/avatar/${id}` });
  } catch (error) {
    console.error("Avatar generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
