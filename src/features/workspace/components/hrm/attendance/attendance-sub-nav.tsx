"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

const ATTENDANCE_TABS = [
  { label: "Dashboard", href: workspacePaths.hrmAttendance },
  { label: "All employees", href: workspacePaths.hrmAttendanceAll },
  { label: "On break", href: workspacePaths.hrmAttendanceOnBreak },
  { label: "Not clocked in", href: workspacePaths.hrmAttendanceNotClockedIn },
  { label: "Regularization", href: workspacePaths.hrmAttendanceRegularization },
  { label: "Roster", href: workspacePaths.hrmAttendanceRoster },
  { label: "My attendance", href: workspacePaths.hrmAttendanceMe },
];

export function AttendanceSubNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-5 flex flex-wrap gap-1 rounded-xl border border-slate-200/80 bg-slate-50/60 p-1 dark:border-slate-800 dark:bg-slate-950/40">
      {ATTENDANCE_TABS.map((tab) => {
        const isDashboard = tab.href === workspacePaths.hrmAttendance;
        const dashboardActive = pathname === workspacePaths.hrmAttendance;
        const isActive = isDashboard
          ? dashboardActive
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-semibold transition",
              isActive
                ? "bg-[#191970] text-white shadow-sm"
                : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
