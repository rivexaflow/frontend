"use client";

import { animate, motion, useInView, type Variants } from "framer-motion";
import { Activity, CheckCircle2, Eye, Gauge, Server, Sparkles, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const BULLETS = [
  "Reduction in manual entry errors by up to 85%",
  "Increase in lead conversion rates by 2.4x",
  "Automated verification processes saving 20+ hours weekly",
  "Real-time governance and compliance reporting",
] as const;

const METRICS_DETAIL = [
  {
    label: "Faster KYC",
    sub: "Average cycle-time improvement",
    icon: Gauge,
    countTo: 42,
    suffix: "%" as string,
    decimals: 0,
  },
  {
    label: "Less manual work",
    sub: "Ops hours redirected to growth",
    icon: Activity,
    countTo: 55,
    suffix: "%",
    decimals: 0,
  },
  {
    label: "Team visibility",
    sub: "Shared metrics & workflows",
    icon: Eye,
    countTo: 2.4,
    suffix: "x",
    decimals: 1,
  },
  {
    label: "Platform uptime",
    sub: "Enterprise-grade reliability",
    icon: Server,
    countTo: 99.9,
    suffix: "%",
    decimals: 1,
  },
] as const;

function formatCount(value: number, decimals: number) {
  return decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
}

function AnimatedMetricFigure({
  countTo,
  suffix,
  decimals,
  className,
}: {
  countTo: number;
  suffix: string;
  decimals: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.6, margin: "-10% 0px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) {
      setDisplay(0);
      return;
    }
    let active = true;
    const ctrl = animate(0, countTo, {
      duration: 1.85,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (v) => {
        if (active) setDisplay(v);
      },
    });
    return () => {
      active = false;
      ctrl.stop();
    };
  }, [inView, countTo]);

  return (
    <span ref={ref} className={className}>
      {formatCount(display, decimals)}
      <span aria-hidden>{suffix}</span>
    </span>
  );
}

function FloatingMetricIcon({ icon: Icon, delay }: { icon: LucideIcon; delay: number }) {
  const floatDuration = 3.2 + delay * 0.4;
  const swayDuration = 5 + delay * 0.45;
  return (
    <motion.div
      className="relative z-[2]"
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: floatDuration, ease: "easeInOut" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -22 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ type: "spring", stiffness: 420, damping: 22, delay }}
      >
        <motion.div
          animate={{ rotate: [0, -5, 4, 0] }}
          transition={{ repeat: Infinity, duration: swayDuration, ease: "easeInOut", delay }}
        >
          <Icon className="h-6 w-6 text-[#2277FF] dark:text-[#93c5fd]" aria-hidden />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** Faux analytics tile: area chart + KPI bars — bento dashboards pattern */
