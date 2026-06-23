import { workspacePaths } from "@/lib/workspace/paths";

export type HrmNavLink = { type: "link"; name: string; href: string };

export type HrmNavSubGroup = {
  type: "group";
  name: string;
  children: { name: string; href: string }[];
};

export type HrmNavChild = HrmNavLink | HrmNavSubGroup;

export function isHrmNavSubGroup(item: HrmNavChild): item is HrmNavSubGroup {
  return item.type === "group";
}

/** Full HRM sidebar — inspired by enterprise HRMS, extended for Rivexaflow. */
export const HRM_NAV_CHILDREN: HrmNavChild[] = [
  { type: "link", name: "HRM Dashboard", href: workspacePaths.hrmDashboard },
  { type: "link", name: "Employees", href: workspacePaths.hrmEmployees },
  { type: "link", name: "Organogram", href: workspacePaths.hrmOrgChart },
  { type: "link", name: "Departments", href: workspacePaths.hrmDepartments },
  { type: "link", name: "Recruitment", href: workspacePaths.hrmRecruitment },
  { type: "link", name: "Attendance", href: workspacePaths.hrmAttendance },
  { type: "link", name: "Leave management", href: workspacePaths.hrmLeave },
  { type: "link", name: "Grievances", href: workspacePaths.hrmGrievances },
  { type: "link", name: "Payroll", href: workspacePaths.hrmPayroll },
  { type: "link", name: "Performance", href: workspacePaths.hrmPerformance },
  { type: "link", name: "Asset management", href: workspacePaths.hrmAssets },
  { type: "link", name: "Documents", href: workspacePaths.hrmDocuments },
  { type: "link", name: "Reports & analytics", href: workspacePaths.hrmReports },
  { type: "link", name: "Company policies", href: workspacePaths.hrmPolicies },
  {
    type: "group",
    name: "HR Settings",
    children: [
      { name: "Roles & permissions", href: workspacePaths.hrmAdmin },
      { name: "System setup", href: workspacePaths.hrmSetup },
    ],
  },
  { type: "link", name: "Activity", href: workspacePaths.hrmActivity },
];

export const HRM_NAV_FLAT_LINKS = HRM_NAV_CHILDREN.flatMap((item) =>
  isHrmNavSubGroup(item)
    ? item.children.map((c) => ({ name: `${item.name} · ${c.name}`, href: c.href }))
    : [{ name: item.name, href: item.href }],
);

/** @deprecated Use HRM_NAV_CHILDREN — kept for any legacy imports */
export const HRM_NAV_ITEMS = HRM_NAV_FLAT_LINKS;
