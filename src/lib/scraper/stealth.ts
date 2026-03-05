export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
];

export function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function randomDelay(min = 800, max = 2000): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min) + min);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Common X.com data-testid selectors
export const SELECTORS = {
  userName: '[data-testid="UserName"]',
  userDescription: '[data-testid="UserDescription"]',
  tweetText: '[data-testid="tweetText"]',
  tweet: '[data-testid="tweet"]',
  like: '[data-testid="like"]',
  unlike: '[data-testid="unlike"]',
  retweet: '[data-testid="retweet"]',
  unretweet: '[data-testid="unretweet"]',
  reply: '[data-testid="reply"]',
  loginWall: '[data-testid="loginButton"]',
} as const;
