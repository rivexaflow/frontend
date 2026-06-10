"use client";

import type { ElementType, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  KeyRound,
  Mail,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ModuleAccessChips } from "@/features/workspace/components/user-management/module-access-chips";
import { UserStatusBadge } from "@/features/workspace/components/user-management/user-status-badge";
import type { WorkspaceUserRecord } from "@/features/workspace/data/workspace-users-demo";
import type { WorkspaceUserStatus } from "@/features/workspace/data/workspace-user-roles";
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
  user: WorkspaceUserRecord;
  onClose: () => void;
  onUpdate: (patch: Partial<WorkspaceUserRecord>) => void;
  onRemove?: () => void;
};

const statuses: { id: WorkspaceUserStatus; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "invited", label: "Invited" },
  { id: "suspended", label: "Suspended" },
  { id: "locked", label: "Locked" },
];

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{children}</h3>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm dark:bg-slate-800">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
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
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[420px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="member-detail-title"
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#191970] via-[#1e2278] to-[#2d3a8c] px-5 pb-5 pt-4 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" aria-hidden />
          <div className="absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-white/5" aria-hidden />

          <div className="relative flex items-start justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Member profile</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-4 flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/15 text-base font-bold ring-2 ring-white/20 backdrop-blur-sm">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="member-detail-title" className="truncate text-lg font-semibold tracking-tight">
                {user.name}
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-white/70">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex flex-wrap items-center gap-2">
            <UserStatusBadge status={user.status} variant="glass" />
            {user.mfaEnabled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                <ShieldCheck className="h-3 w-3" />
                MFA enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/60">
                MFA not configured
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <SectionTitle>Organization</SectionTitle>
          <div className="space-y-2">
            <InfoItem icon={Briefcase} label="Profile role" value={user.profileRole} />
            <InfoItem icon={Building2} label="Department" value={user.department} />
            {user.team ? <InfoItem icon={Users} label="Team" value={user.team} /> : null}
          </div>

          <div className="mt-6">
            <SectionTitle>Activity</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <InfoItem icon={Calendar} label="Joined" value={user.joinedAt} />
              <InfoItem icon={Clock} label="Last active" value={user.lastActive} />
            </div>
          </div>

          <div className="mt-6">
            <SectionTitle>Module access</SectionTitle>
            <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <ModuleAccessChips modules={user.modules} max={8} />
              <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
                Access inherits from role template. Override per module in role settings.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <SectionTitle>Account status</SectionTitle>
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-900/50">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onUpdate({ status: s.id })}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-semibold transition",
                    user.status === s.id
                      ? "bg-[#191970] text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 space-y-2 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <KeyRound className="h-4 w-4 text-slate-500" />
            Send password reset
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200/80 bg-rose-50/50 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              Remove from workspace
            </button>
          ) : null}
        </div>
      </motion.aside>
    </>
  );
}
