import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { STAGE_1_SYSTEM_PROMPT, STAGE_2_SYSTEM_PROMPT } from "@/lib/constants/prompts";
import { fixCommonErrors, validateFullCharacter } from "@/lib/utils/validation";
import type { ScrapedProfile, DndCharacter, ManualProfileInput } from "@/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const anthropic = new Anthropic();

function buildProfileSummary(
  profile: ScrapedProfile,
  manualOverrides?: ManualProfileInput
): string {
  const lines: string[] = [];

  lines.push(`Handle: @${profile.handle}`);
  lines.push(`Display Name: ${manualOverrides?.displayName || profile.displayName}`);
  lines.push(`Bio: ${manualOverrides?.bio || profile.bio}`);

  if (profile.location) lines.push(`Location: ${profile.location}`);
  if (profile.joinDate) lines.push(`Joined: ${profile.joinDate}`);

  lines.push(`Followers: ${profile.followersCount.toLocaleString()}`);
  lines.push(`Following: ${profile.followingCount.toLocaleString()}`);
  lines.push(`Tweets: ${profile.tweetCount.toLocaleString()}`);

  if (profile.pinnedTweet) {
    lines.push(`\nPinned Tweet: "${profile.pinnedTweet}"`);
  }

  if (manualOverrides?.keyInterests) {
    lines.push(`\nKey Interests: ${manualOverrides.keyInterests}`);
  }
  if (manualOverrides?.communicationStyle) {
    lines.push(`Communication Style: ${manualOverrides.communicationStyle}`);
  }

  if (profile.recentTweets.length > 0) {
    lines.push(`\nRecent Tweets (${profile.recentTweets.length}):`);
    for (const tweet of profile.recentTweets.slice(0, 25)) {
      const engagement = `[${tweet.likesReceived}♥ ${tweet.retweetsReceived}⟳ ${tweet.repliesReceived}💬]`;
      const flags = [
        tweet.isReply && "reply",
        tweet.isRetweet && "RT",
        tweet.isThread && "thread",
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(`- "${tweet.text.slice(0, 280)}" ${engagement}${flags ? ` (${flags})` : ""}`);
    }
  } else if (manualOverrides?.samplePosts) {
    lines.push(`\nSample Posts:\n${manualOverrides.samplePosts}`);
  }

  if (profile.topMentions.length > 0) {
    lines.push(`\nTop Mentions: ${profile.topMentions.join(", ")}`);
  }
  if (profile.mostUsedWords.length > 0) {
    lines.push(`Most Used Words: ${profile.mostUsedWords.join(", ")}`);
  }
  if (profile.avgEngagementRate > 0) {
    lines.push(`Avg Engagement Rate: ${(profile.avgEngagementRate * 100).toFixed(2)}%`);
  }

  lines.push(`\nData Completeness: ${profile.completeness}`);

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile: ScrapedProfile = body.profile;
    const manualOverrides: ManualProfileInput | undefined = body.manualOverrides;

    if (!profile) {
      return NextResponse.json({ success: false, error: "No profile data provided" }, { status: 400 });
    }

    const profileSummary = buildProfileSummary(profile, manualOverrides);

    // Stage 1: Behavioral profile
    const stage1Response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: STAGE_1_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyze this X/Twitter profile and write a behavioral profile:\n\n${profileSummary}`,
        },
      ],
    });

    const behavioralProfile =
      stage1Response.content[0].type === "text" ? stage1Response.content[0].text : "";

    // Stage 2: D&D character generation
    const stage2Response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      system: STAGE_2_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `BEHAVIORAL PROFILE:\n${behavioralProfile}\n\nRAW PROFILE DATA:\n${profileSummary}\n\nGenerate the complete D&D 5e character sheet as JSON.`,
        },
      ],
    });

    let rawOutput =
      stage2Response.content[0].type === "text" ? stage2Response.content[0].text : "";

    // Strip markdown code fences if present
    rawOutput = rawOutput.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

    let character: DndCharacter;
    try {
      character = JSON.parse(rawOutput);
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to parse character JSON from AI response" },
        { status: 500 }
      );
    }

    // Ensure behavioral profile is set
    character.behavioralProfile = behavioralProfile;

    // Fix common mechanical errors
    character = fixCommonErrors(character);

    // Validate
    const errors = validateFullCharacter(character);
    if (errors.length > 3) {
      // Too many errors — retry stage 2 once
      const retryResponse = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        system: STAGE_2_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `BEHAVIORAL PROFILE:\n${behavioralProfile}\n\nRAW PROFILE DATA:\n${profileSummary}\n\nYour previous attempt had these mechanical errors:\n${errors.map((e) => `- ${e.field}: ${e.message} (expected: ${e.expected}, got: ${e.got})`).join("\n")}\n\nPlease fix these errors and generate the complete D&D 5e character sheet as JSON.`,
          },
        ],
      });

      let retryOutput =
        retryResponse.content[0].type === "text" ? retryResponse.content[0].text : "";
      retryOutput = retryOutput.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");

      try {
        character = JSON.parse(retryOutput);
        character.behavioralProfile = behavioralProfile;
        character = fixCommonErrors(character);
      } catch {
        // Use the first attempt's fixed version
      }
    }

    return NextResponse.json({
      success: true,
      character,
      behavioralProfile,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
