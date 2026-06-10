import type { PayrollRunStatus } from "@/features/workspace/data/hrm-payroll-demo";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<PayrollRunStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-400",
  processing: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-300",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-950/40 dark:text-rose-300",
};

const LABELS: Record<PayrollRunStatus, string> = {
  draft: "Draft",
  processing: "Processing",
  completed: "Paid",
  failed: "Failed",
};

export function PayrollStatusBadge({ status }: { status: PayrollRunStatus }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
