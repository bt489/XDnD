"use client";

import { useEffect, useState, useCallback } from "react";
import { generateBookmarkletCode } from "@/lib/scraper/bookmarklet";

interface BookmarkletSetupProps {
  handle: string;
  sessionToken: string;
  onDataReceived: (data: unknown) => void;
  onSkip: () => void;
}

const STEPS = [
  { num: "I", text: "Drag the spell below to your bookmarks bar" },
  { num: "II", text: "Navigate to the target's profile on x.com" },
  { num: "III", text: "Click the bookmarked spell to begin scrying" },
  { num: "IV", text: "Return here — the data will appear automatically" },
];

export default function BookmarkletSetup({
  handle,
  sessionToken,
  onDataReceived,
  onSkip,
}: BookmarkletSetupProps) {
  const [bookmarkletUrl, setBookmarkletUrl] = useState("");
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    const origin = window.location.origin;
    const url = generateBookmarkletCode(origin, sessionToken);
    setBookmarkletUrl(url);
  }, [sessionToken]);

  const pollForData = useCallback(async () => {
    try {
      const res = await fetch(`/api/receive?token=${sessionToken}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          onDataReceived(data.profile);
          return true;
        }
      }
    } catch {
      // Continue polling
    }
    return false;
  }, [sessionToken, onDataReceived]);

  useEffect(() => {
    setPolling(true);
    const interval = setInterval(async () => {
      const found = await pollForData();
      if (found) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  }, [pollForData]);

  return (
    <div className="w-full max-w-lg mx-auto opacity-0 animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="font-cinzel text-[0.6rem] tracking-[0.35em] uppercase text-gold-deep/60 mb-3">
          Ritual of Divination
        </p>
        <h2 className="font-display text-3xl sm:text-4xl text-gold animate-text-glow">
          Cast the Scrying Spell
        </h2>
        <p className="font-body text-parchment/40 text-sm mt-3 italic">
          The most powerful method to divine @{handle}&apos;s true nature
        </p>
      </div>

      {/* Steps */}
      <div className="glass-panel p-6 space-y-5 mb-6">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`flex gap-4 items-start opacity-0 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex-shrink-0 w-7 h-7 rounded-sm bg-gold/5 border border-gold/20 flex items-center justify-center font-display text-gold/60 text-xs">
              {step.num}
            </div>
            <p className="font-body text-parchment/70 text-sm pt-0.5 leading-relaxed">
              {i === 1 ? (
                <>
                  Navigate to{" "}
                  <a
                    href={`https://x.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold/80 hover:text-gold underline underline-offset-2 decoration-gold/30 transition-colors"
                  >
                    x.com/{handle}
                  </a>
                </>
              ) : (
                step.text
              )}
            </p>
          </div>
        ))}

        {/* Bookmarklet draggable */}
        <div className="pt-2 flex justify-center">
          <a
            href={bookmarkletUrl || "#"}
            onClick={(e) => e.preventDefault()}
            className="inline-block px-5 py-2.5 border border-gold/30 rounded-sm font-cinzel text-sm text-gold/90 animate-ember-glow cursor-grab hover:bg-gold/5 transition-colors duration-300 select-none"
            title="Drag this to your bookmarks bar"
          >
            Scry Profile
          </a>
        </div>

        {/* Polling indicator */}
        {polling && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/40 animate-pulse" />
            <span className="text-parchment/25 text-xs font-body tracking-wide">
              Awaiting scrying data...
            </span>
          </div>
        )}
      </div>

      {/* Skip */}
      <div className="text-center">
        <button
          onClick={onSkip}
          className="text-parchment/25 hover:text-parchment/50 text-xs font-body tracking-wider transition-colors duration-300"
        >
          Skip ritual — attempt automatic divination
        </button>
      </div>
    </div>
  );
}
