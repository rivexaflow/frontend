import type { HrmEmploymentStatus } from "@/features/workspace/data/hrm-employees-demo";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<HrmEmploymentStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300",
  probation: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-300",
  on_leave: "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-950/40 dark:text-sky-300",
  offboarding: "bg-orange-50 text-orange-700 ring-orange-600/15 dark:bg-orange-950/40 dark:text-orange-300",
  terminated: "bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-400",
  inactive: "bg-slate-100 text-slate-500 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-500",
};

const LABELS: Record<HrmEmploymentStatus, string> = {
  active: "Active",
  probation: "Probation",
  on_leave: "On leave",
  offboarding: "Offboarding",
  terminated: "Terminated",
  inactive: "Inactive",
};

export function EmployeeStatusBadge({
  status,
  className,
}: {
  status: HrmEmploymentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
