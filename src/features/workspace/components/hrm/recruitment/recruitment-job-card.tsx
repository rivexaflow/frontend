"use client";

import {
  Briefcase,
  CalendarClock,
  Clock,
  MapPin,
  MoreHorizontal,
  Pencil,
  Star,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { HrmRecruitmentJob } from "@/features/workspace/data/hrm-recruitment-demo";
import { cn } from "@/lib/utils/cn";

const PRIORITY_STYLE: Record<HrmRecruitmentJob["priority"], string> = {
  high: "bg-rose-50 text-rose-700 ring-rose-600/15",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
  low: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

const STAGE_STYLE: Record<HrmRecruitmentJob["stage"], string> = {
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  draft: "bg-amber-50 text-amber-700 ring-amber-600/15",
  closed: "bg-slate-100 text-slate-600 ring-slate-500/15",
};

const CARD_PALETTES = [
  {
    surface: "from-[#eef2ff] via-white to-[#f8faff]",
    border: "border-[#c7d2fe]/70 hover:border-[#2277ff]/40",
    accent: "text-[#191970]",
    icon: "from-[#191970] to-[#2277ff]",
  },
  {
    surface: "from-[#f0f9ff] via-white to-[#f8fcff]",
    border: "border-[#bae6fd]/70 hover:border-[#0056ff]/40",
    accent: "text-[#0056ff]",
    icon: "from-[#2277ff] to-[#0056ff]",
  },
  {
    surface: "from-[#ecfdf5] via-white to-[#f4fdf8]",
    border: "border-[#a7f3d0]/70 hover:border-emerald-400/40",
    accent: "text-emerald-800",
    icon: "from-emerald-600 to-teal-500",
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
  job: HrmRecruitmentJob;
  selected?: boolean;
  onSelect: () => void;
  onEdit: () => void;
};

export function RecruitmentJobCard({ job, selected, onSelect, onEdit }: Props) {
  const palette = paletteForId(job.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-4 text-left shadow-sm transition-all duration-200",
        palette.surface,
        palette.border,
        selected && "ring-2 ring-[#191970]/30 shadow-md",
        "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#2277ff]/5 transition group-hover:bg-[#2277ff]/10" />

      <div className="relative flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
              palette.icon,
            )}
          >
            <Briefcase className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className={cn("truncate text-sm font-bold tracking-tight", palette.accent)}>{job.title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{job.department}</p>
          </div>
        </button>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/60 hover:text-slate-700"
            aria-label="Job actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full z-10 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-slate-200/90 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit opening
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSelect();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Users className="h-3.5 w-3.5" />
                View pipeline
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className="relative mt-3 cursor-pointer text-left outline-none"
      >
        <div className="flex flex-wrap gap-1.5">
          <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", STAGE_STYLE[job.stage])}>
            {job.stage}
          </span>
          <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset", PRIORITY_STYLE[job.priority])}>
            {job.priority} priority
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/70 px-2 py-1.5 ring-1 ring-slate-200/60">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Openings</p>
            <p className="text-sm font-bold tabular-nums text-slate-900">{job.openings}</p>
          </div>
          <div className="rounded-lg bg-white/70 px-2 py-1.5 ring-1 ring-slate-200/60">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Applicants</p>
            <p className="text-sm font-bold tabular-nums text-slate-900">{job.applicants}</p>
          </div>
          <div className="rounded-lg bg-white/70 px-2 py-1.5 ring-1 ring-slate-200/60">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Interviewed</p>
            <p className="text-sm font-bold tabular-nums text-slate-900">{job.interviewed}</p>
          </div>
        </div>

        <div className="mt-3 space-y-1.5 border-t border-slate-200/60 pt-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UserRound className="h-3 w-3 shrink-0" />
            <span className="truncate">{job.hiringManager}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {job.avgDaysOpen > 0 ? `${job.avgDaysOpen}d avg open` : "Not posted"}
            </span>
            {job.salaryRange ? (
              <span className="font-semibold text-[#191970]">{job.salaryRange}</span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2277ff] opacity-0 transition group-hover:opacity-100">
            View pipeline
            <Star className="h-3 w-3" />
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#191970]/5 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            <Users className="h-3 w-3" />
            {job.offers} offer{job.offers === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function RecruitmentJobDetailHeader({ job }: { job: HrmRecruitmentJob }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{job.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{job.description}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STAGE_STYLE[job.stage])}>
            {job.stage}
          </span>
          <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", PRIORITY_STYLE[job.priority])}>
            {job.priority}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5" /> {job.hiringManager}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5" /> Posted {job.postedAt}
        </span>
        {job.salaryRange ? <span className="font-semibold text-[#191970]">{job.salaryRange}</span> : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#191970] text-[10px] font-bold text-white">
          {initials(job.hiringManager)}
        </span>
        <div>
          <p className="text-xs font-semibold text-slate-700">{job.hiringManager}</p>
          <p className="text-[10px] text-slate-400">Hiring manager · {job.employmentType}</p>
        </div>
      </div>
    </div>
  );
}
