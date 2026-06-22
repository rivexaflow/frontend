"use client";

import { ArrowDown, ArrowUp, Crown, TrendingDown } from "lucide-react";

import type { PerformanceEmployee } from "@/features/workspace/data/hrm-performance-demo";
import { initials } from "@/features/workspace/data/hrm-performance-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  scopeLabel: string;
  top: PerformanceEmployee | null;
  bottom: PerformanceEmployee | null;
};

function PerformerChip({
  employee,
  variant,
}: {
  employee: PerformanceEmployee;
  variant: "top" | "bottom";
}) {
  const isTop = variant === "top";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-2.5",
        isTop
          ? "border-emerald-200/80 bg-emerald-50/60"
          : "border-rose-200/80 bg-rose-50/60",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
          isTop ? "bg-emerald-600" : "bg-rose-500",
        )}
      >
        {initials(employee.name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {isTop ? (
            <Crown className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          )}
          <p className="truncate text-sm font-bold text-slate-900">{employee.name}</p>
        </div>
        <p className="truncate text-[11px] text-slate-500">{employee.designation}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-lg font-bold tabular-nums", isTop ? "text-emerald-700" : "text-rose-600")}>
          {employee.score}
        </p>
        <p className="text-[10px] font-medium text-slate-400">/ 100</p>
      </div>
    </div>
  );
}

export function PerformanceHighlightsStrip({ scopeLabel, top, bottom }: Props) {
  if (!top && !bottom) return null;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {scopeLabel} highlights
        </span>
        {top && bottom && top.id !== bottom.id ? (
          <span className="text-[10px] text-slate-400">· Best vs needs support</span>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {top ? (
          <div>
            <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              <ArrowUp className="h-3 w-3" />
              Top performer
            </p>
            <PerformerChip employee={top} variant="top" />
          </div>
        ) : null}
        {bottom && top && bottom.id !== top.id ? (
          <div>
            <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-rose-600">
              <ArrowDown className="h-3 w-3" />
              Needs coaching
            </p>
            <PerformerChip employee={bottom} variant="bottom" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
