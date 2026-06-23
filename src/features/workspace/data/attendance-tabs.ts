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

export function parseAttendanceTab(value: string | null | undefined): AttendanceTabId {
  if (value && ATTENDANCE_TAB_IDS.includes(value as AttendanceTabId)) {
    return value as AttendanceTabId;
  }
  return "all";
}

export function attendanceTabPath(tab: AttendanceTabId): string {
  if (tab === "all") return workspacePaths.hrmAttendance;
  return `${workspacePaths.hrmAttendance}?tab=${tab}`;
}
