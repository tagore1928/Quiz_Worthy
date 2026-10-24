import React, { useMemo } from 'react';

// Page backdrop: faint circuit-board traces in the signal colour with solder pads,
// a soft glow in the top-right corner, and a fade to black towards the bottom.

const W = 1440;
const H = 900;
const STEP = 24;

// Small seeded PRNG so the pattern is identical on every render and page load.
const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

interface Trace {
  d: string;
  end: [number, number];
  start: [number, number];
  bright: boolean;
}

// Builds orthogonal traces with the occasional 45° jog, snapped to a 24px grid.
const buildTraces = (count: number, seed: number): Trace[] => {
  const rand = mulberry32(seed);
  const pick = <T,>(items: T[]) => items[Math.floor(rand() * items.length)];
  const range = (min: number, max: number) => min + Math.floor(rand() * ((max - min) / STEP)) * STEP;

  return Array.from({ length: count }, () => {
    let x = range(0, W);
    let y = range(0, H);
    const start: [number, number] = [x, y];
    let d = `M${x},${y}`;
    const segments = 2 + Math.floor(rand() * 4);
    for (let i = 0; i < segments; i++) {
      if (rand() < 0.5) x += pick([-1, 1]) * range(48, 240);
      else y += pick([-1, 1]) * range(48, 192);
      if (rand() < 0.35) {
        const jog = pick([-1, 1]) * STEP;
        x += jog;
        y += jog;
      }
      d += ` L${x},${y}`;
    }
    return { d, start, end: [x, y], bright: rand() < 0.18 };
  });
};

export const Backdrop: React.FC = () => {
  const traces = useMemo(() => buildTraces(52, 7), []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Soft glow in the top-right corner */}
      <div
        className="absolute -right-40 -top-52 w-[760px] h-[620px]"
        style={{ background: 'radial-gradient(closest-side, rgba(200,241,53,0.13), transparent)' }}
      />

      {/* Circuit traces */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-70 sm:opacity-100"
      >
        {traces.map((t, i) => (
          <path
            key={i}
            d={t.d}
            fill="none"
            stroke="#c8f135"
            strokeOpacity={t.bright ? 0.32 : 0.1}
            strokeWidth={t.bright ? 1.3 : 1}
            strokeLinejoin="round"
          />
        ))}
        {traces.map((t, i) => (
          <g key={`pads-${i}`} fill="#070908" stroke="#c8f135" strokeOpacity={t.bright ? 0.6 : 0.25}>
            <circle cx={t.end[0]} cy={t.end[1]} r={3.2} />
            {t.bright && <circle cx={t.start[0]} cy={t.start[1]} r={2.4} />}
          </g>
        ))}
      </svg>

      {/* Fade towards the bottom so long pages stay calm */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 30%, #070908 95%)' }} />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
};

export default Backdrop;
