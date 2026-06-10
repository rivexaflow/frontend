import type { LeaveStatus } from "@/features/workspace/data/hrm-leave-demo";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<LeaveStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-300",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-950/40 dark:text-rose-300",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-400",
};

const LABELS: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
