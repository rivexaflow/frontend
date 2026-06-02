"use client";

import type { ReactNode } from "react";
import {
  Clock,
  KeyRound,
  Mail,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";

import { ModuleAccessChips } from "@/features/workspace/components/user-management/module-access-chips";
import { UserRoleBadge } from "@/features/workspace/components/user-management/user-role-badge";
import { UserStatusBadge } from "@/features/workspace/components/user-management/user-status-badge";
import { WORKSPACE_ACCESS_MODULES } from "@/features/workspace/data/workspace-user-modules";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import type { WorkspaceUserStatus } from "@/features/workspace/data/workspace-user-roles";
import { cn } from "@/lib/utils/cn";

const BRAND = "#191970";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  user: WorkspaceUserRecord | null;
  onInvite: () => void;
  onUpdate?: (patch: Partial<WorkspaceUserRecord>) => void;
  onRemove?: () => void;
  workspaceStats?: { total: number; active: number; mfaPct: number };
};

const statuses: WorkspaceUserStatus[] = ["active", "invited", "suspended", "locked"];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{children}</h3>
  );
}

export function MemberLivePreview({ user, onInvite, onUpdate, onRemove, workspaceStats }: Props) {
  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800" style={{ borderTopWidth: 3, borderTopColor: BRAND }}>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Member details</p>
          <p className="mt-0.5 text-xs text-slate-500">Select someone from the list to review their profile.</p>
        </div>
        <div className="flex flex-1 flex-col justify-between p-5">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            You can view profile role, department, module access, and security settings for any workspace member.
          </p>
          {workspaceStats ? (
            <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
              {[
                { label: "Members", value: workspaceStats.total },
                { label: "Active", value: workspaceStats.active },
                { label: "MFA", value: `${workspaceStats.mfaPct}%` },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-950">
                  <dt className="text-[10px] font-medium text-slate-500">{s.label}</dt>
                  <dd className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <button
            type="button"
            onClick={onInvite}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            <UserPlus className="h-4 w-4" />
            Invite member
          </button>
        </div>
      </div>
    );
  }

  const securityScore = user.mfaEnabled ? (user.status === "active" ? 92 : 68) : 54;

  return (
    <div className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="px-5 py-4" style={{ borderTop: `3px solid ${BRAND}`, backgroundColor: BRAND }}>
        <p className="text-[11px] font-medium text-white/70">Member details</p>
        <div className="mt-3 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-semibold text-white">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-white">{user.name}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-white/75">
              <Mail className="h-3 w-3 shrink-0" />
              {user.email}
            </p>
          </div>
          <UserStatusBadge status={user.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div>
          <SectionTitle>Profile role</SectionTitle>
          <div className="mt-2">
            <UserRoleBadge role={user.profileRole} size="md" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-[10px] font-medium text-slate-500">Department</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{user.department}</p>
            {user.team ? <p className="text-xs text-slate-500">{user.team}</p> : null}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-950">
            <p className="text-[10px] font-medium text-slate-500">Security score</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              <Shield className="h-3.5 w-3.5 text-[#191970]" />
              {securityScore} / 100
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full" style={{ width: `${securityScore}%`, backgroundColor: BRAND }} />
            </div>
          </div>
        </div>

        <div>
          <SectionTitle>Module access</SectionTitle>
          <div className="mt-2">
            <ModuleAccessChips modules={user.modules} max={6} />
          </div>
          <ul className="mt-3 space-y-1.5">
            {WORKSPACE_ACCESS_MODULES.map((mod) => {
              const enabled = user.modules.includes(mod.id);
              return (
                <li
                  key={mod.id}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2 text-xs",
                    enabled
                      ? "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      : "border-transparent bg-slate-50 text-slate-400 dark:bg-slate-900/50",
                  )}
                >
                  <span className="font-medium">{mod.label}</span>
                  <span className={enabled ? "font-semibold text-emerald-600" : "text-slate-400"}>
                    {enabled ? "Granted" : "No access"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {onUpdate ? (
          <div>
            <SectionTitle>Account status</SectionTitle>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdate({ status: s })}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition",
                    user.status === s
                      ? "text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
                  )}
                  style={user.status === s ? { backgroundColor: BRAND } : undefined}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-auto space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Reset access
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              View activity
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            Last active {user.lastActive} · Joined {user.joinedAt}
          </p>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove from workspace
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
