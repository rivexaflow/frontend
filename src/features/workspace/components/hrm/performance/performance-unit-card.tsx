"use client";

import { ChevronRight, MoreVertical, UsersRound } from "lucide-react";

import {
  PerformanceAvatarStack,
  PerformanceBandBadge,
  PerformanceScoreRing,
  PerformanceStageBar,
  PerformanceTrendLabel,
} from "@/features/workspace/components/hrm/performance/performance-primitives";
import type { PerformanceBand, PerformanceStage } from "@/features/workspace/data/hrm-performance-demo";
import { cn } from "@/lib/utils/cn";

export type PerformanceUnitCardData = {
  id: string;
  title: string;
  category: string;
  leaderName: string;
  memberCount: number;
  avatarNames: string[];
  score: number;
  trendPct: number;
  trendUp: boolean;
  sparkline: number[];
  stage: PerformanceStage;
  stageProgress: number;
  band: PerformanceBand;
  kind: "team";
};

type Props = {
  unit: PerformanceUnitCardData;
  selected?: boolean;
  onSelect: () => void;
};

export function PerformanceUnitCard({ unit, selected, onSelect }: Props) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group flex cursor-pointer flex-wrap items-center gap-4 rounded-2xl border bg-white px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_24px_rgba(25,25,112,0.08)] sm:gap-5 sm:px-5 sm:py-4",
        selected
          ? "border-[#2277ff] ring-2 ring-[#2277ff]/20"
          : "border-slate-200/80 hover:border-[#2277ff]/30",
      )}
    >
      <div className="flex min-w-[180px] flex-1 items-start gap-3 sm:min-w-[220px]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191970]/10 text-[#191970]">
          <UsersRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#191970] sm:text-[15px]">{unit.title}</p>
          <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {unit.category}
          </span>
          <p className="mt-1 truncate text-[11px] text-slate-500">
            Lead · <span className="font-semibold text-slate-700">{unit.leaderName}</span>
          </p>
        </div>
      </div>

      <div className="hidden sm:block">
        <PerformanceAvatarStack names={unit.avatarNames.length ? unit.avatarNames : [unit.leaderName]} />
      </div>

      <div className="hidden md:block">
        <PerformanceTrendLabel pct={unit.trendPct} up={unit.trendUp} sparkline={unit.sparkline} />
      </div>

      <div className="flex items-center gap-3">
        <PerformanceScoreRing score={unit.score} band={unit.band} />
        <div className="hidden sm:block">
          <p className="text-[10px] font-medium text-slate-400">Score out of 100</p>
          <PerformanceBandBadge band={unit.band} />
        </div>
      </div>

      <div className="hidden lg:block">
        <PerformanceStageBar stage={unit.stage} progress={unit.stageProgress} band={unit.band} />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2277ff] opacity-0 transition group-hover:opacity-100">
          Open
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
