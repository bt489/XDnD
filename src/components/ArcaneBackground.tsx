"use client";

import { useEffect, useState } from "react";

// ── Elder Futhark runes ──
const RUNES = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛈᛇᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";

// ── D&D School of Magic SVG paths ──
const SCHOOL_GLYPHS: { name: string; path: string; viewBox: string }[] = [
  {
    name: "Abjuration",
    viewBox: "0 0 40 40",
    path: "M20 4 L36 14 L36 28 L20 38 L4 28 L4 14 Z M20 10 L28 16 L28 26 L20 32 L12 26 L12 16 Z",
  },
  {
    name: "Conjuration",
    viewBox: "0 0 40 40",
    path: "M20 4 A16 16 0 1 1 19.99 4 M20 12 A8 8 0 1 1 19.99 12 M20 2 L20 8 M20 32 L20 38 M2 20 L8 20 M32 20 L38 20",
  },
  {
    name: "Divination",
    viewBox: "0 0 40 40",
    path: "M20 8 A12 14 0 1 1 19.99 8 M20 14 A6 7 0 1 1 19.99 14 M20 18 A2 2 0 1 1 19.99 18 M8 12 Q4 20 8 28 M32 12 Q36 20 32 28",
  },
  {
    name: "Enchantment",
    viewBox: "0 0 40 40",
    path: "M20 4 L23 15 L34 15 L25 22 L28 33 L20 26 L12 33 L15 22 L6 15 L17 15 Z",
  },
  {
    name: "Evocation",
    viewBox: "0 0 40 40",
    path: "M20 4 Q24 12 22 16 Q28 10 26 18 Q32 14 28 22 Q30 28 24 26 Q26 34 20 36 Q14 34 16 26 Q10 28 12 22 Q8 14 14 18 Q12 10 18 16 Q16 12 20 4 Z",
  },
  {
    name: "Illusion",
    viewBox: "0 0 40 40",
    path: "M28 8 A12 12 0 1 1 12 28 A12 12 0 0 0 28 8 M16 16 A4 4 0 1 1 15.99 16 M14 20 L18 20 M10 6 L14 10 M30 34 L26 30",
  },
  {
    name: "Necromancy",
    viewBox: "0 0 40 40",
    path: "M20 6 A10 10 0 0 1 30 16 Q30 24 20 26 Q10 24 10 16 A10 10 0 0 1 20 6 M16 14 A2 2 0 1 1 15.99 14 M24 14 A2 2 0 1 1 23.99 14 M17 20 Q20 23 23 20 M20 26 L20 34 M16 30 L24 30",
  },
  {
    name: "Transmutation",
    viewBox: "0 0 40 40",
    path: "M20 4 L20 36 M12 8 L20 16 L28 8 M12 32 L20 24 L28 32 M4 20 L36 20 M8 12 L16 20 L8 28 M32 12 L24 20 L32 28",
  },
];

// ── D&D item silhouettes ──
const ITEM_PATHS: { viewBox: string; path: string }[] = [
  { viewBox: "0 0 24 60", path: "M12 0 L14 40 L18 42 L14 44 L14 52 L16 54 L16 56 L8 56 L8 54 L10 52 L10 44 L6 42 L10 40 Z" },
  { viewBox: "0 0 30 50", path: "M12 0 L18 0 L18 8 L22 14 Q26 22 24 32 Q22 42 15 46 Q8 42 6 32 Q4 22 8 14 L12 8 Z M12 4 L18 4" },
  { viewBox: "0 0 36 44", path: "M18 0 L36 8 L36 24 Q36 36 18 44 Q0 36 0 24 L0 8 Z M18 6 L30 12 L30 24 Q30 32 18 38 Q6 32 6 24 L6 12 Z" },
  { viewBox: "0 0 36 44", path: "M4 2 L28 2 Q32 2 32 6 L32 38 Q32 42 28 42 L4 42 L4 2 M8 2 L8 42 M12 10 L26 10 M12 16 L26 16 M12 22 L22 22" },
  { viewBox: "0 0 40 40", path: "M20 2 L37 12 L37 30 L20 38 L3 30 L3 12 Z M20 2 L20 38 M3 12 L37 12 M3 30 L37 30 M3 12 L20 22 L37 12 M3 30 L20 22 L37 30" },
  { viewBox: "0 0 20 60", path: "M10 16 L10 58 M6 58 L14 58 M10 8 A8 8 0 1 1 9.99 8 M10 4 A4 4 0 1 1 9.99 4" },
];

