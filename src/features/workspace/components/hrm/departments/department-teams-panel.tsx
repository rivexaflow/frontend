"use client";

import { Pencil, Plus, Trash2, UsersRound, X } from "lucide-react";

import type { HrmDepartment, HrmDepartmentTeam } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

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
  memberLabel: (id: string | null | undefined) => string;
  onClose: () => void;
  onEditDept: () => void;
  onAddTeam: () => void;
  onEditTeam: (team: HrmDepartmentTeam) => void;
  onDeleteTeam: (teamId: string) => void;
};

export function DepartmentTeamsPanel({
  dept,
  headLabel,
  memberLabel,
  onClose,
  onEditDept,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
}: Props) {
  return (
    <div className="flex h-full flex-col border-l border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Department</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{dept.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Head · {headLabel} · {dept.memberCount ?? 0} members
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEditDept}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Edit department"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Teams</h4>
          <span className="rounded-full bg-[#191970] px-2 py-0.5 text-[10px] font-bold text-white">
            {dept.teams.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddTeam}
          className="inline-flex items-center gap-1 rounded-lg bg-[#191970] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#12124a]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add team
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {dept.teams.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center dark:border-slate-700">
            <UsersRound className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No teams yet</p>
            <p className="mt-1 text-sm text-slate-500">Create a team to organize members inside this department.</p>
            <button
              type="button"
              onClick={onAddTeam}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#12124a]"
            >
              <Plus className="h-4 w-4" />
              Add team
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {dept.teams.map((team, index) => (
              <TeamWorkflowCard
                key={team.id}
                team={team}
                leaderLabel={memberLabel(team.leaderId)}
                variant={index % 3}
                onEdit={() => onEditTeam(team)}
                onDelete={() => onDeleteTeam(team.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const TEAM_GRADIENTS = [
  "from-[#191970]/80 via-[#2277ff]/70 to-[#0ea5e9]/60",
  "from-emerald-600/70 via-teal-500/60 to-cyan-400/50",
  "from-amber-500/70 via-orange-400/60 to-rose-400/50",
] as const;

function TeamWorkflowCard({
  team,
  leaderLabel,
  variant,
  onEdit,
  onDelete,
}: {
  team: HrmDepartmentTeam;
  leaderLabel: string;
  variant: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const gradient = TEAM_GRADIENTS[variant % TEAM_GRADIENTS.length];

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className={cn("relative h-24 bg-gradient-to-br", gradient)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white"
            aria-label={`Edit ${team.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-white/90 p-1.5 text-rose-600 shadow-sm backdrop-blur-sm hover:bg-white"
            aria-label={`Delete ${team.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative -mt-6 px-4 pb-4">
        <div className="flex items-end justify-between gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border-4 border-white bg-[#191970] text-xs font-bold text-white shadow-md dark:border-slate-900">
            {initials(team.name)}
          </span>
          <span className="mb-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {team.memberCount ?? 0} members
          </span>
        </div>
        <h5 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{team.name}</h5>
        <p className="mt-0.5 text-xs text-slate-500">Leader · {leaderLabel}</p>
      </div>
    </article>
  );
}
