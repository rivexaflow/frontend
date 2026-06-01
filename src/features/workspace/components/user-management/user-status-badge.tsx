"use client";

import { cn } from "@/lib/utils/cn";
import type { WorkspaceUserStatus } from "@/features/workspace/data/workspace-user-roles";

const config: Record<
  WorkspaceUserStatus,
  { label: string; dot: string; pill: string }
> = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    pill: "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  invited: {
    label: "Invited",
    dot: "bg-amber-400",
    pill: "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
  },
  suspended: {
    label: "Suspended",
    dot: "bg-rose-500",
    pill: "border-rose-200/80 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300",
  },
  locked: {
    label: "Locked",
    dot: "bg-slate-400",
    pill: "border-slate-200/80 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
  },
};

type Props = {
  status: WorkspaceUserStatus;
  className?: string;
  variant?: "default" | "glass";
};

export function UserStatusBadge({ status, className, variant = "default" }: Props) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        variant === "glass"
          ? "border-white/20 bg-white/10 text-white"
          : c.pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} aria-hidden />
      {c.label}
    </span>
  );
}
