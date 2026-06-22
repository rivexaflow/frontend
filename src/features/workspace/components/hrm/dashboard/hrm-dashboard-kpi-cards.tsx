"use client";

import { Briefcase, TrendingDown, TrendingUp, UserCheck, Users } from "lucide-react";

import {
  HRM_DASHBOARD_COLORS,
  type HrmDashboardKpi,
  type HrmRecruitmentStage,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { cn } from "@/lib/utils/cn";

const KPI_ICONS = [Users, UserCheck, Briefcase] as const;

type Props = {
  items: HrmDashboardKpi[];
  activeId: HrmRecruitmentStage | null;
  onSelect: (id: HrmRecruitmentStage) => void;
};

function MiniSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-10 items-end gap-[3px]" aria-hidden>
      {values.map((v, i) => {
        const h = Math.max((v / max) * 100, 8);
        return (
          <div
            key={i}
            className="w-[5px] rounded-sm bg-gradient-to-t from-[#191970] to-[#2277ff] transition-all"
            style={{ height: `${h}%`, minHeight: 4 }}
          />
        );
      })}
    </div>
  );
}

export function HrmDashboardKpiCards({ items, activeId, onSelect }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const Icon = KPI_ICONS[index] ?? Users;
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "group relative w-full overflow-hidden rounded-2xl border bg-white p-5 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_24px_rgba(34,119,255,0.1)] dark:bg-slate-900",
              isActive
                ? "border-[#2277ff] ring-2 ring-[#2277ff]/25"
                : "border-slate-200/70 hover:border-[#2277ff]/30 dark:border-slate-800",
            )}
            aria-pressed={isActive}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#191970] via-[#2277ff] to-[#0ea5e9] transition",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                  {item.value}
                </p>
                <p
                  className={cn(
                    "mt-1.5 inline-flex items-center gap-1 text-xs font-semibold",
                    item.deltaUp ? "text-emerald-600" : "text-rose-600",
                  )}
                >
                  {item.deltaUp ? (
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {item.delta}
                </p>
              </div>
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: isActive ? HRM_DASHBOARD_COLORS.blue : `${HRM_DASHBOARD_COLORS.midnight}14`, color: isActive ? "#fff" : HRM_DASHBOARD_COLORS.midnight }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <MiniSparkline values={item.sparkline} />
            </div>
            <p className="mt-2 text-[10px] font-medium text-[#2277ff] opacity-0 transition group-hover:opacity-100">
              {isActive ? "Pipeline open · click to close" : "Click to open recruitment pipeline →"}
            </p>
          </button>
        );
      })}
    </div>
  );
}
