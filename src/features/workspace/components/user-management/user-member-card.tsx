"use client";

import { ChevronRight, Shield } from "lucide-react";

import { ModuleAccessChips } from "@/features/workspace/components/user-management/module-access-chips";
import { UserRoleBadge } from "@/features/workspace/components/user-management/user-role-badge";
import { UserStatusBadge } from "@/features/workspace/components/user-management/user-status-badge";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import { cn } from "@/lib/utils/cn";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const deptAccent: Record<string, string> = {
  Revenue: "from-[#191970] via-blue-700 to-indigo-600",
  Compliance: "from-emerald-700 to-teal-600",
  People: "from-violet-700 to-purple-600",
  Finance: "from-amber-600 to-orange-600",
  Operations: "from-slate-700 to-slate-900",
  Success: "from-cyan-600 to-blue-700",
  Intelligence: "from-indigo-700 to-blue-900",
  Support: "from-slate-600 to-slate-800",
};

type Props = {
  user: WorkspaceUserRecord;
  selected?: boolean;
  onSelect: () => void;
};

export function UserMemberCard({ user, selected, onSelect }: Props) {
  const accent = deptAccent[user.department] ?? "from-slate-700 to-slate-900";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border text-left transition duration-200",
        "bg-white shadow-sm hover:shadow-lg dark:bg-slate-900",
        selected
          ? "border-blue-400 ring-2 ring-blue-500/30 dark:border-blue-600"
          : "border-slate-200/90 hover:border-slate-300 dark:border-slate-800",
      )}
    >
      <div className={cn("h-1.5 w-full bg-gradient-to-r", accent)} />

      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-md",
                accent,
              )}
            >
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <UserStatusBadge status={user.status} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {user.department}
          </span>
        </div>

        <div className="mt-3">
          <UserRoleBadge role={user.profileRole} size="md" className="max-w-full" />
        </div>

        <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modules</p>
          <div className="mt-1.5">
            <ModuleAccessChips modules={user.modules} max={4} />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-slate-500">
          <span>{user.lastActive}</span>
          {user.mfaEnabled ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <Shield className="h-3 w-3" />
              MFA
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

export function InviteMemberCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#4338ca]/40 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-6 text-center transition hover:border-[#4338ca] hover:shadow-md dark:border-blue-800/50 dark:from-blue-950/30 dark:to-indigo-950/20"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#191970] text-white shadow-lg shadow-[#191970]/30">
        <span className="text-2xl font-light">+</span>
      </span>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">Invite member</p>
        <p className="mt-1 max-w-[12rem] text-xs leading-relaxed text-slate-500">
          Guided setup — identity, org placement, and module access in one flow
        </p>
      </div>
    </button>
  );
}