function ImpactCommandCenterMock({ gid }: { gid: string }) {
  const barHeights = [0.38, 0.72, 0.55, 0.88, 0.66];
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none relative mt-10 w-full max-w-[296px] select-none sm:max-w-[320px] lg:mt-0 lg:flex-1"
      initial={{ opacity: 0, x: 36, skewY: 1 }}
      whileInView={{ opacity: 1, x: 0, skewY: 0 }}
      viewport={{ once: false, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      <div className="relative rounded-2xl border border-white/[0.17] bg-gradient-to-br from-white/[0.1] via-white/[0.04] to-transparent p-4 pb-5 shadow-[0_28px_60px_rgba(0,0,0,0.5)]">
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,119,255,0.22), transparent 45%, rgba(227,231,252,0.06))",
          }}
          animate={{ opacity: [0.5, 0.92, 0.5] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
        <div className="relative space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {["bg-[#2277FF]", "bg-[#93c5fd]/80", "bg-white/40"].map((c, i) => (
                <motion.span
                  key={i}
                  className={cn("h-2 w-2 rounded-full", c)}
                  animate={{ opacity: [0.45, 1, 0.45] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.25, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span className="rounded-md border border-white/20 bg-black/40 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#E3E7FC]/85">
              Live KPI
            </span>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/28 to-transparent" />
          <svg viewBox="0 0 260 90" className="h-[86px] w-full">
            <defs>
              <linearGradient id={`${gid}-dash-area`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2277FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#050818" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <motion.path
              fill={`url(#${gid}-dash-area)`}
              d="M0 72 L32 64 L72 74 L114 42 L152 54 L182 38 L226 50 L260 42 L260 90 L0 90 Z"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              fill="none"
              stroke="#bfdbfe"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M0 72 C28 62 54 74 74 71 C106 62 138 54 156 53 C178 53 206 53 226 50 C246 47 258 52 268 50"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 1.55, ease: [0.22, 0.61, 0.36, 1] }}
            />
            {[34, 72, 114, 154, 196].map((x, idx) => (
              <motion.line
                key={x}
                x1={x}
                x2={x}
                y1={26}
                y2={88}
                stroke="#E3E7FC"
                strokeOpacity={0.14}
                strokeWidth={1}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.08 + idx * 0.04 }}
              />
            ))}
          </svg>
          <div className="flex h-[52px] items-end gap-2">
            {barHeights.map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-[5px] bg-gradient-to-t from-[#191970]/95 to-[#2277FF]"
                initial={{ height: 6 }}
                whileInView={{ height: Math.max(12, Math.round(h * 52)) }}
                viewport={{ once: false }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                  delay: 0.12 + i * 0.07,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Dual spark + filled area — hero KYC graphic */
function HeroVelocityGraphic({ gid, sparkId }: { gid: string; sparkId: string }) {
  const HeroMetricIcon = METRICS_DETAIL[0]!.icon;
  return (
    <motion.div
      aria-hidden
      className="relative h-[154px] w-full min-w-0 shrink-0 sm:h-[174px] sm:w-[312px]"
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 3.9, ease: "easeInOut" }}
    >
      <motion.div
        className="relative flex h-full w-full gap-4"
        initial={{ opacity: 0, scale: 0.93 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <div className="flex w-[76px] flex-col justify-end gap-[5px] sm:w-[92px]">
          {[62, 48, 71, 40, 55, 92].map((pct, idx) => (
            <motion.div
              key={idx}
              className="rounded-sm bg-[#2277FF]/18 dark:bg-[#2277FF]/35"
              initial={{ width: "0%", opacity: 0 }}
              whileInView={{ width: `${pct}%`, opacity: 1 }}
              viewport={{ once: false }}
              transition={{
                duration: 0.65,
                delay: 0.08 + idx * 0.07,
                ease: [0.22, 0.61, 0.36, 1],
              }}
              style={{ height: 7 }}
            />
          ))}
        </div>
        <div className="relative min-w-0 flex-1 rounded-xl border border-[#E3E7FC]/80 bg-[#f8fbff]/60 p-3 dark:border-slate-700 dark:bg-slate-900/40">
          <svg viewBox="0 0 200 112" className="h-[104px] w-full" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2277FF" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#2277FF" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id={sparkId} x1="0" y1="0" x2="200" y2="0">
                <stop offset="0%" stopColor="#2277FF" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#2277FF" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#191970" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {[0, 44, 88, 132, 176].map((x, gi) => (
              <motion.line
                key={x}
                x1={x}
                x2={x}
                y1={14}
                y2={106}
                stroke="#2277FF"
                strokeOpacity={0.06}
                strokeDasharray="3 7"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: gi * 0.04 }}
              />
            ))}
            <motion.path
              d="M 0 78 Q 52 52 94 72 T 174 52 T 200 26 L 200 112 L 0 112 Z"
              fill={`url(#${gid}-fill)`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.55, delay: 0.06 }}
            />
            <motion.g animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2.8 }}>
              <motion.path
                d="M 0 78 Q 52 52 94 72 T 174 52 T 200 26"
                fill="none"
                stroke={`url(#${sparkId})`}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 1.35, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 }}
              />
              <motion.circle
                cx="198"
                cy="26"
                r="7"
                className="fill-[#2277FF]"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 1.05, type: "spring", stiffness: 440, damping: 17 }}
              />
            </motion.g>
          </svg>
          <motion.div
            className="absolute bottom-2 right-2 text-[#2277FF]/50"
            animate={{ rotate: [0, 9, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4.5 }}
          >
            <HeroMetricIcon className="h-10 w-10 sm:h-11 sm:w-11" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ManualWorkTrendGraphic({ gid }: { gid: string }) {
  const pts = [
    [0, 74],
    [28, 58],
    [56, 66],
    [84, 44],
    [112, 52],
    [140, 38],
    [172, 48],
    [210, 32],
  ] as const;
  const pathD =
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ") + " L 210 90 L 0 90 Z";
  const lineD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

  return (
    <motion.svg
      viewBox="0 0 210 94"
      className="relative z-[1] mt-auto h-[72px] w-full shrink-0 text-[#2277FF]"
      aria-hidden
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false }}
    >
      <defs>
        <linearGradient id={`${gid}-mt-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2277FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2277FF" stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.path
        d={pathD}
        fill={`url(#${gid}-mt-fill)`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
      />
      <motion.path
        d={lineD}
        fill="none"
        stroke="#2277FF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1.5, ease: [0.22, 0.61, 0.36, 1] }}
      />
      {[1, 3, 5, 7].map((idx, mi) => {
        const p = pts[idx];
        if (!p) return null;
        const [cx, cy] = p;
        return (
          <motion.circle
            key={idx}
            cx={cx}
            cy={cy}
            r={3}
            fill="#2277FF"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.85 + mi * 0.1, type: "spring", stiffness: 400, damping: 15 }}
          />
        );
      })}
    </motion.svg>
  );
}

