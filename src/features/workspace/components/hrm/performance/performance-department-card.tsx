"use client";

import { ArrowUpRight, Building2, MoreVertical, Users, UsersRound } from "lucide-react";

import {
  PerformanceAvatarStack,
  PerformanceBandBadge,
  PerformanceScoreRing,
  PerformanceSparkline,
  PerformanceStageBar,
} from "@/features/workspace/components/hrm/performance/performance-primitives";
import type { PerformanceDepartment } from "@/features/workspace/data/hrm-performance-demo";
import { cn } from "@/lib/utils/cn";

const CARD_PALETTES = [
  {
    surface: "from-[#eef2ff] via-white to-[#f5f7ff]",
    border: "border-[#c7d2fe]/70 hover:border-[#2277ff]/45",
    accent: "text-[#191970]",
    icon: "from-[#191970] to-[#2277ff]",
    glow: "bg-[#2277ff]/10",
  },
  {
    surface: "from-[#f0f9ff] via-white to-[#f8fcff]",
    border: "border-[#bae6fd]/70 hover:border-[#0056ff]/45",
    accent: "text-[#0056ff]",
    icon: "from-[#2277ff] to-[#0056ff]",
    glow: "bg-[#0056ff]/10",
  },
  {
    surface: "from-[#ecfdf5] via-white to-[#f4fdf8]",
    border: "border-[#a7f3d0]/70 hover:border-emerald-400/45",
    accent: "text-emerald-900",
    icon: "from-emerald-600 to-teal-500",
    glow: "bg-emerald-400/10",
  },
  {
    surface: "from-[#fffbeb] via-white to-[#fffdf5]",
    border: "border-[#fde68a]/70 hover:border-amber-400/45",
    accent: "text-amber-950",
    icon: "from-amber-500 to-orange-500",
    glow: "bg-amber-400/10",
  },
] as const;

function paletteForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % CARD_PALETTES.length;
  return CARD_PALETTES[hash];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  dept: PerformanceDepartment;
  avatarNames: string[];
  selected?: boolean;
  onSelect: () => void;
};

export function PerformanceDepartmentCard({ dept, avatarNames, selected, onSelect }: Props) {
  const palette = paletteForId(dept.id);

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
        "group relative flex min-h-[320px] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-200",
        palette.surface,
        palette.border,
        selected
          ? "ring-2 ring-[#191970]/25 shadow-[0_12px_32px_rgba(25,25,112,0.12)]"
          : "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(25,25,112,0.1)]",
      )}
    >
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl", palette.glow)} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.6),transparent_45%)]" />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
              palette.icon,
            )}
          >
            <Building2 className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <h3 className={cn("truncate text-base font-bold tracking-tight", palette.accent)}>{dept.name}</h3>
            <span className="mt-1 inline-block rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200/80">
              Department
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/70 hover:text-slate-600"
          aria-label={`Actions for ${dept.name}`}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[9px] font-bold text-[#191970] shadow-sm ring-1 ring-white">
          {initials(dept.headName)}
        </span>
        <p className="min-w-0 truncate text-sm text-slate-600">
          <span className="text-slate-400">Head ·</span>{" "}
          <span className="font-semibold text-slate-800">{dept.headName}</span>
        </p>
      </div>

      <div className="relative mt-4">
        <PerformanceAvatarStack names={avatarNames.length ? avatarNames : [dept.headName]} max={4} />
      </div>

      <div className="relative mt-4 flex items-end justify-between gap-3 rounded-xl bg-white/60 px-3 py-2.5 ring-1 ring-white/80">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Trend</p>
          <PerformanceSparkline values={dept.sparkline} height={36} />
          <p
            className={cn(
              "mt-0.5 text-[11px] font-semibold",
              dept.trendUp ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {dept.trendUp ? "+" : "−"}
            {dept.trendPct}% this cycle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PerformanceScoreRing score={dept.avgScore} band={dept.band} size={56} />
          <div>
            <p className="text-[10px] font-medium text-slate-400">Score</p>
            <PerformanceBandBadge band={dept.band} />
          </div>
        </div>
      </div>

      <div className="relative mt-4">
        <PerformanceStageBar stage={dept.stage} progress={dept.stageProgress} band={dept.band} />
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-3 pt-5">
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200/70">
            <UsersRound className="h-3 w-3 text-[#2277ff]" />
            {dept.teamCount} teams
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200/70">
            <Users className="h-3 w-3 text-slate-400" />
            {dept.memberCount}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2277ff] opacity-0 transition group-hover:opacity-100">
          View teams
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}
