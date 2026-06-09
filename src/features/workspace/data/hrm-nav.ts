import { workspacePaths } from "@/lib/workspace/paths";

export const HRM_NAV_ITEMS = [
  { name: "Org chart", href: workspacePaths.hrmOrgChart },
  { name: "Employee", href: workspacePaths.hrmEmployees },
  { name: "Payroll", href: workspacePaths.hrmPayroll },
  { name: "Attendance", href: workspacePaths.hrmAttendance },
  { name: "Manage leave", href: workspacePaths.hrmLeave },
  { name: "HR roles", href: workspacePaths.hrmAdmin },
  { name: "Event", href: workspacePaths.hrmEvents },
  { name: "Document", href: workspacePaths.hrmDocuments },
  { name: "Company policy", href: workspacePaths.hrmPolicies },
  { name: "System setup", href: workspacePaths.hrmSetup },
  { name: "Report", href: workspacePaths.hrmReports },
] as const;
