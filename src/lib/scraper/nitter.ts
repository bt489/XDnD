import { NITTER_INSTANCES } from "@/lib/constants/nitter-instances";
import type { ScrapedProfile, ScrapedTweet } from "@/types";
import { getTopWords, getTopMentions } from "@/lib/utils/helpers";

function parseCount(text: string): number {
  const cleaned = text.trim().replace(/,/g, "");
  if (cleaned.endsWith("K")) return Math.round(parseFloat(cleaned) * 1000);
  if (cleaned.endsWith("M")) return Math.round(parseFloat(cleaned) * 1000000);
  return parseInt(cleaned) || 0;
}

function extractBetween(html: string, startTag: string, endTag: string): string {
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) return "";
  const contentStart = startIdx + startTag.length;
  const endIdx = html.indexOf(endTag, contentStart);
  if (endIdx === -1) return "";
  return html.slice(contentStart, endIdx).trim();
}

function extractAll(html: string, startTag: string, endTag: string): string[] {
  const results: string[] = [];
  let searchFrom = 0;
  while (true) {
    const startIdx = html.indexOf(startTag, searchFrom);
    if (startIdx === -1) break;
    const contentStart = startIdx + startTag.length;
    const endIdx = html.indexOf(endTag, contentStart);
    if (endIdx === -1) break;
    results.push(html.slice(contentStart, endIdx).trim());
    searchFrom = endIdx + endTag.length;
  }
  return results;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function scrapeNitter(handle: string): Promise<ScrapedProfile | null> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`https://${instance}/${handle}`, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      clearTimeout(timeout);

      if (!res.ok) continue;

      const html = await res.text();

      // Check if profile exists
      if (html.includes("User not found") || html.includes("does not exist")) {
        continue;
      }

      // Parse profile info
      const displayName =
        stripHtml(extractBetween(html, 'class="profile-card-fullname">', "</a>")) ||
        stripHtml(extractBetween(html, 'class="profile-card-fullname">', "</span>"));

      const bio = stripHtml(
        extractBetween(html, 'class="profile-bio">', "</p>") ||
          extractBetween(html, 'class="profile-bio">', "</div>")
      );

      // Stats
      const statsSection =
        extractBetween(html, 'class="profile-card-extra">', "</div>") || "";
      const statNumbers = statsSection.match(
        /class="profile-stat-num"[^>]*>([^<]+)</g
      );
      let tweetCount = 0;
      let followingCount = 0;
      let followersCount = 0;

      if (statNumbers && statNumbers.length >= 3) {
        const extract = (s: string) => s.replace(/.*>/, "");
        tweetCount = parseCount(extract(statNumbers[0]));
        followingCount = parseCount(extract(statNumbers[1]));
        followersCount = parseCount(extract(statNumbers[2]));
      }

      // Parse tweets
      const tweetBodies = extractAll(
        html,
        'class="tweet-content media-body"',
        "</div>"
      );

      const tweets: ScrapedTweet[] = tweetBodies.slice(0, 30).map((body) => {
        // Remove the opening >
        const text = stripHtml(body.startsWith(">") ? body.slice(1) : body);
        return {
          text: text.slice(0, 500),
          isReply: false,
          isRetweet: false,
          isThread: false,
          likesReceived: 0,
          retweetsReceived: 0,
          repliesReceived: 0,
          timestamp: "",
        };
      });

      if (!displayName && tweets.length === 0) continue;

      const tweetTexts = tweets.map((t) => t.text);

      const profile: ScrapedProfile = {
        handle,
        displayName: displayName || handle,
        bio,
        location: "",
        joinDate: "",
        followersCount,
        followingCount,
        tweetCount,
        pinnedTweet: null,
        recentTweets: tweets,
        topMentions: getTopMentions(tweetTexts),
        mostUsedWords: getTopWords(tweetTexts),
        avgEngagementRate: 0,
        completeness: tweets.length >= 10 ? "full" : "partial",
      };

      return profile;
    } catch {
      // Try next instance
      continue;
    }
  }

  return null;
}
