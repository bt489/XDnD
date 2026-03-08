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
      data TEXT NOT NULL,
      content_type TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
  tableCreated = true;
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

    const db = getDb();
    if (!db) {
      // Fallback: return temp URL if DB not configured
      return NextResponse.json({ success: true, imageUrl: tempUrl });
    }

    await ensureAvatarTable(db);

    const id = crypto.randomUUID();
    await db.execute({
      sql: "INSERT INTO avatar_images (id, data, content_type, created_at) VALUES (?, ?, ?, ?)",
      args: [id, base64Data, contentType, Math.floor(Date.now() / 1000)],
    });

    return NextResponse.json({ success: true, imageUrl: `/api/avatar/${id}` });
  } catch (error) {
    console.error("Avatar generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