// ── Arcane Circle SVG ──
function ArcaneCircle({
  size, x, y, duration, delay, opacity, reverse,
}: {
  size: number; x: string; y: string; duration: number; delay: number; opacity: number; reverse?: boolean;
}) {
  const r1 = size * 0.45;
  const r2 = size * 0.35;
  const r3 = size * 0.25;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, transform: "translate(-50%, -50%)" }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{
          opacity,
          animation: `spin ${duration}s linear infinite ${reverse ? "reverse" : ""}`,
          animationDelay: `${delay}s`,
        }}
      >
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke="#e8c76a" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={r1 - 4} fill="none" stroke="#e8c76a" strokeWidth="0.5" />

        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const isMajor = i % 6 === 0;
          const inner = r1 - (isMajor ? 10 : 5);
          return (
            <line
              key={i}
              x1={cx + Math.cos(angle) * inner}
              y1={cy + Math.sin(angle) * inner}
              x2={cx + Math.cos(angle) * (r1 + 1)}
              y2={cy + Math.sin(angle) * (r1 + 1)}
              stroke="#e8c76a"
              strokeWidth={isMajor ? "0.8" : "0.3"}
            />
          );
        })}

        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const rx = cx + Math.cos(angle) * (r1 - 16);
          const ry = cy + Math.sin(angle) * (r1 - 16);
          return (
            <text
              key={i}
              x={rx} y={ry}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size * 0.045}
              fill="#e8c76a"
              transform={`rotate(${i * 30}, ${rx}, ${ry})`}
            >
              {RUNES[i % RUNES.length]}
            </text>
          );
        })}

        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="#e8c76a" strokeWidth="0.5" strokeDasharray="6 10" />
        <circle cx={cx} cy={cy} r={r3} fill="none" stroke="#e8c76a" strokeWidth="0.7" />

        {Array.from({ length: 6 }).map((_, i) => {
          const a1 = ((i * 60 - 90) * Math.PI) / 180;
          const a2 = (((i * 60 + 120) - 90) * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a1) * r3}
              y1={cy + Math.sin(a1) * r3}
              x2={cx + Math.cos(a2) * r3}
              y2={cy + Math.sin(a2) * r3}
              stroke="#e8c76a"
              strokeWidth="0.5"
            />
          );
        })}

        <circle cx={cx} cy={cy} r={3} fill="#e8c76a" />
      </svg>
    </div>
  );
}