function VisibilityConstellationGraphic({ gid }: { gid: string }) {
  const arcs = ["M 44 112 A 60 52 0 0 1 212 114", "M 36 132 A 80 72 0 0 1 224 138", "M 54 154 A 100 94 0 0 1 208 154"];
  const nodes = [
    { cx: 64, cy: 58 },
    { cx: 128, cy: 44 },
    { cx: 198, cy: 64 },
    { cx: 98, cy: 98 },
    { cx: 174, cy: 98 },
  ];

  return (
    <motion.svg viewBox="0 0 256 164" className="relative z-[1] mt-2 h-[100px] w-full sm:h-[118px]" aria-hidden>
      {arcs.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#2277FF"
          strokeOpacity={0.12 + i * 0.05}
          strokeWidth={i === 2 ? 1.75 : 1.25}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1.3 + i * 0.12, ease: [0.22, 0.61, 0.36, 1] }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={`${gid}-n-${i}`}
          cx={n.cx}
          cy={n.cy}
          r={i === 1 ? 6 : 4.5}
          fill={i === 1 ? "#2277FF" : "#93c5fd"}
          stroke="#191970"
          strokeOpacity={0.25}
          strokeWidth={1}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: false }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.4 + i * 0.1 }}
        />
      ))}
      <motion.line
        x1="64"
        y1="58"
        x2="128"
        y2="44"
        stroke="#2277FF"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.75, delay: 0.9 }}
      />
      <motion.line
        x1="128"
        y1="44"
        x2="198"
        y2="64"
        stroke="#2277FF"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.65, delay: 1.05 }}
      />
    </motion.svg>
  );
}

function UptimeRingGraphic({ gid, progress = 0.999 }: { gid: string; progress?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.55 });
  const r = 36;
  const c = 2 * Math.PI * r;
  const targetOffset = c * (1 - progress);
  const ringGrad = `${gid}-up-ring`;

  return (
    <div ref={ref} className="relative z-[1] mx-auto mt-4 flex h-[120px] w-full max-w-[130px] items-center justify-center sm:mt-0 sm:h-auto sm:flex-1">
      <motion.div
        className="relative h-[118px] w-[118px]"
        animate={{ rotate: [0, 2.5, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#E3E7FC" strokeOpacity={0.45} strokeWidth="8" />
          <defs>
            <linearGradient id={ringGrad} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2277FF" />
              <stop offset="100%" stopColor="#191970" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={`url(#${ringGrad})`}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: inView ? targetOffset : c }}
            transition={{ duration: 2.1, ease: [0.22, 0.61, 0.36, 1] }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-full pt-2 text-center">
          <motion.span className="text-[10px] font-bold uppercase tracking-widest text-[#2277FF]/85 dark:text-[#93c5fd]">
            SLO
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}

function OutcomesFlowRibbon() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute bottom-20 left-[4%] right-[4%] z-0 hidden h-16 lg:block"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.42 }}
      viewport={{ once: false }}
      transition={{ duration: 0.6 }}
    >
      <svg viewBox="0 0 1200 72" preserveAspectRatio="none" className="h-full w-full">
        <motion.path
          d="M0 54 C320 28 560 76 896 42 C976 34 1092 62 1196 54"
          fill="none"
          stroke="#2277FF"
          strokeOpacity={0.5}
          strokeWidth={2}
          strokeDasharray="10 14"
          initial={{ strokeDashoffset: 240 }}
          animate={{ strokeDashoffset: [240, 0] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        />
      </svg>
    </motion.div>
  );
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
      when: "beforeChildren",
    },
  },
};

