"use client";

import { motion } from "framer-motion";
import { KeyRound, Mail, Shield, Trash2, X } from "lucide-react";

import { ModuleAccessChips } from "@/features/workspace/components/user-management/module-access-chips";
import { UserStatusBadge } from "@/features/workspace/components/user-management/user-status-badge";
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
  user: WorkspaceUserRecord;
  onClose: () => void;
  onUpdate: (patch: Partial<WorkspaceUserRecord>) => void;
  onRemove?: () => void;
};

const statuses: WorkspaceUserStatus[] = ["active", "invited", "suspended", "locked"];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-900 dark:text-white">{value}</dd>
    </div>
  );
}

export function UserDetailPanel({ user, onClose, onUpdate, onRemove }: Props) {
  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Close"
        className="fixed inset-0 z-[100] bg-black/30"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="member-detail-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND }}
            >
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <h2 id="member-detail-title" className="text-base font-semibold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <UserStatusBadge status={user.status} />
            {user.mfaEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <Shield className="h-3 w-3" />
                MFA on
              </span>
            ) : null}
          </div>

          <dl className="divide-y divide-slate-100 dark:divide-slate-800">
            <Row label="Profile role" value={user.profileRole} />
            <Row label="Department" value={user.department} />
            {user.team ? <Row label="Team" value={user.team} /> : null}
            <Row label="Joined" value={user.joinedAt} />
            <Row label="Last active" value={user.lastActive} />
          </dl>

          <div className="mt-6">
            <p className="text-xs font-medium text-slate-500">Module access</p>
            <div className="mt-2">
              <ModuleAccessChips modules={user.modules} max={6} />
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium text-slate-500">Change status</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdate({ status: s })}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium capitalize",
                    user.status === s
                      ? "text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400",
                  )}
                  style={user.status === s ? { backgroundColor: BRAND } : undefined}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            <KeyRound className="h-4 w-4" />
            Reset password
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              Remove member
            </button>
          ) : null}
        </div>
      </motion.aside>
    </>
  );
}
