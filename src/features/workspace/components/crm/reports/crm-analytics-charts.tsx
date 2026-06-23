"use client";

import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import type { CrmChartPoint } from "@/features/workspace/data/crm-reports-demo";
import { cn } from "@/lib/utils/cn";

const NAVY = "#191970";
const NAVY_LIGHT = "#3b3b9e";

function formatAxisValue(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

type ChartCardProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
};

export function CrmChartCard({ title, subtitle, action, children, className, accent }: ChartCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_24px_rgba(25,25,112,0.06)] dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      {accent ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#191970] via-indigo-600 to-sky-500" />
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100/80 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="relative p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(25,25,112,0.04),transparent_50%)]" />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

export function CrmDonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: CrmChartPoint[];
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  const segments = useMemo(() => {
    let offset = 0;
    return data.map((d) => {
      const pct = total > 0 ? (d.value / total) * 100 : 0;
      const seg = { ...d, pct, offset };
      offset += pct;
      return seg;
    });
  }, [data, total]);

  const size = 176;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const arcs = segments.map((s) => {
    const dash = (s.pct / 100) * circumference;
    const arc = { ...s, dash, gap: circumference - dash, offset: cumulative };
    cumulative += dash;
    return arc;
  });

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={stroke}
            className="dark:stroke-slate-800"
          />
          {arcs.map((s) => (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color ?? NAVY}
              strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue ? (
            <span className="text-2xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {centerValue}
            </span>
          ) : null}
          {centerLabel ? (
            <span className="mt-0.5 max-w-[90px] text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {centerLabel}
            </span>
          ) : null}
        </div>
      </div>
      <ul className="grid w-full max-w-xs flex-1 gap-2.5 sm:max-w-sm">
        {segments.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100/80 bg-slate-50/50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/40"
          >
            <span className="flex min-w-0 items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-slate-900"
                style={{ backgroundColor: s.color ?? NAVY }}
              />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {s.pct.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CrmVerticalBarChart({
  data,
  yLabel,
  xLabel,
  formatValue = formatAxisValue,
  maxBars = 12,
  variant = "default",
}: {
  data: CrmChartPoint[];
  yLabel?: string;
  xLabel?: string;
  formatValue?: (n: number) => string;
  maxBars?: number;
  variant?: "default" | "compact";
}) {
  const visible = data.slice(0, maxBars);
  const max = Math.max(...visible.map((d) => d.value), 1);
  const chartHeight = variant === "compact" ? 180 : 220;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));

  return (
    <div>
      {yLabel ? (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{yLabel}</p>
      ) : null}
      <div className="flex gap-4">
        <div
          className="flex flex-col justify-between py-1 text-[10px] font-medium tabular-nums text-slate-400"
          style={{ height: chartHeight }}
        >
          {[...ticks].reverse().map((t) => (
            <span key={t}>{formatValue(t)}</span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" style={{ height: chartHeight }}>
            {ticks.map((t) => (
              <div key={t} className="border-t border-dashed border-slate-100 dark:border-slate-800/80" />
            ))}
          </div>
          <div className="relative flex items-end gap-1.5 sm:gap-2" style={{ height: chartHeight }}>
            {visible.map((d, i) => {
              const h = Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0);
              return (
                <div key={d.label} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="rounded-md bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-white opacity-0 shadow-sm transition group-hover:opacity-100">
                    {formatValue(d.value)}
                  </span>
                  <div
                    className="relative w-full max-w-[52px] overflow-hidden rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                    style={{ height: `${h}%`, minHeight: d.value > 0 ? 6 : 0 }}
                    title={`${d.label}: ${formatValue(d.value)}`}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(180deg, ${d.color ?? NAVY_LIGHT} 0%, ${d.color ?? NAVY} 100%)`,
                      }}
                    />
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/25 to-transparent" />
                  </div>
                </div>
              );
            })}
          </div>
          {xLabel ? (
            <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{xLabel}</p>
          ) : null}
          <div className="mt-2 flex gap-1.5 sm:gap-2">
            {visible.map((d) => (
              <div key={d.label} className="min-w-0 flex-1 text-center">
                <span
                  className="block truncate text-[9px] font-medium text-slate-500 sm:text-[10px]"
                  title={d.label}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrmTrendChart({
  data,
  formatValue = formatAxisValue,
}: {
  data: CrmChartPoint[];
  formatValue?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 800;
  const height = 200;
  const padX = 24;
  const padY = 20;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = padY + innerH - (d.value / max) * innerH;
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? padX} ${padY + innerH} L ${points[0]?.x ?? padX} ${padY + innerH} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height + 32}`} className="min-w-[640px] w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={NAVY} stopOpacity="0.22" />
            <stop offset="100%" stopColor={NAVY} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((t) => {
          const y = padY + innerH * (1 - t);
          return (
            <line
              key={t}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
              className="dark:stroke-slate-800"
            />
          );
        })}
        <path d={areaPath} fill="url(#trendFill)" />
        <path d={linePath} fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={NAVY} strokeWidth="2" className="dark:fill-slate-900" />
            <text x={p.x} y={height + 18} textAnchor="middle" className="fill-slate-500 text-[11px] font-medium">
              {p.label.replace(" 2026", "")}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
        {data.map((d) => (
          <span key={d.label}>
            <strong className="text-slate-800 dark:text-slate-200">{formatValue(d.value)}</strong> · {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CrmHorizontalBarChart({
  data,
  formatValue = formatAxisValue,
  showRank = false,
}: {
  data: CrmChartPoint[];
  formatValue?: (n: number) => string;
  showRank?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="space-y-3.5">
      {data.map((d, i) => (
        <li key={d.label} className="group">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              {showRank ? (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500 dark:bg-slate-800">
                  {i + 1}
                </span>
              ) : null}
              <span className="truncate">{d.label}</span>
            </span>
            <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900 dark:text-white">
              {formatValue(d.value)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="relative h-full rounded-full transition-all duration-500 group-hover:brightness-110"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${d.color ?? NAVY} 0%, ${d.color ?? NAVY_LIGHT} 100%)`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CrmKpiStrip({
  items,
}: {
  items: { label: string; value: string; delta?: string; deltaUp?: boolean }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi, i) => (
        <div
          key={kpi.label}
          className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.07]"
            style={{ background: `radial-gradient(circle, ${NAVY} 0%, transparent 70%)` }}
          />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tabular-nums tracking-tight text-slate-900 dark:text-white">
            {kpi.value}
          </p>
          {kpi.delta ? (
            <p
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                kpi.deltaUp === true && "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
                kpi.deltaUp === false && "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
                kpi.deltaUp === undefined && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
              )}
            >
              {kpi.deltaUp === true ? <TrendingUp className="h-3 w-3" /> : null}
              {kpi.deltaUp === false ? <TrendingDown className="h-3 w-3" /> : null}
              {kpi.delta}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function CrmReportTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="border-b border-slate-200/80 dark:border-slate-800">
      <div className="flex gap-0 overflow-x-auto px-1">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "relative shrink-0 px-4 py-3.5 text-sm font-semibold transition",
                selected
                  ? "text-[#191970] dark:text-indigo-300"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200",
              )}
            >
              {tab.label}
              {selected ? (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#191970] dark:bg-indigo-400" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CrmDateRangeBar({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onGenerate,
}: {
  fromDate: string;
  toDate: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm dark:border-slate-800 dark:from-slate-950/50 dark:to-slate-900 sm:flex-row sm:items-end">
      <div className="grid flex-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">From date</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromChange(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-[#191970] focus:outline-none focus:ring-2 focus:ring-[#191970]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">To date</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToChange(e.target.value)}
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-800 shadow-sm focus:border-[#191970] focus:outline-none focus:ring-2 focus:ring-[#191970]/15 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onGenerate}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#191970] px-6 text-sm font-semibold text-white shadow-md shadow-[#191970]/20 transition hover:bg-[#12124a]"
      >
        Generate report
      </button>
    </div>
  );
}
