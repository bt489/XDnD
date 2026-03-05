"use client";

import { forwardRef } from "react";
import { formatModifier } from "@/lib/utils/helpers";
import type { DndCharacter, StatName } from "@/types";

interface ShareableCardProps {
  character: DndCharacter;
  handle: string;
}

const STAT_ORDER: StatName[] = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

const ShareableCard = forwardRef<HTMLDivElement, ShareableCardProps>(
  function ShareableCard({ character, handle }, ref) {
    return (
      <div
        ref={ref}
        className="parchment-card ornate-border relative w-[600px] max-w-full p-8 overflow-hidden"
        style={{ minHeight: 820 }}
      >
        {/* Corner ornaments (top-left, top-right, bottom-left, bottom-right) */}
        {[
          "top-3 left-3",
          "top-3 right-3 -scale-x-100",
          "bottom-3 left-3 -scale-y-100",
          "bottom-3 right-3 -scale-x-100 -scale-y-100",
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute ${pos} w-8 h-8 pointer-events-none z-[2]`}
            style={{
              borderLeft: "2px solid rgba(160, 125, 46, 0.25)",
              borderTop: "2px solid rgba(160, 125, 46, 0.25)",
            }}
          />
        ))}

        {/* ─── Header ─── */}
        <div className="text-center mb-5 relative z-[2]">
          <h1
            className="font-display text-[1.7rem] sm:text-3xl font-bold tracking-wide leading-tight"
            style={{
              color: "#1a0e08",
              textShadow: "0 1px 2px rgba(160, 125, 46, 0.15)",
            }}
          >
            {character.name}
          </h1>
          <p className="font-body text-ink-mid/40 text-sm mt-0.5 italic">@{handle}</p>
        </div>

        {/* ─── Class Badge ─── */}
        <div className="flex justify-center mb-4 relative z-[2]">
          <div
            className="inline-flex items-baseline gap-1.5 px-5 py-1.5 rounded-sm"
            style={{
              background: "rgba(26, 14, 8, 0.06)",
              border: "1px solid rgba(160, 125, 46, 0.2)",
            }}
          >
            <span className="font-cinzel text-sm text-ink font-semibold tracking-wide">
              Level {character.level}
            </span>
            <span className="font-body text-ink-mid/60 text-xs">/</span>
            <span className="font-cinzel text-sm text-ink font-semibold">
              {character.race} {character.class}
            </span>
            {character.subclass && (
              <span className="font-body text-ink-mid/40 text-xs italic ml-0.5">
                ({character.subclass})
              </span>
            )}
          </div>
        </div>

        {/* ─── Alignment ─── */}
        <p className="text-center font-body text-ink-mid/50 text-sm italic mb-5 relative z-[2]">
          {character.alignment}
        </p>

        {/* ─── Divider ─── */}
        <div className="ornate-divider ornate-divider-ink mb-5 relative z-[2]" />

        {/* ─── Stats Row ─── */}
        <div className="flex justify-center gap-2.5 mb-6 relative z-[2]">
          {STAT_ORDER.map((stat) => (
            <div key={stat} className="stat-block" title={character.statReasons[stat]}>
              <div className="font-cinzel text-[0.55rem] tracking-[0.15em] uppercase text-ink-mid/40">
                {stat}
              </div>
              <div className="font-cinzel text-lg font-bold text-ink leading-tight">
                {character.stats[stat]}
              </div>
              <div className="font-body text-sm font-semibold text-gold-deep">
                {formatModifier(character.stats[stat])}
              </div>
            </div>
          ))}
        </div>

        {/* ─── Signature Ability ─── */}
        <div
          className="mb-5 p-4 rounded-sm relative z-[2]"
          style={{
            background:
              "linear-gradient(135deg, rgba(160, 125, 46, 0.06), rgba(26, 14, 8, 0.02))",
            border: "1px solid rgba(160, 125, 46, 0.18)",
          }}
        >
          <h3 className="font-cinzel text-xs tracking-[0.1em] uppercase text-gold-deep font-semibold mb-1.5">
            {character.signatureAbility.name}
          </h3>
          <p className="font-body text-ink/75 text-sm leading-relaxed">
            {character.signatureAbility.description}
          </p>
        </div>

        {/* ─── Backstory ─── */}
        <div className="mb-5 relative z-[2]">
          <h3 className="section-header-ink section-header text-xs">Backstory</h3>
          <p className="font-body text-ink/70 text-sm leading-relaxed line-clamp-4">
            {character.backstory}
          </p>
        </div>

        {/* ─── Flaw ─── */}
        <div
          className="p-3.5 rounded-sm mb-6 relative z-[2]"
          style={{
            background: "rgba(122, 22, 22, 0.04)",
            border: "1px solid rgba(122, 22, 22, 0.12)",
          }}
        >
          <h3
            className="font-cinzel text-[0.6rem] tracking-[0.12em] uppercase font-semibold mb-1"
            style={{ color: "#7a1616" }}
          >
            Fatal Flaw
          </h3>
          <p className="font-body text-ink/70 text-sm italic leading-relaxed">
            {character.flaw}
          </p>
        </div>

        {/* ─── Footer ─── */}
        <div className="ornate-divider ornate-divider-ink relative z-[2]" />
        <div className="text-center pt-3 relative z-[2]">
          <p
            className="font-cinzel text-[0.55rem] tracking-[0.25em] uppercase"
            style={{ color: "rgba(26, 14, 8, 0.2)" }}
          >
            Roll for Profile
          </p>
        </div>
      </div>
    );
  }
);

export default ShareableCard;
