"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import {
  PERFORMANCE_BAND_LABEL,
  PERFORMANCE_STAGES,
  type PerformanceBand,
  type PerformanceStage,
} from "@/features/workspace/data/hrm-performance-demo";
import { cn } from "@/lib/utils/cn";

const BAND_STYLE: Record<PerformanceBand, { ring: string; text: string; bar: string; label: string }> = {
  good: { ring: "#10b981", text: "text-emerald-600", bar: "bg-emerald-500", label: "text-emerald-600" },
  medium: { ring: "#f59e0b", text: "text-amber-600", bar: "bg-amber-500", label: "text-amber-600" },
  low: { ring: "#ef4444", text: "text-rose-600", bar: "bg-rose-500", label: "text-rose-600" },
};

export function PerformanceSparkline({
  values,
  className,
  height = 36,
}: {
  values: number[];
  className?: string;
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 88;
  const pad = 4;
  const innerH = height - pad * 2;
  const points = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = pad + innerH - ((v - min) / range) * innerH;
    return `${x},${y}`;
  });
  const path = points.length ? `M ${points.join(" L ")}` : "";

  return (
    <svg width={width} height={height} className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id="perf-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2277ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2277ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {path ? (
        <>
          <path d={`${path} L ${width - pad},${height - pad} L ${pad},${height - pad} Z`} fill="url(#perf-spark)" />
          <path d={path} fill="none" stroke="#2277ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
    </svg>
  );
}

export function PerformanceScoreRing({
  score,
  band,
  size = 52,
}: {
  score: number;
  band: PerformanceBand;
  size?: number;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 100) * circumference;
  const color = BAND_STYLE[band].ring;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-slate-900">
        {score}
      </span>
    </div>
  );
}

export function PerformanceStageBar({
  stage,
  progress,
  band,
}: {
  stage: PerformanceStage;
  progress: number;
  band: PerformanceBand;
}) {
  const label = PERFORMANCE_STAGES.find((s) => s.id === stage)?.label ?? stage;
  const filled = Math.min(5, Math.max(0, progress));

  return (
    <div className="min-w-[100px]">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stage</p>
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <div className="mt-2 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-sm",
              i < filled ? BAND_STYLE[band].bar : "bg-slate-200",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function PerformanceBandBadge({ band }: { band: PerformanceBand }) {
  return (
    <span className={cn("text-xs font-bold", BAND_STYLE[band].label)}>
      {PERFORMANCE_BAND_LABEL[band]}
    </span>
  );
}

export function PerformanceTrendLabel({
  pct,
  up,
  sparkline,
}: {
  pct: number;
  up: boolean;
  sparkline?: number[];
}) {
  const values = sparkline?.length ? sparkline : [40, 45, 42, 50, 48, 55, up ? 60 : 38];
  return (
    <div className="flex flex-col items-start gap-0.5">
      <PerformanceSparkline values={values} height={32} />
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[11px] font-semibold",
          up ? "text-emerald-600" : "text-rose-600",
        )}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        Trends {pct}%
      </span>
    </div>
  );
}

export function PerformanceAvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  const visible = names.slice(0, max);
  return (
    <div>
      <div className="flex -space-x-2">
        {visible.map((name, i) => (
          <span
            key={`${name}-${i}`}
            title={name}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#191970] text-[9px] font-bold text-white shadow-sm"
          >
            {name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
        ))}
        {names.length > max ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-bold text-slate-600">
            +{names.length - max}
          </span>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] font-medium text-slate-500">
        {names.length} {names.length === 1 ? "Person" : "People"}
      </p>
    </div>
  );
}
