import { workspacePaths } from "@/lib/workspace/paths";

export const ATTENDANCE_TAB_IDS = [
  "all",
  "on-break",
  "not-clocked-in",
  "regularization",
  "roster",
  "me",
] as const;

export type AttendanceTabId = (typeof ATTENDANCE_TAB_IDS)[number];

export const ATTENDANCE_TABS: { id: AttendanceTabId; label: string }[] = [
  { id: "all", label: "All employees" },
  { id: "on-break", label: "On break" },
  { id: "not-clocked-in", label: "Not clocked in" },
  { id: "regularization", label: "Regularization" },
  { id: "roster", label: "Roster" },
  { id: "me", label: "My attendance" },
];

const TAB_PATHS: Record<AttendanceTabId, string> = {
  all: workspacePaths.hrmAttendanceAll,
  "on-break": workspacePaths.hrmAttendanceOnBreak,
  "not-clocked-in": workspacePaths.hrmAttendanceNotClockedIn,
  regularization: workspacePaths.hrmAttendanceRegularization,
  roster: workspacePaths.hrmAttendanceRoster,
  me: workspacePaths.hrmAttendanceMe,
};

const PATH_TO_TAB = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, href]) => [href, tab]),
) as Record<string, AttendanceTabId>;

export function parseAttendanceTab(value: string | null | undefined): AttendanceTabId {
  if (value && ATTENDANCE_TAB_IDS.includes(value as AttendanceTabId)) {
    return value as AttendanceTabId;
  }
  return "all";
}

export function attendanceTabPath(tab: AttendanceTabId): string {
  return TAB_PATHS[tab];
}

/** @deprecated Use attendanceTabPath */
export function attendanceTabHref(tab: AttendanceTabId): string {
  return attendanceTabPath(tab);
}

export function attendanceTabFromPathname(pathname: string): AttendanceTabId | null {
  return PATH_TO_TAB[pathname] ?? null;
}

export function isAttendanceDashboardPath(pathname: string): boolean {
  return pathname === workspacePaths.hrmAttendance;
}

export function isAttendanceNavChildActive(pathname: string, href: string): boolean {
  if (href === workspacePaths.hrmAttendance) {
    return pathname === workspacePaths.hrmAttendance;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
