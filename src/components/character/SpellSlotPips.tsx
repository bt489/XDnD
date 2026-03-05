"use client";

import type { SpellSlotLevel } from "@/types";

interface SpellSlotPipsProps {
  spellSlots: Record<SpellSlotLevel, number>;
}

const LEVELS: SpellSlotLevel[] = ["1st", "2nd", "3rd", "4th", "5th"];

export default function SpellSlotPips({ spellSlots }: SpellSlotPipsProps) {
  const hasSlots = LEVELS.some((lvl) => spellSlots[lvl] > 0);
  if (!hasSlots) return null;

  return (
    <div className="space-y-3">
      {LEVELS.map((level) => {
        const count = spellSlots[level];
        if (count === 0) return null;
        return (
          <div key={level} className="flex items-center gap-4">
            <span className="font-cinzel text-xs text-parchment/40 w-8 tracking-wider">
              {level}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="pip-filled" />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