// ── Energy Wisp ──
function EnergyWisp({ delay, duration, pathData, color }: {
  delay: number; duration: number; pathData: string; color: string;
}) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
    >
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.2"
        style={{
          strokeDasharray: 800,
          strokeDashoffset: 800,
          animation: `wispDraw ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
        }}
      />
    </svg>
  );
}

// ── Candlelight Particle ──
const CANDLE_PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  x: ((i * 31 + 7) % 100),
  startY: 100 + (i % 5) * 5,
  size: 1.5 + (i % 4) * 0.8,
  duration: 12 + (i % 8) * 3,
  delay: (i * 1.3) % 15,
  drift: ((i * 7) % 60) - 30,
  glow: 4 + (i % 3) * 4,
}));

// ── Stable layout data ──
const GLYPH_POSITIONS = SCHOOL_GLYPHS.map((_, i) => ({
  x: 5 + (i % 4) * 25,
  y: 5 + Math.floor(i / 4) * 50,
  size: 55 + (i % 3) * 12,
  duration: 18 + (i % 5) * 4,
  delay: i * 1.8,
}));

const RUNE_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  x: 3 + ((i * 17) % 94),
  y: 3 + ((i * 23) % 90),
  size: 18 + (i % 5) * 7,
  duration: 18 + (i % 6) * 5,
  delay: (i * 1.5) % 14,
  char: RUNES[i % RUNES.length],
}));

const ITEM_POSITIONS = ITEM_PATHS.map((_, i) => ({
  x: 5 + i * 16,
  y: 15 + ((i * 19) % 60),
  size: 42 + (i % 3) * 12,
  duration: 20 + (i % 4) * 6,
  delay: i * 3,
  rotation: (i * 37) % 30 - 15,
}));

const WISPS = [
  { path: "M-50 200 Q200 80 400 300 T800 200 T1050 350", delay: 0, duration: 10, color: "#d4a843" },
  { path: "M1050 150 Q800 50 600 250 T200 180 T-50 300", delay: 3, duration: 12, color: "#e8c76a" },
  { path: "M-50 550 Q250 450 500 650 T850 500 T1050 650", delay: 1.5, duration: 14, color: "#d4a843" },
  { path: "M500 -50 Q400 200 550 400 T450 700 T500 1050", delay: 5, duration: 16, color: "#7b5eae" },
  { path: "M-50 800 Q300 680 500 820 T800 720 T1050 880", delay: 7, duration: 13, color: "#c9a84c" },
  { path: "M1050 50 Q700 150 500 50 T200 150 T-50 50", delay: 2.5, duration: 11, color: "#5a3d8a" },
  { path: "M-50 400 Q150 300 350 450 T650 350 T1050 500", delay: 4, duration: 15, color: "#e8c76a" },
  { path: "M1050 700 Q800 600 550 750 T250 650 T-50 750", delay: 6, duration: 12, color: "#b8922e" },
];

// ── Main Background Component ──
export default function ArcaneBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="fixed inset-0 z-0 bg-[#08080f]" />;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base atmosphere — warm amber and arcane purple pools of light */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% -5%, rgba(74, 52, 117, 0.22) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 10% 85%, rgba(212, 168, 67, 0.08) 0%, transparent 45%),
            radial-gradient(ellipse 50% 40% at 92% 65%, rgba(139, 30, 30, 0.06) 0%, transparent 40%),
            radial-gradient(ellipse 45% 35% at 72% 15%, rgba(107, 79, 160, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse 50% 40% at 30% 40%, rgba(212, 168, 67, 0.04) 0%, transparent 40%),
            #08080f
          `,
        }}
      />

      {/* ── Arcane Circles (more prominent) ── */}
      <ArcaneCircle size={700} x="50%" y="45%" duration={100} delay={0} opacity={0.13} />
      <ArcaneCircle size={420} x="10%" y="20%" duration={80} delay={0} opacity={0.09} reverse />
      <ArcaneCircle size={350} x="90%" y="75%" duration={90} delay={0} opacity={0.08} />
      <ArcaneCircle size={260} x="80%" y="10%" duration={70} delay={0} opacity={0.065} reverse />
      <ArcaneCircle size={240} x="20%" y="80%" duration={65} delay={0} opacity={0.06} />

      {/* ── Energy Wisps (thicker, brighter) ── */}
      {WISPS.map((w, i) => (
        <EnergyWisp key={`wisp-${i}`} pathData={w.path} delay={w.delay} duration={w.duration} color={w.color} />
      ))}

      {/* ── School of Magic Glyphs (bigger, brighter) ── */}
      {SCHOOL_GLYPHS.map((glyph, i) => {
        const pos = GLYPH_POSITIONS[i];
        return (
          <div
            key={glyph.name}
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: pos.size,
              height: pos.size,
              opacity: 0.25,
              animation: `glyphFloat ${pos.duration}s ease-in-out infinite`,
              animationDelay: `${pos.delay}s`,
            }}
          >
            <svg viewBox={glyph.viewBox} width="100%" height="100%">
              <path
                d={glyph.path}
                fill="none"
                stroke="#e8c76a"
                strokeWidth="1.2"
                filter="url(#glyphGlow)"
              />
            </svg>
          </div>
        );
      })}

      {/* ── Drifting Runes (bigger, brighter) ── */}
      {RUNE_POSITIONS.map((r, i) => (
        <div
          key={`rune-${i}`}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${r.x}%`,
            top: `${r.y}%`,
            fontSize: r.size,
            color: "#e8c76a",
            opacity: 0.2,
            textShadow: "0 0 8px rgba(212, 168, 67, 0.4)",
            animation: `runeDrift ${r.duration}s ease-in-out infinite`,
            animationDelay: `${r.delay}s`,
          }}
        >
          {r.char}
        </div>
      ))}

      {/* ── D&D Item Silhouettes (bigger, brighter) ── */}
      {ITEM_PATHS.map((item, i) => {
        const pos = ITEM_POSITIONS[i];
        return (
          <div
            key={`item-${i}`}
            className="absolute pointer-events-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: pos.size,
              height: pos.size,
              opacity: 0.18,
              transform: `rotate(${pos.rotation}deg)`,
              animation: `itemFloat ${pos.duration}s ease-in-out infinite`,
              animationDelay: `${pos.delay}s`,
            }}
          >
            <svg viewBox={item.viewBox} width="100%" height="100%">
              <path d={item.path} fill="none" stroke="#e8c76a" strokeWidth="1" />
            </svg>
          </div>
        );
      })}

      {/* ── Candlelight Particles (floating golden motes) ── */}
      {CANDLE_PARTICLES.map((p, i) => (
        <div
          key={`candle-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            bottom: `-${p.size * 3}px`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(232, 199, 106, 0.9), rgba(212, 168, 67, 0.4))`,
            boxShadow: `0 0 ${p.glow}px ${p.glow / 2}px rgba(212, 168, 67, 0.35)`,
            animation: `candleRise ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* SVG filter for glyph glow */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <filter id="glyphGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Vignette — softer to let more background show */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 35%, rgba(8, 8, 15, 0.65) 100%)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
