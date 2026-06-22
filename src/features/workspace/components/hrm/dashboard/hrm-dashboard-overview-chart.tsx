"use client";

import { ChevronDown, TrendingDown, TrendingUp } from "lucide-react";

import {
  HRM_DASHBOARD_COLORS,
  HRM_OVERVIEW_BARS,
  HRM_OVERVIEW_DELTA,
  HRM_OVERVIEW_LINE,
  HRM_OVERVIEW_MONTHS,
  type HrmOverviewMonth,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { cn } from "@/lib/utils/cn";

function formatValue(n: number): string {
  if (n >= 1_000) return n.toLocaleString();
  return String(n);
}

type Props = {
  selectedMonth: HrmOverviewMonth;
  onSelectMonth: (month: HrmOverviewMonth) => void;
  className?: string;
};

export function HrmDashboardOverviewChart({ selectedMonth, onSelectMonth, className }: Props) {
  const months = [...HRM_OVERVIEW_MONTHS];
  const barMax = Math.max(...months.map((m) => HRM_OVERVIEW_BARS[m]), 1);
  const lineMax = Math.max(...months.map((m) => HRM_OVERVIEW_LINE[m]), 1);
  const chartH = 168;
  const total = HRM_OVERVIEW_BARS[selectedMonth];
  const delta = HRM_OVERVIEW_DELTA[selectedMonth];

  const linePoints = months.map((m, i) => {
    const x = (i / (months.length - 1)) * 100;
    const y = 100 - (HRM_OVERVIEW_LINE[m] / lineMax) * 100;
    return { m, x, y };
  });
  const linePath = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100/80 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">Overviews</h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {formatValue(total)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                delta.up ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {delta.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {delta.up ? "+" : "-"}
              {Math.abs(delta.pct)}% vs prior month
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {selectedMonth} · Bar: applicants · Line: interviews
          </p>
        </div>
        <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
          Filters
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </div>

      <div className="relative p-5">
        <div className="relative" style={{ height: chartH }}>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-t border-dashed border-slate-100 dark:border-slate-800/80" />
            ))}
          </div>

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            aria-hidden
          >
            <path
              d={linePath}
              fill="none"
              stroke={HRM_DASHBOARD_COLORS.sky}
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
            {linePoints.map((p) => (
              <circle
                key={p.m}
                cx={p.x}
                cy={p.y}
                r="2.5"
                fill="white"
                stroke={HRM_DASHBOARD_COLORS.sky}
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          <div className="relative flex h-full items-end gap-2 sm:gap-3">
            {months.map((m) => {
              const barVal = HRM_OVERVIEW_BARS[m];
              const lineVal = HRM_OVERVIEW_LINE[m];
              const h = Math.max((barVal / barMax) * 100, barVal > 0 ? 6 : 0);
              const isSelected = m === selectedMonth;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onSelectMonth(m)}
                  className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2277ff]/40"
                  aria-pressed={isSelected}
                  title={`${m}: ${formatValue(barVal)} applicants · ${formatValue(lineVal)} interviews`}
                >
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[9px] font-semibold tabular-nums transition",
                      isSelected ? "bg-[#2277ff] text-white" : "bg-slate-100 text-slate-600 opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {formatValue(barVal)}
                  </span>
                  <div
                    className={cn(
                      "relative w-full max-w-[48px] overflow-hidden rounded-t-xl transition-all duration-300",
                      isSelected && "shadow-[0_4px_16px_rgba(34,119,255,0.3)]",
                    )}
                    style={{ height: `${h}%`, minHeight: barVal > 0 ? 8 : 0 }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isSelected
                          ? `linear-gradient(180deg, ${HRM_DASHBOARD_COLORS.blue} 0%, ${HRM_DASHBOARD_COLORS.midnight} 100%)`
                          : `linear-gradient(180deg, ${HRM_DASHBOARD_COLORS.blue}88 0%, ${HRM_DASHBOARD_COLORS.midnight}bb 100%)`,
                      }}
                    />
                    <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium sm:text-xs",
                      isSelected ? "font-bold text-[#2277ff]" : "text-slate-500",
                    )}
                  >
                    {m}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
