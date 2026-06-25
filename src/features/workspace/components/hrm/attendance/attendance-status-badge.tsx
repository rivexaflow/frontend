import type { AttendanceStatus } from "@/features/workspace/data/hrm-attendance-demo";
import { cn } from "@/lib/utils/cn";

const STYLES: Record<AttendanceStatus, string> = {
  present: "bg-[#2277FF]/12 text-[#191970] ring-[#2277FF]/25 dark:bg-[#2277FF]/15 dark:text-[#2277FF]",
  remote: "bg-[#191970]/10 text-[#191970] ring-[#191970]/20 dark:bg-[#191970]/25 dark:text-[#2277FF]",
  late: "bg-[#2277FF]/18 text-[#191970] ring-[#2277FF]/30 dark:bg-[#2277FF]/20 dark:text-[#2277FF]",
  half_day: "bg-[#191970]/14 text-[#191970] ring-[#191970]/25 dark:bg-[#191970]/30 dark:text-[#2277FF]",
  on_leave: "bg-[#2277FF]/8 text-[#191970] ring-[#2277FF]/20 dark:bg-[#2277FF]/12 dark:text-[#2277FF]",
  absent: "bg-[#191970]/8 text-[#191970]/80 ring-[#191970]/15 dark:bg-[#191970]/20 dark:text-[#2277FF]/80",
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
