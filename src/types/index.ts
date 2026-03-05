// ── Scraped Profile Data ──

export interface ScrapedTweet {
  text: string;
  isReply: boolean;
  isRetweet: boolean;
  isThread: boolean;
  likesReceived: number;
  retweetsReceived: number;
  repliesReceived: number;
  timestamp: string;
}

export interface ScrapedProfile {
  handle: string;
  displayName: string;
  bio: string;
  location: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  pinnedTweet: string | null;
  recentTweets: ScrapedTweet[];
  topMentions: string[];
  mostUsedWords: string[];
  avgEngagementRate: number;
  completeness: "full" | "partial" | "manual";
}

// ── D&D Character ──

export interface SpellInfo {
  name: string;
  reason: string;
}

export interface FeatureInfo {
  name: string;
  description: string;
}

export interface SignatureAbility {
  name: string;
  description: string;
}

export type StatName = "STR" | "DEX" | "CON" | "INT" | "WIS" | "CHA";

export type Stats = Record<StatName, number>;

export type SpellSlotLevel = "1st" | "2nd" | "3rd" | "4th" | "5th";

export interface DndCharacter {
  behavioralProfile: string;
  name: string;
  race: string;
  raceReason: string;
  class: string;
  subclass: string;
  classReason: string;
  level: number;
  background: string;
  alignment: string;
  alignmentReason: string;
  stats: Stats;
  statReasons: Record<StatName, string>;
  hp: number;
  ac: number;
  proficiencyBonus: number;
  speed: number;
  savingThrows: StatName[];
  skillProficiencies: string[];
  spellcastingAbility: StatName | null;
  spellSlots: Record<SpellSlotLevel, number>;
  spellsKnown: SpellInfo[];
  features: FeatureInfo[];
  signatureAbility: SignatureAbility;
  backstory: string;
  flaw: string;
  ideal: string;
  bond: string;
  personalityTraits: string[];
}

// ── API Types ──

export interface GenerateRequest {
  profile: ScrapedProfile;
  manualOverrides?: ManualProfileInput;
}

export interface GenerateResponse {
  success: boolean;
  character?: DndCharacter;
  behavioralProfile?: string;
  error?: string;
}

export interface ScrapeResponse {
  success: boolean;
  profile?: ScrapedProfile;
  error?: string;
}

export interface ManualProfileInput {
  displayName: string;
  bio: string;
  keyInterests: string;
  communicationStyle: "casual" | "professional" | "humorous" | "academic" | "provocative";
  samplePosts: string;
  followerCount?: number;
  accountAge?: string;
}

// ── App State ──

export type AppState =
  | "idle"
  | "bookmarklet"
  | "scraping"
  | "manual"
  | "generating"
  | "done"
  | "error";
