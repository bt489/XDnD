# Roll for Profile

Transform your X/Twitter personality into a personalized D&D 5e character sheet using AI.

## Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create `.env.local` with your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
CHROME_EXECUTABLE_PATH=C:/Program Files/Google/Chrome/Application/chrome.exe
```

The `CHROME_EXECUTABLE_PATH` is optional — only needed if you want the Playwright scraper fallback to work locally. Leave blank to skip.

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

### 4-Tier Data Collection Cascade

1. **Bookmarklet** (primary) — User drags a "Scry Profile" bookmarklet to their bookmarks bar, visits any X profile, clicks it. Since it runs in the user's authenticated browser session, it gets full access to all profile data with zero bot detection.

2. **Playwright** (fallback) — Server-side headless browser attempts to scrape the profile. Often blocked by X's login wall, so returns partial data.

3. **Nitter** (fallback) — Tries public Nitter proxy instances to fetch profile data from their static HTML pages.

4. **Manual Input** (last resort) — User fills in a form with their display name, bio, interests, and sample posts.

### Two-Stage AI Generation

- **Stage 1**: Claude analyzes the profile data and writes a ~200-word behavioral profile in plain English (no D&D terms).
- **Stage 2**: Claude translates the behavioral profile into a mechanically valid D&D 5e character sheet with cited evidence for every major choice.

Post-processing auto-corrects calculable fields (HP, spell slots, proficiency bonus) and validates against PHB rules.

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Set `ANTHROPIC_API_KEY` in Vercel environment variables. The Playwright scraper uses `@sparticuz/chromium` in production.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Claude API (`@anthropic-ai/sdk`)
- Playwright Core (optional, for scraping)
- html2canvas (for PNG export)
