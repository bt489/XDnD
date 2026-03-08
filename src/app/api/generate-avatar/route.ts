import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
    let imageUrl: string;

    if (typeof results[0] === "string") {
      imageUrl = results[0];
    } else if (results[0] && typeof results[0] === "object" && "url" in results[0]) {
      imageUrl = String(results[0].url());
    } else {
      imageUrl = String(results[0]);
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Avatar generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
