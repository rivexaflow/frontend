"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import {
  HRM_DASHBOARD_COLORS,
  type HrmOpenPosition,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { cn } from "@/lib/utils/cn";

const SIZE = 148;
const STROKE = 24;

type Props = {
  positions: HrmOpenPosition[];
  onOpenPosition: (id: string) => void;
};

export function HrmDashboardOpenPositionsSummary({ positions, onOpenPosition }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const total = useMemo(() => positions.reduce((s, p) => s + p.value, 0), [positions]);

  const segments = useMemo(() => {
    let offset = 0;
    return positions.map((p) => {
      const pct = total > 0 ? (p.value / total) * 100 : 0;
      const seg = { ...p, pct, offset };
      offset += pct;
      return seg;
    });
  }, [positions, total]);

  const radius = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const arcs = segments.map((s) => {
    const dash = (s.pct / 100) * circumference;
    const arc = { ...s, dash, gap: circumference - dash, offset: cumulative };
    cumulative += dash;
    return arc;
  });

  return (
    <section className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#191970] via-[#2277ff] to-[#0ea5e9]" />

      <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-slate-100/80 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white">Open position</h3>
          <p className="mt-0.5 text-xs text-slate-500">Click a role to open full details</p>
        </div>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Filters
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
        <div className="flex shrink-0 flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg width={SIZE} height={SIZE} className="-rotate-90" role="img" aria-label="Open positions by role">
              <circle cx={SIZE / 2} cy={SIZE / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
              {arcs.map((s) => (
                <circle
                  key={s.id}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={radius}
                  fill="none"
                  stroke={s.color ?? HRM_DASHBOARD_COLORS.midnight}
                  strokeWidth={STROKE}
                  strokeDasharray={`${s.dash} ${s.gap}`}
                  strokeDashoffset={-s.offset}
                  strokeLinecap="round"
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:opacity-100",
                    hoveredId === s.id ? "opacity-100" : "opacity-85",
                  )}
                  style={{ filter: hoveredId === s.id ? `drop-shadow(0 0 6px ${s.color}55)` : undefined }}
                  onMouseEnter={() => setHoveredId(s.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => onOpenPosition(s.id)}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{total}</span>
              <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">Open roles</span>
            </div>

            {hoveredId ? (
              <div
                className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-lg"
                role="tooltip"
              >
                {positions.find((p) => p.id === hoveredId)?.label} · click to open
              </div>
            ) : null}
          </div>

          <p className="text-center text-xs leading-relaxed text-slate-500 sm:text-left">
            {positions.length} active hiring tracks across Sales, Engineering, and Operations.
          </p>
        </div>

        <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
          {segments.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onOpenPosition(s.id)}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition",
                  hoveredId === s.id
                    ? "border-[#2277ff]/40 bg-[#2277ff]/[0.06]"
                    : "border-slate-100/80 bg-slate-50/50 hover:border-[#2277ff]/25 dark:border-slate-800 dark:bg-slate-950/40",
                )}
              >
                <span className="flex min-w-0 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white dark:ring-slate-900"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate">{s.label}</span>
                  <span className="hidden text-[10px] text-slate-400 sm:inline">· {s.department}</span>
                </span>
                <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                  {s.value}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
