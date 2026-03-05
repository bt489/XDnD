"use client";

import { formatModifier } from "@/lib/utils/helpers";
import type { StatName } from "@/types";

interface StatBlockProps {
  stat: StatName;
  score: number;
  reason?: string;
  compact?: boolean;
  dark?: boolean;
}

export default function StatBlock({ stat, score, reason, compact, dark }: StatBlockProps) {
  const modifier = formatModifier(score);

  return (
    <div
      className={`${dark ? "stat-block stat-block-dark" : "stat-block"} relative group`}
      title={reason}
    >
      <div
        className={`font-cinzel text-[0.6rem] tracking-[0.15em] uppercase ${
          dark ? "text-parchment/40" : "text-ink-mid/50"
        }`}
      >
        {stat}
      </div>
      <div
        className={`font-cinzel font-bold ${compact ? "text-lg" : "text-xl"} ${
          dark ? "text-parchment" : "text-ink"
        } leading-tight`}
      >
        {score}
      </div>
      <div
        className={`font-body text-sm font-semibold ${
          dark ? "text-gold" : "text-gold-deep"
        }`}
      >
        {modifier}
      </div>

      {/* Tooltip */}
      {reason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 p-3 bg-abyss/95 border border-gold/10 text-parchment/70 text-xs font-body rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-xl leading-relaxed">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-abyss/95 border-r border-b border-gold/10 rotate-45" />
          {reason}
        </div>
      )}
    </div>
  );
}
