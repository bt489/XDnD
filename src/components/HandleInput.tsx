"use client";

import { useState } from "react";
import { sanitizeHandle } from "@/lib/utils/helpers";

interface HandleInputProps {
  onSubmit: (handle: string) => void;
  isLoading?: boolean;
}

export default function HandleInput({ onSubmit, isLoading }: HandleInputProps) {
  const [handle, setHandle] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sanitizeHandle(handle);
    if (clean) onSubmit(clean);
  };

  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-2xl mx-auto">
      {/* Title treatment */}
      <div className="text-center opacity-0 animate-fade-in-up">
        <div className="mb-6">
          <div className="inline-block font-cinzel text-[0.65rem] tracking-[0.4em] uppercase text-gold-deep/60 mb-4">
            Present your identity to the oracle
          </div>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-gold animate-text-glow leading-[1.15] tracking-wide">
          Roll for Profile
        </h1>

        <div className="ornate-divider mt-8 mb-6" />

        <p className="font-body text-lg sm:text-xl text-parchment/50 max-w-md mx-auto leading-relaxed italic">
          Transform your X presence into a D&D 5e character sheet, divined by arcane intelligence
        </p>
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md opacity-0 animate-fade-in-up stagger-3"
      >
        <div className="relative mb-4">
          {/* Glow ring when focused */}
          <div
            className="absolute -inset-[1px] rounded-[7px] transition-opacity duration-500"
            style={{
              opacity: focused ? 1 : 0,
              background:
                "linear-gradient(135deg, rgba(212,168,67,0.15), rgba(74,52,117,0.1), rgba(212,168,67,0.15))",
              filter: "blur(4px)",
            }}
          />

          <div className="relative flex items-center">
            <span className="absolute left-4 text-gold/40 font-display text-lg select-none z-10">
              @
            </span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="enter a handle"
              className="arcane-input w-full pl-10 pr-4 py-4"
              disabled={isLoading}
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!sanitizeHandle(handle) || isLoading}
          className="btn-gold w-full py-4 text-sm tracking-wider"
        >
          {isLoading ? "The dice are cast..." : "ROLL FOR CHARACTER"}
        </button>
      </form>

      {/* Subtle footer hint */}
      <div className="opacity-0 animate-fade-in stagger-6 text-center">
        <p className="text-parchment/20 text-xs font-body tracking-wider">
          Powered by two-stage arcane reasoning
        </p>
      </div>
    </div>
  );
}
