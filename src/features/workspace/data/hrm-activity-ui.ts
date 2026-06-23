export type HrmActivitySeverity = "info" | "success" | "warning" | "critical";

export type HrmActivityEvent = {
  id: string;
  action: string;
  module: string;
  actor: string;
  actorRole?: string;
  occurredAt: string;
  occurredAtSort: number;
  detail?: string;
  severity: HrmActivitySeverity;
  ipAddress?: string;
};

export const HRM_ACTIVITY_MODULES = [
  "All",
  "Employees",
  "Attendance",
  "Leave",
  "Payroll",
  "Documents",
  "Policies",
  "Recruitment",
  "Settings",
  "Performance",
] as const;

export type HrmActivityModuleFilter = (typeof HRM_ACTIVITY_MODULES)[number];

export const DEMO_HRM_ACTIVITY_EVENTS: HrmActivityEvent[] = [
  {
    id: "ev-01",
    action: "Employee profile updated",
    module: "Employees",
    actor: "Priya Mehta",
    actorRole: "HR Admin",
    occurredAt: "12 min ago",
    occurredAtSort: 12,
    detail: "Designation · Senior HR Manager · EMP-001",
    severity: "info",
    ipAddress: "103.21.44.8",
  },
  {
    id: "ev-02",
    action: "Leave request approved",
    module: "Leave",
    actor: "Anita Rao",
    actorRole: "Manager",
    occurredAt: "45 min ago",
    occurredAtSort: 45,
    detail: "Annual leave · 3 days · Amit Shah",
    severity: "success",
  },
  {
    id: "ev-03",
    action: "Document verification rejected",
    module: "Documents",
    actor: "Neha Desai",
    actorRole: "HR Ops",
    occurredAt: "1 hour ago",
    occurredAtSort: 60,
    detail: "Passport copy · blurry upload · EMP-008",
    severity: "warning",
  },
  {
    id: "ev-04",
    action: "Payroll run finalized",
    module: "Payroll",
    actor: "Meera Joshi",
    actorRole: "Payroll",
    occurredAt: "3 hours ago",
    occurredAtSort: 180,
    detail: "May 2026 · 142 employees · ₹48.2L net",
    severity: "success",
  },
  {
    id: "ev-05",
    action: "Role permissions updated",
    module: "Settings",
    actor: "Super Admin",
    actorRole: "Admin",
    occurredAt: "5 hours ago",
    occurredAtSort: 300,
    detail: "Payroll Specialist · +2 permissions · Attendance export",
    severity: "info",
  },
  {
    id: "ev-06",
    action: "Attendance regularization approved",
    module: "Attendance",
    actor: "Rahul Verma",
    actorRole: "HR Manager",
    occurredAt: "Yesterday",
    occurredAtSort: 1440,
    detail: "Jun 18 · Late check-in · EMP-014",
    severity: "success",
  },
  {
    id: "ev-07",
    action: "Policy acknowledgment overdue",
    module: "Policies",
    actor: "System",
    actorRole: "Automated",
    occurredAt: "Yesterday",
    occurredAtSort: 1500,
    detail: "POSH policy · 12 employees pending",
    severity: "warning",
  },
  {
    id: "ev-08",
    action: "New hire onboarded",
    module: "Employees",
    actor: "Kavya Nair",
    actorRole: "Recruiter",
    occurredAt: "Yesterday",
    occurredAtSort: 1560,
    detail: "EMP-047 · Alex Morgan · Engineering",
    severity: "success",
  },
  {
    id: "ev-09",
    action: "Failed login attempt blocked",
    module: "Settings",
    actor: "System",
    actorRole: "Security",
    occurredAt: "2 days ago",
    occurredAtSort: 2880,
    detail: "3 attempts · IP flagged · contractor portal",
    severity: "critical",
  },
  {
    id: "ev-10",
    action: "Performance cycle opened",
    module: "Performance",
    actor: "Priya Mehta",
    actorRole: "HR Admin",
    occurredAt: "2 days ago",
    occurredAtSort: 3000,
    detail: "H1 2026 · All departments · self-review enabled",
    severity: "info",
  },
  {
    id: "ev-11",
    action: "Candidate moved to offer",
    module: "Recruitment",
    actor: "Dev Patel",
    actorRole: "Recruiter",
    occurredAt: "3 days ago",
    occurredAtSort: 4320,
    detail: "Product Designer · Priya Sharma",
    severity: "info",
  },
  {
    id: "ev-12",
    action: "Bulk import completed",
    module: "Employees",
    actor: "Arjun Kapoor",
    actorRole: "HR Ops",
    occurredAt: "4 days ago",
    occurredAtSort: 5760,
    detail: "28 records · 2 warnings · CSV import",
    severity: "success",
  },
];

export function getHrmActivityStats(events: HrmActivityEvent[]) {
  const today = events.filter((e) => e.occurredAtSort < 1440).length;
  const warnings = events.filter((e) => e.severity === "warning" || e.severity === "critical").length;
  const modules = new Set(events.map((e) => e.module)).size;
  return { total: events.length, today, warnings, modules };
}

export function groupActivityByDay(events: HrmActivityEvent[]) {
  const groups: { label: string; events: HrmActivityEvent[] }[] = [];
  const buckets = [
    { label: "Today", maxSort: 1440 },
    { label: "Yesterday", maxSort: 2880 },
    { label: "Earlier this week", maxSort: 10080 },
    { label: "Older", maxSort: Infinity },
  ];

  for (const bucket of buckets) {
    const prevMax = buckets[buckets.indexOf(bucket) - 1]?.maxSort ?? 0;
    const items = events.filter(
      (e) => e.occurredAtSort > prevMax && e.occurredAtSort <= bucket.maxSort,
    );
    if (items.length > 0) groups.push({ label: bucket.label, events: items });
  }
  return groups;
}
