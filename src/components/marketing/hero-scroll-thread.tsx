"use client";

import { type MotionValue, motion, useReducedMotion, useTransform } from "framer-motion";
import { useId } from "react";

/**
 * Long curve from upper-left toward bottom-right — reads as bridging the hero tail toward About when
 * the SVG stretches with `preserveAspectRatio="none"`.
 */
const THREAD_PATH =
  "M28 72 C298 688 582 916 892 582 C1098 348 1268 512 1576 1128";

const VB = "0 0 1600 1200";

/** Soft luminous wash under carousel so the ribbon reads as emerging from that plane. */
export function HeroThreadUnderlay({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const glow = useTransform(scrollYProgress, [0, 0.55, 1], [0.38, 0.62, 0.82]);
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-[-8%] bottom-0 z-[7] mx-auto max-w-none h-[min(36vh,400px)] bg-[radial-gradient(ellipse_92%_100%_at_50%_100%,rgba(34,119,255,0.34)_0%,rgba(25,25,112,0.22)_46%,transparent_72%)]"
      style={{ opacity: glow }}
      aria-hidden
    />
  );
}

export function HeroThreadGap({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const uid = useId().replace(/:/g, "");
  const reduceMotion = useReducedMotion();

  /** Slower, longer draw — stays in sync with scroll without popping in too early. */
  const reveal = useTransform(scrollYProgress, (t) => {
    if (reduceMotion) return 1;
    if (t <= 0) return 0.04;
    if (t >= 0.72) return 1;
    return 0.04 + ((t / 0.72) * 0.96);
  });

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex flex-col bg-white"
      style={{
        /* Below first viewport so hero carousel isn’t covered (old top: calc(100dvh − …) overlapped hero). */
        top: "100dvh",
      }}
      aria-hidden
    >
      {/* Fills upper-left void beside the navbar line — purely gradient, stays cheap */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 top-0 z-0 w-[min(42%,min(340px,50vw))]"
        style={{
          background:
            "linear-gradient(180deg, rgba(34,119,255,0.38) 0%, rgba(25,25,112,0.2) 48%, transparent 92%)",
        }}
      />
      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-[min(100%,96rem)] flex-1 flex-col px-3 pt-4 sm:px-5 sm:pt-6">
        <svg
          className="block min-h-0 w-full flex-1 overflow-visible pb-3 sm:pb-5"
          viewBox={VB}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Matches CTA: brand blue (#2277FF) blending into midnight blue (#191970) */}
            <linearGradient id={`${uid}-glowA`} x1="18%" y1="0%" x2="82%" y2="100%">
              <stop offset="0%" stopColor="#2277FF" stopOpacity={0.5} />
              <stop offset="46%" stopColor="#3949b8" stopOpacity={0.44} />
              <stop offset="100%" stopColor="#191970" stopOpacity={0.42} />
            </linearGradient>
            <linearGradient id={`${uid}-mist`} x1="32%" y1="12%" x2="68%" y2="92%">
              <stop offset="0%" stopColor="#2f7cff" stopOpacity={0.72} />
              <stop offset="42%" stopColor="#4848aa" stopOpacity={0.68} />
              <stop offset="72%" stopColor="#2a3588" stopOpacity={0.64} />
              <stop offset="100%" stopColor="#171c5c" stopOpacity={0.62} />
            </linearGradient>
            <linearGradient id={`${uid}-shine`} x1="26%" y1="8%" x2="54%" y2="72%">
              <stop offset="0%" stopColor="#E3E7FC" stopOpacity={0.55} />
              <stop offset="35%" stopColor="#cfe0ff" stopOpacity={0.32} />
              <stop offset="100%" stopColor="#2277FF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <motion.g style={{ transform: "translateZ(0)" }}>
            {/* No SVG filters — feGaussianBlur + scroll was the main jank; layered strokes only */}
            <motion.path
              d={THREAD_PATH}
              fill="none"
              stroke={`url(#${uid}-glowA)`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={52}
              style={{ pathLength: reveal }}
            />
            <motion.path
              d={THREAD_PATH}
              fill="none"
              stroke={`url(#${uid}-mist)`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={28}
              style={{ pathLength: reveal }}
            />
            <motion.path
              d={THREAD_PATH}
              fill="none"
              stroke={`url(#${uid}-shine)`}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={11}
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: reveal }}
            />
          </motion.g>
        </svg>
      </div>
    </div>
  );
}
