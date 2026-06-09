"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  KeyRound,
  Layers,
  Lock,
  Pencil,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";

import type { WorkspaceRoleRecord } from "@/features/workspace/data/workspace-roles-demo";
import {
  PERMISSION_CATEGORIES,
  labelForPermissionKey,
} from "@/features/workspace/data/workspace-permissions-catalog";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { roleEditPath } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

function summarizeCategories(keys: string[]) {
  const counts = new Map<string, number>();
  for (const key of keys) {
    const catId = key.split(".")[0] ?? "";
    if (catId) counts.set(catId, (counts.get(catId) ?? 0) + 1);
  }
  return PERMISSION_CATEGORIES.filter((c) => counts.has(c.id)).map((c) => ({
    label: c.label,
    count: counts.get(c.id) ?? 0,
  }));
}

function stageCount(stageAccess: WorkspaceRoleRecord["stageAccess"]) {
  return Object.values(stageAccess).filter((s) => s.view || s.move || s.edit).length;
}

type Props = {
  role: WorkspaceRoleRecord;
  onClose: () => void;
  onDelete?: () => void;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{children}</h3>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className="font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

export function RoleDetailPanel({ role, onClose, onDelete }: Props) {
  const categories = summarizeCategories(role.permissionKeys);
  const members = DEMO_WORKSPACE_USERS.filter((u) => role.memberIds.includes(u.id));
  const topPermissions = role.permissionKeys.slice(0, 12);
  const extraPerms = role.permissionKeys.length - topPermissions.length;

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
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[440px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="role-detail-title"
      >
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#191970] via-[#1e2278] to-[#2d3a8c] px-5 pb-5 pt-4 text-white">
          <div className="relative flex items-start justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Role policy</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative mt-4 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Shield className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="role-detail-title" className="text-lg font-semibold tracking-tight">
                {role.name}
              </h2>
              <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                {role.systemLocked ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    System role · read-only delete
                  </>
                ) : (
                  "Custom workspace role"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <SectionTitle>Policy summary</SectionTitle>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 px-4 dark:divide-slate-800 dark:border-slate-800">
            <InfoRow icon={KeyRound} label="Permissions" value={String(role.permissionKeys.length)} />
            <InfoRow icon={Layers} label="Pipeline stages" value={String(stageCount(role.stageAccess))} />
            <InfoRow icon={Users} label="Assigned members" value={String(members.length)} />
          </div>

          <div className="mt-6">
            <SectionTitle>Module coverage</SectionTitle>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{cat.label}</span>
                  <span className="text-xs tabular-nums text-slate-500">{cat.count} grants</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <SectionTitle>Permission grants</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {topPermissions.map((key) => (
                <span
                  key={key}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
                >
                  {labelForPermissionKey(key)}
                </span>
              ))}
              {extraPerms > 0 ? (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800">
                  +{extraPerms} more
                </span>
              ) : null}
            </div>
          </div>

          {members.length > 0 ? (
            <div className="mt-6">
              <SectionTitle>Assigned members</SectionTitle>
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#191970] text-[10px] font-bold text-white">
                      {m.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <span className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                      <p className="truncate text-xs text-slate-500">{m.email}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="shrink-0 space-y-2 border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <Link
            href={roleEditPath(role.id)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#191970] text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f0f4d]"
          >
            <Pencil className="h-4 w-4" />
            Edit role permissions
          </Link>
          {!role.systemLocked && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200/80 bg-white text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:bg-slate-900 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              Delete role
            </button>
          ) : null}
        </div>
      </motion.aside>
    </>
  );
}
