"use client";

import { useState, useEffect } from "react";

const FLAVOR_TEXTS = [
  "Scrying your digital essence...",
  "Rolling for initiative...",
  "The Dungeon Master deliberates...",
  "Consulting the ancient tomes...",
  "Attuning to your arcane signature...",
  "Deciphering the scroll of tweets...",
  "Casting Detect Personality...",
  "Weaving threads of fate...",
  "The dice gods ponder your worth...",
  "Inscribing the character scroll...",
];

interface LoadingStateProps {
  stage: "scraping" | "generating";
}

export default function LoadingState({ stage }: LoadingStateProps) {
  const [flavorIndex, setFlavorIndex] = useState(0);
  const [roll, setRoll] = useState(20);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setFlavorIndex((i) => (i + 1) % FLAVOR_TEXTS.length);
        setTransitioning(false);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoll(Math.floor(Math.random() * 20) + 1);
    }, 180);
    return () => clearInterval(interval);
  }, []);

  const stageLabel =
    stage === "scraping" ? "Scrying the Profile" : "The Dungeon Master Creates";

  return (
    <div className="flex flex-col items-center gap-10 opacity-0 animate-fade-in-up">
      {/* 3D d20 */}
      <div className="relative">
        {/* Ambient glow */}
        <div className="absolute inset-0 scale-[2] rounded-full bg-gold/5 blur-3xl animate-ember-glow" />
        <div className="absolute inset-0 scale-150 rounded-full bg-arcane/10 blur-2xl" />

        <div className="d20-scene relative z-10">
          <div className="d20-cube">
            {/* Top faces */}
            <div className="d20-tri d20-tri-1"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-2"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-3"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-4"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-5"><span>{roll}</span></div>
            {/* Bottom faces */}
            <div className="d20-tri d20-tri-6"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-7"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-8"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-9"><span>{roll}</span></div>
            <div className="d20-tri d20-tri-10"><span>{roll}</span></div>
          </div>
        </div>
      </div>

      {/* Stage + flavor */}
      <div className="text-center space-y-3">
        <p className="font-cinzel text-[0.65rem] tracking-[0.3em] uppercase text-gold-deep/70">
          {stageLabel}
        </p>

        <p
          className="font-body text-xl text-parchment/60 italic min-h-[2rem] transition-all duration-400"
          style={{ opacity: transitioning ? 0 : 1, transform: transitioning ? "translateY(4px)" : "translateY(0)" }}
        >
          {FLAVOR_TEXTS[flavorIndex]}
        </p>
      </div>

      {/* Arcane progress line */}
      <div className="w-56 h-px bg-gold/10 rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold-deep via-gold to-gold-pale rounded-full"
          style={{
            width: "40%",
            animation: "shimmer 2s ease-in-out infinite",
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </div>
  );
}
