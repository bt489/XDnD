import { NextRequest, NextResponse } from "next/server";
import type { ScrapedProfile, ScrapedTweet } from "@/types";
import { getTopWords, getTopMentions } from "@/lib/utils/helpers";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) {
    return NextResponse.json({ success: false, error: "Missing handle" }, { status: 400 });
  }

  let browser;
  try {
    // Dynamic imports for playwright
    let chromium;
    let playwright;

    if (process.env.CHROME_EXECUTABLE_PATH) {
      // Local dev: use local Chrome
      playwright = await import("playwright-core");
      browser = await playwright.chromium.launch({
        executablePath: process.env.CHROME_EXECUTABLE_PATH,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      // Production: use @sparticuz/chromium
      try {
        chromium = (await import("@sparticuz/chromium")).default;
        playwright = await import("playwright-core");
        browser = await playwright.chromium.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } catch {
        return NextResponse.json(
          { success: false, error: "Browser not available in this environment" },
          { status: 500 }
        );
      }
    }

    const { getRandomUA, SELECTORS, randomDelay } = await import("@/lib/scraper/stealth");

    const context = await browser.newContext({
      userAgent: getRandomUA(),
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // Block unnecessary resources
    await page.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (["image", "media", "font", "stylesheet"].includes(type)) {
        return route.abort();
      }
      return route.continue();
    });

    // Navigate to profile
    await page.goto(`https://x.com/${handle}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    await randomDelay();

    // Check for login wall
    const loginWall = await page.$(SELECTORS.loginWall);

    // Try to scrape what we can
    let displayName = "";
    let bio = "";
    let followersCount = 0;
    let followingCount = 0;

    try {
      const nameEl = await page.$(SELECTORS.userName);
      if (nameEl) {
        displayName = (await nameEl.innerText()).split("\n")[0] || "";
      }
    } catch { /* element not found */ }

    try {
      const bioEl = await page.$(SELECTORS.userDescription);
      if (bioEl) {
        bio = await bioEl.innerText();
      }
    } catch { /* element not found */ }

    // Collect tweets
    const tweets: ScrapedTweet[] = [];

    if (!loginWall) {
      // Scroll to load more tweets
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await randomDelay(1000, 1500);
      }

      const tweetEls = await page.$$(SELECTORS.tweet);
      for (const tweetEl of tweetEls.slice(0, 20)) {
        try {
          const textEl = await tweetEl.$(SELECTORS.tweetText);
          const text = textEl ? await textEl.innerText() : "";
          if (!text) continue;

          tweets.push({
            text: text.slice(0, 500),
            isReply: false,
            isRetweet: false,
            isThread: false,
            likesReceived: 0,
            retweetsReceived: 0,
            repliesReceived: 0,
            timestamp: "",
          });
        } catch { /* skip tweet */ }
      }
    }

    await browser.close();

    const tweetTexts = tweets.map((t) => t.text);
    const completeness = loginWall || tweets.length < 5 ? "partial" : "full";

    const profile: ScrapedProfile = {
      handle,
      displayName,
      bio,
      location: "",
      joinDate: "",
      followersCount,
      followingCount,
      tweetCount: tweets.length,
      pinnedTweet: null,
      recentTweets: tweets,
      topMentions: getTopMentions(tweetTexts),
      mostUsedWords: getTopWords(tweetTexts),
      avgEngagementRate: 0,
      completeness: completeness as "full" | "partial",
    };

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch { /* ignore */ }
    }
    console.error("Scrape error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
