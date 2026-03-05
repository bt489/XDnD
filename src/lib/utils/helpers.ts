export function formatModifier(score: number): string {
  const mod = calculateModifier(score);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function sanitizeHandle(input: string): string {
  return input.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 15);
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const STOP_WORDS = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there",
  "their", "what", "so", "up", "out", "if", "about", "who", "get",
  "which", "go", "me", "when", "make", "can", "like", "time", "no",
  "just", "him", "know", "take", "people", "into", "year", "your",
  "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first",
  "well", "way", "even", "new", "want", "because", "any", "these",
  "give", "day", "most", "us", "is", "are", "was", "were", "been",
  "has", "had", "did", "does", "am", "rt", "im", "dont", "ive",
  "its", "thats", "youre", "cant", "wont", "isnt", "arent",
]);

export function getTopWords(texts: string[], count = 10): string[] {
  const freq: Record<string, number> = {};
  for (const text of texts) {
    const words = text
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    for (const word of words) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

export function getTopMentions(texts: string[], count = 5): string[] {
  const freq: Record<string, number> = {};
  for (const text of texts) {
    const mentions = text.match(/@\w+/g) || [];
    for (const mention of mentions) {
      const handle = mention.toLowerCase();
      freq[handle] = (freq[handle] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([mention]) => mention);
}
