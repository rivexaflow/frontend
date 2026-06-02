"use client";

import {
  KeyRound,
  Lock,
  LogOut,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import { UserRoleBadge } from "@/features/workspace/components/user-management/user-role-badge";
import { cn } from "@/lib/utils/cn";

type Props = {
  user: WorkspaceUserRecord;
  onEdit?: (user: WorkspaceUserRecord) => void;
};

const statusDot: Record<WorkspaceUserRecord["status"], string> = {
  active: "bg-emerald-500",
  invited: "bg-amber-400",
  suspended: "bg-rose-500",
  locked: "bg-slate-400",
};

export function WorkspaceUserCard({ user, onEdit }: Props) {
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-bold text-slate-600 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300">
            {initials}
          </div>
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900",
              statusDot[user.status],
            )}
            title={user.status}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
            {user.department}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
        {[
          { icon: Lock, label: "Access" },
          { icon: Pencil, label: "Edit", onClick: () => onEdit?.(user) },
          { icon: Trash2, label: "Remove" },
          { icon: KeyRound, label: "Reset password" },
          { icon: LogOut, label: "End sessions" },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={label}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      <div className="p-3 pt-2">
        <UserRoleBadge role={user.profileRole} />
      </div>
    </article>
  );
}

export function NewWorkspaceUserCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[188px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-blue-200/90 bg-blue-50/30 p-6 text-center transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20 dark:hover:border-blue-700"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
        <UserRound className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">New user</p>
        <p className="mt-1 text-xs text-slate-500">Invite a teammate and assign a profile role</p>
      </div>
    </button>
  );
}
