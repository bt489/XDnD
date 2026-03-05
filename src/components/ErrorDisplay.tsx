"use client";

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

const ERROR_THEMES: Record<string, { title: string; flavor: string }> = {
  scrape: {
    title: "The Scrying Spell Shattered",
    flavor: "Magical wards around this profile proved impenetrable to our divination.",
  },
  generate: {
    title: "The Oracle Falls Silent",
    flavor: "The cosmic forces of arcane intelligence are temporarily misaligned.",
  },
  parse: {
    title: "The Scroll Is Illegible",
    flavor: "The character sheet materialized, but the ink ran before it could be read.",
  },
  default: {
    title: "A Rift in the Weave",
    flavor: "An unexpected disturbance in the magical fabric.",
  },
};

function getTheme(error: string) {
  const lower = error.toLowerCase();
  if (lower.includes("scrape") || lower.includes("profile")) return ERROR_THEMES.scrape;
  if (lower.includes("parse") || lower.includes("json")) return ERROR_THEMES.parse;
  if (lower.includes("api") || lower.includes("generate")) return ERROR_THEMES.generate;
  return ERROR_THEMES.default;
}

export default function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  const theme = getTheme(error);

  return (
    <div className="max-w-md mx-auto text-center opacity-0 animate-fade-in-up">
      {/* Skull icon */}
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 scale-[3] bg-crimson/5 blur-3xl rounded-full" />
        <div className="relative text-5xl">&#128128;</div>
      </div>

      <h2 className="font-display text-2xl text-crimson-light mb-3">{theme.title}</h2>
      <p className="font-body text-parchment/40 italic mb-6">{theme.flavor}</p>

      <div className="glass-panel px-4 py-3 mb-8 inline-block">
        <p className="text-parchment/25 text-xs font-mono break-all">{error}</p>
      </div>

      <div>
        <button onClick={onRetry} className="btn-gold px-8 py-3 text-sm tracking-wider">
          ATTEMPT AGAIN
        </button>
      </div>
    </div>
  );
}
