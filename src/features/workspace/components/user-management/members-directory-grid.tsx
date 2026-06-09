"use client";

import { ChevronRight, Clock, Plus, Shield, ShieldCheck } from "lucide-react";

import { UserStatusBadge } from "@/features/workspace/components/user-management/user-status-badge";
import {
  WORKSPACE_ACCESS_MODULES,
  type WorkspaceModuleId,
} from "@/features/workspace/data/workspace-user-modules";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import type { WorkspaceUserStatus } from "@/features/workspace/data/workspace-user-roles";
import { cn } from "@/lib/utils/cn";

const BRAND = "#191970";

const DEPT_ACCENT: Record<string, string> = {
  Revenue: "from-blue-600 to-indigo-600",
  Compliance: "from-emerald-600 to-teal-600",
  People: "from-violet-600 to-purple-600",
  Finance: "from-amber-500 to-orange-600",
  Operations: "from-slate-600 to-slate-700",
  Intelligence: "from-indigo-600 to-violet-600",
  Support: "from-cyan-600 to-sky-600",
};

const STATUS_RING: Record<WorkspaceUserStatus, string> = {
  active: "ring-emerald-400/50",
  invited: "ring-amber-400/60",
  suspended: "ring-rose-400/50",
  locked: "ring-slate-400/40",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function moduleLabel(id: WorkspaceModuleId) {
  return WORKSPACE_ACCESS_MODULES.find((m) => m.id === id)?.label.split(" ")[0] ?? id.toUpperCase();
}

function deptAccent(department: string) {
  return DEPT_ACCENT[department] ?? "from-[#191970] to-indigo-700";
}

type Props = {
  users: WorkspaceUserRecord[];
  selectedId: string | null;
  onSelect: (user: WorkspaceUserRecord) => void;
  onInvite: () => void;
};

function MemberIdentityCard({
  user,
  selected,
  onSelect,
}: {
  user: WorkspaceUserRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const accent = deptAccent(user.department);
  const moduleText = user.modules.slice(0, 2).map(moduleLabel).join(" · ");
  const extraModules = user.modules.length > 2 ? ` +${user.modules.length - 2}` : "";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all duration-200 dark:bg-slate-900",
        selected
          ? "border-[#191970] shadow-md ring-1 ring-[#191970]/25"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700",
      )}
    >
      {/* Left accent bar */}
      <div className={cn("w-1 shrink-0 bg-gradient-to-b", accent)} aria-hidden />

      <div className="min-w-0 flex-1 px-3 py-3">
        {/* Row 1: avatar + identity + status */}
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900",
                accent,
                STATUS_RING[user.status],
              )}
            >
              {initials(user.name)}
            </div>
            {user.mfaEnabled ? (
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-emerald-600 text-white dark:border-slate-900"
                title="MFA enabled"
              >
                <ShieldCheck className="h-2 w-2" />
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user.name}</p>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-[#191970]",
                  selected && "text-[#191970]",
                )}
                aria-hidden
              />
            </div>
            <p className="truncate text-[11px] font-medium text-slate-500">{user.profileRole}</p>
          </div>
        </div>

        {/* Row 2: email */}
        <p className="mt-2 truncate text-[11px] text-slate-400">{user.email}</p>

        {/* Row 3: dept + modules + activity */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <UserStatusBadge status={user.status} className="!px-1.5 !py-0 !text-[9px]" />
            <span className="truncate text-[10px] font-semibold text-slate-500">
              {user.department}
              {moduleText ? ` · ${moduleText}${extraModules}` : ""}
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-slate-400">
            <Clock className="h-2.5 w-2.5" />
            {user.lastActive}
          </span>
        </div>
      </div>
    </button>
  );
}

function InviteMemberCard({ onInvite }: { onInvite: () => void }) {
  return (
    <button
      type="button"
      onClick={onInvite}
      className="group flex w-full items-center gap-3 overflow-hidden rounded-xl border border-dashed border-slate-200 bg-gradient-to-r from-slate-50/80 to-blue-50/40 px-3 py-3 text-left transition hover:border-[#191970]/40 hover:shadow-sm dark:border-slate-700 dark:from-slate-950/40 dark:to-blue-950/20"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-indigo-700 text-white shadow-sm transition group-hover:scale-105">
        <Plus className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Invite member</p>
        <p className="truncate text-[11px] text-slate-500">Add role, access & send invite</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#191970]" />
    </button>
  );
}

export function MembersDirectoryGrid({ users, selectedId, onSelect, onInvite }: Props) {
  if (users.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Shield className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No members match your filters</p>
        <button
          type="button"
          onClick={onInvite}
          className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
          <Plus className="h-3.5 w-3.5" />
          Invite member
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 bg-slate-50/50 p-3 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1280px]:grid-cols-3 min-[1536px]:grid-cols-4 dark:bg-slate-950/20">
      {users.map((user) => (
        <MemberIdentityCard
          key={user.id}
          user={user}
          selected={selectedId === user.id}
          onSelect={() => onSelect(user)}
        />
      ))}
      <InviteMemberCard onInvite={onInvite} />
    </div>
  );
}