const cell: Variants = {
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 26,
      mass: 0.92,
    },
  },
};

const spotlightLine: Variants = {
  hidden: { opacity: 0, y: 26, skewX: -3 },
  show: {
    opacity: 1,
    y: 0,
    skewX: 0,
    transition: { type: "spring", stiffness: 340, damping: 28 },
  },
};

type BentoCellProps = {
  className?: string;
  children: React.ReactNode;
  spotlight?: boolean;
};

function BentoCell({ className, children, spotlight }: BentoCellProps) {
  return (
    <motion.div
      variants={cell}
      whileHover={{
        y: -5,
        transition: { type: "spring", stiffness: 460, damping: 26 },
      }}
      whileTap={{ scale: 0.996 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.35rem] border p-6 sm:p-7",
        "border-[#E3E7FC]/90 bg-white shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_12px_40px_rgba(34,119,255,0.09)]",
        "dark:border-slate-800 dark:bg-slate-900 dark:shadow-none",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
        "before:bg-gradient-to-br before:from-[#2277FF]/[0.08] before:via-transparent before:to-[#191970]/[0.06]",
        "before:opacity-0 before:transition-opacity before:duration-500 group-hover:before:opacity-100",
        spotlight &&
          "border-[#2277FF]/35 bg-[#050818] text-white shadow-[0_28px_70px_rgba(25,25,112,0.42)] dark:border-[#2277FF]/35",
        className,
      )}
    >
      {spotlight ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-[-40%] opacity-[0.12]"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(34,119,255,0.9) 60deg, transparent 140deg, rgba(227,231,252,0.5) 220deg, transparent 280deg)",
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
        />
      ) : null}
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl transition-opacity duration-500",
          spotlight
            ? "bg-[#2277FF]/35 opacity-80 group-hover:opacity-100"
            : "bg-[#2277FF]/22 opacity-0 group-hover:opacity-100",
        )}
        animate={
          spotlight
            ? { scale: [1, 1.12, 1], opacity: [0.55, 0.88, 0.55] }
            : { scale: [1, 1.08, 1], opacity: [0.4, 0.75, 0.4] }
        }
        transition={{ repeat: Infinity, duration: spotlight ? 3.8 : 4.8, ease: "easeInOut" }}
      />
      {children}
    </motion.div>
  );
}

