import type { HrmDepartment } from "@/types/hrm";

export const DEMO_COMPANY_DEPARTMENTS: HrmDepartment[] = [
  {
    id: "dept_revenue",
    name: "Revenue",
    headId: "emp_001",
    memberCount: 12,
    teams: [
      { id: "team_apac", name: "APAC Enterprise", memberCount: 5, leaderId: "emp_001" },
      { id: "team_emea", name: "EMEA Growth", memberCount: 4, leaderId: "emp_002" },
    ],
  },
  {
    id: "dept_ops",
    name: "Operations",
    headId: "emp_003",
    memberCount: 8,
    teams: [
      { id: "team_fulfillment", name: "Fulfillment", memberCount: 3, leaderId: "emp_003" },
      { id: "team_support", name: "Customer support", memberCount: 5, leaderId: "emp_004" },
    ],
  },
  {
    id: "dept_people",
    name: "People",
    headId: "emp_005",
    memberCount: 6,
    teams: [{ id: "team_hr_ops", name: "HR operations", memberCount: 6, leaderId: "emp_005" }],
  },
];
