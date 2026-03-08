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

// Icosahedron face geometry: 4 rings of 5 faces each
// Polar angles derived from icosahedron vertex positions on unit sphere
const POLAR_CAP = 52.7;   // degrees from equator to top/bottom cap faces
const POLAR_BAND = 10.8;  // degrees from equator to upper/lower band faces
const TZ = 38;             // translateZ = inradius for edge length 50px
// The clip-path triangle centroid is 7.17px below the element center.
// Append translateY(-7.17px) to every face transform to align the centroid
// with the transform pivot (element center) so faces don't overlap.
const CENTROID_FIX = "translateY(-7.17px)";

interface FaceDef {
  transform: string;
  colorClass: string;
  inverted: boolean;
}

const D20_FACES: FaceDef[] = [];

// Top cap: 5 faces (apex up), normals tilt upward (+rotateX)
for (let n = 0; n < 5; n++) {
  D20_FACES.push({
    transform: `rotateY(${36 + n * 72}deg) rotateX(${POLAR_CAP}deg) translateZ(${TZ}px) ${CENTROID_FIX}`,
    colorClass: "d20-tc",
    inverted: false,
  });
}
// Upper band: 5 faces (inverted), normals tilt slightly upward
for (let n = 0; n < 5; n++) {
  D20_FACES.push({
    transform: `rotateY(${36 + n * 72}deg) rotateX(${POLAR_BAND}deg) translateZ(${TZ}px) rotateZ(180deg) ${CENTROID_FIX}`,
    colorClass: "d20-ub",
    inverted: true,
  });
}
// Lower band: 5 faces (apex up), normals tilt slightly downward
for (let n = 0; n < 5; n++) {
  D20_FACES.push({
    transform: `rotateY(${n * 72}deg) rotateX(-${POLAR_BAND}deg) translateZ(${TZ}px) ${CENTROID_FIX}`,
    colorClass: "d20-lb",
    inverted: false,
  });
}
// Bottom cap: 5 faces (inverted), normals tilt downward (-rotateX)
for (let n = 0; n < 5; n++) {
  D20_FACES.push({
    transform: `rotateY(${n * 72}deg) rotateX(-${POLAR_CAP}deg) translateZ(${TZ}px) rotateZ(180deg) ${CENTROID_FIX}`,
    colorClass: "d20-bc",
    inverted: true,
  });
}

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
            {D20_FACES.map((face, i) => (
              <div
                key={i}
                className={`d20-face ${face.colorClass}${face.inverted ? " d20-inv" : ""}`}
                style={{ transform: face.transform }}
              >
                <span>{roll}</span>
              </div>
            ))}
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