export function BusinessImpactBento() {
  const uid = useId().replace(/:/g, "");
  const sparkId = `${uid}-hero-spark`;
  const gid = `${uid}-g`;
  const first = METRICS_DETAIL[0]!;

  return (
    <section
      id="impact"
      className="relative overflow-hidden bg-gradient-to-b from-[#f8fbff] via-white to-white py-14 sm:py-20 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_12%_-10%,rgba(34,119,255,0.08),transparent_55%),radial-gradient(700px_380px_at_102%_40%,rgba(25,25,112,0.06),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-6">
        <motion.div
          className="grid auto-rows-min gap-4 sm:gap-5 lg:grid-cols-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.1, margin: "0px 0px -5% 0px" }}
        >
          <BentoCell
            spotlight
            className="lg:col-span-5 lg:row-span-2 lg:min-h-[320px] xl:min-h-[340px]"
          >
            <div className="relative z-[1] flex h-full flex-col gap-8 lg:flex-row lg:gap-10 lg:items-stretch lg:justify-between">
              <motion.div
                className="flex min-w-0 flex-1 flex-col gap-5"
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.35 }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.11, delayChildren: 0.06 } },
                }}
              >
                <motion.div variants={spotlightLine}>
                  <motion.div
                    className="inline-flex items-center gap-2 self-start rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E3E7FC] backdrop-blur-sm"
                    whileHover={{ scale: 1.03, borderColor: "rgba(147,197,253,0.55)" }}
                  >
                    <motion.span
                      animate={{ rotate: [0, 12, -8, 0], scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 3.2 }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#93c5fd]" aria-hidden />
                    </motion.span>
                    Business Impact
                  </motion.div>
                </motion.div>
                <motion.h2
                  variants={spotlightLine}
                  className="font-heading text-[clamp(1.75rem,3.8vw,2.75rem)] font-black uppercase leading-[1.05] tracking-tight text-white"
                >
                  Measurable growth for modern organizations
                </motion.h2>
                <motion.p
                  variants={spotlightLine}
                  className="max-w-xl text-[15px] leading-relaxed text-white/74 sm:text-base"
                >
                  Our partners see immediate improvements in operational efficiency and team productivity upon
                  implementation.
                </motion.p>
                <motion.div variants={spotlightLine} className="mt-1 flex gap-2" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1 rounded-full bg-gradient-to-r from-[#2277FF] to-[#E3E7FC]"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ delay: 0.62 + i * 0.12, duration: 0.52, ease: [0.22, 0.61, 0.36, 1] }}
                      style={{ originX: 0, width: i === 2 ? "3.75rem" : "2.4rem" }}
                    />
                  ))}
                </motion.div>
              </motion.div>

              <ImpactCommandCenterMock gid={`${gid}-cmd`} />
            </div>
          </BentoCell>

          <BentoCell className="overflow-visible lg:col-span-7 lg:flex-col lg:gap-10 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative z-[2] shrink-0">
              <motion.p
                className="font-subheading text-[11px] font-bold uppercase tracking-[0.22em] text-[#2277FF] dark:text-[#93c5fd]"
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                {first.label}
              </motion.p>
              <p className="mt-3 font-heading text-[clamp(3rem,10vw,4.75rem)] font-black leading-none tracking-tight text-[#191970] tabular-nums dark:text-white">
                <AnimatedMetricFigure countTo={first.countTo} suffix={first.suffix} decimals={first.decimals} />
              </p>
              <motion.p
                className="mt-2 max-w-[16rem] text-sm leading-snug text-[#191970]/68 dark:text-slate-400"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3, duration: 0.45 }}
              >
                {first.sub}
              </motion.p>
            </div>

            <HeroVelocityGraphic gid={`${gid}-hv`} sparkId={sparkId} />
          </BentoCell>

          {METRICS_DETAIL.slice(1).map((m, index) => (
            <BentoCell
              key={m.label}
              className={cn(
                "min-h-[200px] sm:min-h-[210px]",
                index === 2 ? "lg:col-span-3" : "lg:col-span-2",
              )}
            >
              <div className="relative z-[2] flex items-start justify-between gap-4">
                <FloatingMetricIcon icon={m.icon} delay={index * 0.12} />
                {index === 0 ? (
                  <div className="hidden w-[112px] shrink-0 sm:block">
                    <ManualWorkTrendGraphic gid={`${gid}-mw`} />
                  </div>
                ) : null}
                {index === 1 ? (
                  <div className="-mr-4 min-w-[58%] max-w-[148px] sm:max-w-[168px]">
                    <VisibilityConstellationGraphic gid={`${gid}-vis`} />
                  </div>
                ) : null}
                {index === 2 ? <UptimeRingGraphic gid={`${gid}-upt`} /> : null}
              </div>

              <div className="relative z-[2] mt-auto pt-6">
                <p className="font-heading text-[clamp(2rem,5vw,2.75rem)] font-black leading-none tabular-nums text-[#191970] dark:text-white">
                  <AnimatedMetricFigure countTo={m.countTo} suffix={m.suffix} decimals={m.decimals} />
                </p>
                <motion.p
                  className="mt-2 text-xs font-bold uppercase tracking-wider text-[#2277FF]/85 dark:text-[#93c5fd]"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.15 + index * 0.07, type: "spring", damping: 24 }}
                >
                  {m.label}
                </motion.p>
                <motion.p
                  className="mt-1 text-[13px] leading-snug text-[#191970]/65 dark:text-slate-400"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.26 + index * 0.08 }}
                >
                  {m.sub}
                </motion.p>
              </div>

              {/* Mobile fallback mini graphic under text when layout tight */}
              {index === 0 ? (
                <div className="relative z-[1] mt-3 sm:hidden">
                  <ManualWorkTrendGraphic gid={`${gid}-mw-m`} />
                </div>
              ) : null}
              {index === 1 ? (
                <div className="relative z-[1] mt-2 overflow-hidden rounded-xl border border-[#E3E7FC]/70 bg-[#f8fbff]/50 px-2 py-1 sm:hidden dark:border-slate-700">
                  <VisibilityConstellationGraphic gid={`${gid}-vis-m`} />
                </div>
              ) : null}
              {index === 2 ? (
                <div className="mt-4 flex justify-center sm:hidden">
                  <UptimeRingGraphic gid={`${gid}-upt-m`} />
                </div>
              ) : null}
            </BentoCell>
          ))}

          <BentoCell className="relative overflow-visible lg:col-span-12">
            <OutcomesFlowRibbon />
            <motion.div
              className="relative z-[2] flex flex-wrap items-center gap-2 pb-5"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
            >
              <p className="font-subheading text-[11px] font-bold uppercase tracking-[0.2em] text-[#2277FF] dark:text-[#93c5fd]">
                Operational outcomes
              </p>
            </motion.div>
            <motion.ul
              className="relative z-[2] grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.12 }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
              }}
            >
              {BULLETS.map((text, bi) => (
                <motion.li
                  key={text}
                  variants={{
                    hidden: { opacity: 0, y: 20, rotateX: -10 },
                    show: {
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      transition: {
                        type: "spring",
                        stiffness: 340,
                        damping: 26,
                        staggerChildren: 0.07,
                      },
                    },
                  }}
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow:
                      "0 18px 42px rgba(34,119,255,0.15), inset 0 1px 0 rgba(255,255,255,1)",
                  }}
                  className={cn(
                    "relative flex items-start gap-3 overflow-hidden rounded-2xl border border-[#E3E7FC]/90 bg-[#f8fbff]/92 p-4",
                    "dark:border-slate-800 dark:bg-slate-800/55",
                  )}
                  style={{
                    perspective: "800px",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* mini spark footer per outcome tile */}
                  <svg viewBox={`0 0 120 ${24 + bi * 8}`} className="pointer-events-none absolute bottom-2 right-2 h-[22px] w-16 opacity-40" aria-hidden>
                    <motion.path
                      d={`M0 ${18 + bi * 4} Q 30 ${6 + bi * 2} 60 ${14 + bi} T 118 ${12 + bi * 3}`}
                      fill="none"
                      stroke="#2277FF"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: false }}
                      transition={{ duration: 1.05, delay: 0.06 * bi }}
                    />
                  </svg>

                  <motion.span
                    variants={{
                      hidden: { opacity: 0, scale: 0.7, rotate: -28 },
                      show: {
                        opacity: 1,
                        scale: 1,
                        rotate: 0,
                        transition: { type: "spring", stiffness: 460, damping: 19 },
                      },
                    }}
                    className="mt-0.5 inline-flex shrink-0 text-[#2277FF]"
                  >
                    <CheckCircle2 className="relative z-[1] block h-5 w-5" aria-hidden />
                  </motion.span>
                  <motion.span
                    variants={{
                      hidden: { opacity: 0, x: 10 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: { type: "spring", stiffness: 320, damping: 28 },
                      },
                    }}
                    className="relative z-[1] text-sm font-medium leading-relaxed text-[#191970] dark:text-slate-200"
                  >
                    {text}
                  </motion.span>
                </motion.li>
              ))}
            </motion.ul>
          </BentoCell>
        </motion.div>
      </div>
    </section>
  );
}
