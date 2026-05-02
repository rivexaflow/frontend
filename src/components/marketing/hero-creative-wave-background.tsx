"use client";

import { useId } from "react";

/** Fewer vertical facets = lighter SVG repaint; wash layer carries most of the color. */
const BLADE_COUNT = 42;

/**
 * Vertical “blade” facets (corrugated panels) matching the corrugated reference:
 * alternating light ridges; a soft centred blue→lavender wash only in the middle band.
 */

export function HeroCreativeWaveBackground({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");

  const blades = Array.from({ length: BLADE_COUNT }, (_, i) => {
    const step = 100 / BLADE_COUNT;
    const x = i * step;
    const flipped = i % 2 === 0;
    return { key: i, x, step, flipped };
  });

  return (
    <div
      className={`pointer-events-none absolute inset-0 isolate overflow-hidden bg-white ${className ?? ""}`}
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Facet light ↔ shadow (alternating direction per blade) */}
          <linearGradient id={`${uid}-facetA`} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#fefefe" />
            <stop offset="52%" stopColor="#e9eef9" />
            <stop offset="100%" stopColor="#f7f9ff" />
          </linearGradient>
          <linearGradient id={`${uid}-facetB`} x1="100%" y1="0%" x2="0%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#fbfbfd" />
            <stop offset="48%" stopColor="#e6ecf7" />
            <stop offset="100%" stopColor="#fefefe" />
          </linearGradient>

          {/* Soft band where colour meets white at sides */}
          <radialGradient id={`${uid}-midMask`} cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
            <stop offset="58%" stopColor="#ffffff" stopOpacity={0.92} />
            <stop offset="82%" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>

          <linearGradient id={`${uid}-tintMid`} x1="30%" y1="0%" x2="72%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#c9ddff" stopOpacity={0.78} />
            <stop offset="48%" stopColor="#d9e8ff" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#ddd3ff" stopOpacity={0.78} />
          </linearGradient>

          <linearGradient id={`${uid}-bottomVeil`} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="70%" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0.55} />
          </linearGradient>

          <linearGradient id={`${uid}-topSheen`} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
            <stop offset="16%" stopColor="#ffffff" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>

          <mask id={`${uid}-centerReveal`}>
            <rect width="100" height="100" fill="black" />
            <rect width="100" height="100" fill={`url(#${uid}-midMask)`} />
          </mask>
        </defs>

        {/* Base blades — full bleed */}
        <g opacity={0.995}>
          {blades.map(({ key, x, step: w, flipped }) => (
            <rect
              key={key}
              x={x - 0.02}
              y={0}
              width={w + 0.04}
              height={100}
              fill={flipped ? `url(#${uid}-facetA)` : `url(#${uid}-facetB)`}
            />
          ))}
        </g>

        {/* Centre wash (single full-bleed tint — avoids duplicating blade geometry) */}
        <g mask={`url(#${uid}-centerReveal)`} opacity={1}>
          <rect x={0} y={0} width={100} height={100} fill={`url(#${uid}-tintMid)`} opacity={0.64} />
        </g>

        <rect width={100} height={100} fill={`url(#${uid}-topSheen)`} pointerEvents="none" />

        {/* Bottom fade for carousel footing */}
        <rect width={100} height={100} fill={`url(#${uid}-bottomVeil)`} />
      </svg>
    </div>
  );
}
