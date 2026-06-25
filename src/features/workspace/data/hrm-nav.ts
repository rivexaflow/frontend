import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  Clock,
  Coffee,
  FileText,
  GitBranch,
  LayoutDashboard,
  List,
  MessageSquareWarning,
  Package,
  PenLine,
  ScrollText,
  Settings2,
  ShieldCheck,
  TrendingUp,
  User,
  UserPlus,
  UserX,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import { workspacePaths } from "@/lib/workspace/paths";

export type HrmNavLink = { type: "link"; name: string; href: string; icon: LucideIcon };

export type HrmNavSubGroup = {
  type: "group";
  name: string;
  icon: LucideIcon;
  children: { name: string; href: string; icon: LucideIcon }[];
};

export type HrmNavChild = HrmNavLink | HrmNavSubGroup;

export function isHrmNavSubGroup(item: HrmNavChild): item is HrmNavSubGroup {
  return item.type === "group";
}

/** Full HRM sidebar — inspired by enterprise HRMS, extended for Rivexaflow. */
export const HRM_NAV_CHILDREN: HrmNavChild[] = [
  { type: "link", name: "HRM Dashboard", href: workspacePaths.hrmDashboard, icon: LayoutDashboard },
  { type: "link", name: "Employees", href: workspacePaths.hrmEmployees, icon: Users },
  { type: "link", name: "Organogram", href: workspacePaths.hrmOrgChart, icon: GitBranch },
  { type: "link", name: "Departments", href: workspacePaths.hrmDepartments, icon: Building2 },
  { type: "link", name: "Recruitment", href: workspacePaths.hrmRecruitment, icon: UserPlus },
  {
    type: "group",
    name: "Attendance",
    icon: Clock,
    children: [
      { name: "Dashboard", href: workspacePaths.hrmAttendance, icon: LayoutDashboard },
      { name: "All employees", href: workspacePaths.hrmAttendanceAll, icon: List },
      { name: "On break", href: workspacePaths.hrmAttendanceOnBreak, icon: Coffee },
      { name: "Not clocked in", href: workspacePaths.hrmAttendanceNotClockedIn, icon: UserX },
      { name: "Regularization", href: workspacePaths.hrmAttendanceRegularization, icon: PenLine },
      { name: "Roster", href: workspacePaths.hrmAttendanceRoster, icon: CalendarDays },
      { name: "My attendance", href: workspacePaths.hrmAttendanceMe, icon: User },
    ],
  },
  { type: "link", name: "Leave management", href: workspacePaths.hrmLeave, icon: CalendarDays },
  { type: "link", name: "Grievances", href: workspacePaths.hrmGrievances, icon: MessageSquareWarning },
  { type: "link", name: "Payroll", href: workspacePaths.hrmPayroll, icon: Wallet },
  { type: "link", name: "Performance", href: workspacePaths.hrmPerformance, icon: TrendingUp },
  { type: "link", name: "Asset management", href: workspacePaths.hrmAssets, icon: Package },
  { type: "link", name: "Documents", href: workspacePaths.hrmDocuments, icon: FileText },
  { type: "link", name: "Reports & analytics", href: workspacePaths.hrmReports, icon: BarChart3 },
  { type: "link", name: "Company policies", href: workspacePaths.hrmPolicies, icon: ScrollText },
  {
    type: "group",
    name: "HR Settings",
    icon: Settings2,
    children: [
      { name: "Roles & permissions", href: workspacePaths.hrmAdmin, icon: ShieldCheck },
      { name: "System setup", href: workspacePaths.hrmSetup, icon: Wrench },
    ],
  },
  { type: "link", name: "Activity", href: workspacePaths.hrmActivity, icon: Activity },
];

export const HRM_NAV_FLAT_LINKS = HRM_NAV_CHILDREN.flatMap((item) =>
  isHrmNavSubGroup(item)
    ? item.children.map((c) => ({ name: `${item.name} · ${c.name}`, href: c.href }))
    : [{ name: item.name, href: item.href }],
);

/** @deprecated Use HRM_NAV_CHILDREN — kept for any legacy imports */
export const HRM_NAV_ITEMS = HRM_NAV_FLAT_LINKS;
