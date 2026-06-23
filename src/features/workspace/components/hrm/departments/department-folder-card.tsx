"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Building2, MoreVertical, Pencil, Plus, Trash2, Users, UsersRound } from "lucide-react";

import type { HrmDepartment } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const FOLDER_PALETTES = [
  {
    surface: "from-[#eef2ff] via-[#f5f7ff] to-[#e8edff]",
    tab: "from-[#eef2ff] to-[#e0e7ff]",
    border: "border-[#c7d2fe]/90",
    accent: "text-[#191970]",
    glow: "bg-[#2277ff]/20",
    chip: "bg-[#191970]/10 text-[#191970]",
    icon: "bg-gradient-to-br from-[#191970] to-[#2277ff] text-white shadow-md shadow-[#191970]/25",
  },
  {
    surface: "from-[#f0f9ff] via-[#f8fcff] to-[#e0f2fe]",
    tab: "from-[#f0f9ff] to-[#dbeafe]",
    border: "border-[#bae6fd]/90",
    accent: "text-[#0c4a6e]",
    glow: "bg-[#0056ff]/15",
    chip: "bg-[#2277ff]/10 text-[#0056ff]",
    icon: "bg-gradient-to-br from-[#2277ff] to-[#0056ff] text-white shadow-md shadow-[#2277ff]/25",
  },
  {
    surface: "from-[#ecfdf5] via-[#f4fdf8] to-[#d1fae5]",
    tab: "from-[#ecfdf5] to-[#bbf7d0]",
    border: "border-[#a7f3d0]/90",
    accent: "text-emerald-950",
    glow: "bg-emerald-400/20",
    chip: "bg-emerald-500/10 text-emerald-800",
    icon: "bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20",
  },
  {
    surface: "from-[#fffbeb] via-[#fffdf5] to-[#fef3c7]",
    tab: "from-[#fffbeb] to-[#fde68a]",
    border: "border-[#fde68a]/90",
    accent: "text-amber-950",
    glow: "bg-amber-400/20",
    chip: "bg-amber-500/10 text-amber-900",
    icon: "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20",
  },
] as const;

function paletteForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % FOLDER_PALETTES.length;
  return FOLDER_PALETTES[hash];
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
  dept: HrmDepartment;
  headLabel: string;
  selected?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onAddTeam: () => void;
  onDelete: () => void;
};

export function DepartmentFolderCard({
  dept,
  headLabel,
  selected,
  onSelect,
  onEdit,
  onAddTeam,
  onDelete,
}: Props) {
  const palette = paletteForId(dept.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const teamCount = dept.teams.length;
  const memberCount = dept.memberCount ?? 0;
  const avatarLabels = [
    headLabel !== "Unassigned" ? headLabel : null,
    ...dept.teams.slice(0, 3).map((t) => t.name),
  ].filter(Boolean) as string[];

  return (
    <article className="relative mx-auto w-full max-w-[420px] pt-5">
      {/* Folder tab */}
      <div
        className={cn(
          "absolute left-6 top-0 z-20 h-10 w-[118px] overflow-hidden rounded-t-[18px] border border-b-0 shadow-[0_-2px_12px_rgba(25,25,112,0.06)]",
          palette.border,
        )}
        aria-hidden
      >
        <div className={cn("h-full w-full bg-gradient-to-br", palette.tab)} />
        <div className="absolute inset-x-3 top-2 h-px bg-white/70" />
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
        className={cn(
          "group relative flex min-h-[210px] cursor-pointer flex-col overflow-hidden rounded-[22px] rounded-tl-[10px] border bg-gradient-to-br p-6 pt-7 text-left shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-300",
          palette.border,
          palette.surface,
          selected
            ? "scale-[1.01] ring-2 ring-[#191970]/35 shadow-[0_16px_40px_rgba(25,25,112,0.14)]"
            : "hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(25,25,112,0.12)]",
        )}
      >
        {/* Decorative layers */}
        <div className={cn("pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl", palette.glow)} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.55),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(#191970_0.6px,transparent_0.6px)] [background-size:14px_14px]" />

        {/* Top shine */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

        <div ref={menuRef} className="absolute right-4 top-4 z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="rounded-xl border border-white/60 bg-white/80 p-2 text-slate-600 shadow-sm backdrop-blur-md transition hover:border-[#191970]/20 hover:text-[#191970]"
            aria-label={`Actions for ${dept.name}`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full z-40 mt-1.5 min-w-[172px] overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 py-1 shadow-2xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
              <MenuItem icon={Plus} label="Add team" onClick={() => { setMenuOpen(false); onAddTeam(); }} />
              <MenuItem icon={Pencil} label="Edit department" onClick={() => { setMenuOpen(false); onEdit(); }} />
              <MenuItem icon={Trash2} label="Delete" danger onClick={() => { setMenuOpen(false); onDelete(); }} />
            </div>
          ) : null}
        </div>

        <div className="relative z-10 flex items-start gap-4 pr-12">
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", palette.icon)}>
            <Building2 className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("text-lg font-bold leading-tight tracking-tight", palette.accent)}>{dept.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[10px] font-bold text-[#191970] shadow-sm ring-1 ring-white">
                {headLabel !== "Unassigned" ? initials(headLabel) : "—"}
              </span>
              <p className="truncate text-sm text-slate-600">
                <span className="text-slate-400">Head ·</span>{" "}
                <span className="font-semibold text-slate-800">{headLabel}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto flex flex-wrap items-end justify-between gap-4 pt-8">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">People</p>
            <div className="flex -space-x-2.5">
              {avatarLabels.length > 0 ? (
                avatarLabels.slice(0, 4).map((label, i) => (
                  <span
                    key={`${label}-${i}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-white bg-[#191970] text-[10px] font-bold text-white shadow-md"
                    title={label}
                  >
                    {initials(label)}
                  </span>
                ))
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-white bg-slate-300 text-[10px] font-bold text-white">
                  —
                </span>
              )}
              {avatarLabels.length > 4 ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-white bg-white text-[10px] font-bold text-slate-600 shadow-md">
                  +{avatarLabels.length - 4}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-wrap justify-end gap-1.5">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", palette.chip)}>
                <UsersRound className="h-3 w-3" />
                {teamCount} team{teamCount === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm ring-1 ring-white/80">
                <Users className="h-3 w-3 text-slate-400" />
                {memberCount}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2277ff] opacity-0 transition group-hover:opacity-100">
              Open folder
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium transition",
        danger ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export function DepartmentFolderCardSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-[420px] animate-pulse pt-5">
      <div className="absolute left-6 top-0 h-10 w-[118px] rounded-t-[18px] bg-slate-200" />
      <div className="min-h-[210px] rounded-[22px] rounded-tl-[10px] border border-slate-200 bg-slate-100" />
    </div>
  );
}
