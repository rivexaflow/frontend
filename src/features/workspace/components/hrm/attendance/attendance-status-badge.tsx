import type { AttendanceStatus } from "@/features/workspace/data/hrm-attendance-demo";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<AttendanceStatus, string> = {
  present: "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300",
  remote: "bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-950/40 dark:text-sky-300",
  late: "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-300",
  half_day: "bg-orange-50 text-orange-700 ring-orange-600/15 dark:bg-orange-950/40 dark:text-orange-300",
  on_leave: "bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-950/40 dark:text-violet-300",
  absent: "bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-950/40 dark:text-rose-300",
};

const LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  remote: "Remote",
  late: "Late",
  half_day: "Half day",
  on_leave: "On leave",
  absent: "Absent",
};

export function AttendanceStatusBadge({
  status,
  className,
}: {
  status: AttendanceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        STYLES[status],
        className,
      )}
    >
      {LABELS[status]}
    </span>
  );
}
