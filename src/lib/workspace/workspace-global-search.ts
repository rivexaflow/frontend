import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Building2,
  CalendarDays,
  Clock,
  FileText,
  Layers,
  LayoutDashboard,
  ListTodo,
  MessageSquareWarning,
  Package,
  Phone,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Target,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import { CRM_NAV_CHILDREN, isCrmNavSubGroup } from "@/features/workspace/data/crm-nav";
import { DEMO_CONTACTS, DEMO_LEADS } from "@/features/workspace/data/crm-demo";
import { DEMO_DIALER_QUEUE } from "@/features/workspace/data/crm-dialer-demo";
import { DEMO_CRM_TASKS } from "@/features/workspace/data/crm-extended-demo";
import { DEMO_DEALS } from "@/features/workspace/data/deals-demo";
import { DEMO_HRM_ATTENDANCE } from "@/features/workspace/data/hrm-attendance-demo";
import {
  DEMO_BREAK_SESSIONS,
  DEMO_REGULARIZATION_REQUESTS,
} from "@/features/workspace/data/hrm-attendance-extended-demo";
import { DEMO_HRM_LEAVE } from "@/features/workspace/data/hrm-leave-demo";
import { HRM_NAV_CHILDREN, isHrmNavSubGroup } from "@/features/workspace/data/hrm-nav";
import { DEMO_HRM_EMPLOYEE_DIRECTORY } from "@/features/workspace/data/hrm-employees-demo";
import { DEMO_HRM_PAYROLL } from "@/features/workspace/data/hrm-payroll-demo";
import {
  DEMO_HRM_ACTIVITY,
  DEMO_HRM_ASSETS,
  DEMO_HRM_GRIEVANCES,
  DEMO_HRM_JOBS,
  DEMO_HRM_LOANS,
} from "@/features/workspace/data/hrm-modules-demo";
import { DEMO_HRM_POLICIES } from "@/features/workspace/data/hrm-policies-demo";
import { DEMO_PERFORMANCE_EMPLOYEES } from "@/features/workspace/data/hrm-performance-demo";
import { DEMO_HRM_ROLES } from "@/features/workspace/data/hrm-roles-demo";
import { DEMO_KYC_CASES } from "@/features/workspace/data/kyc-demo";
import { DEMO_AGENTS, DEMO_INVOICES, DEMO_REPORTS } from "@/features/workspace/data/module-records-demo";
import { DEMO_WORKSPACE_ACTIVITY } from "@/features/workspace/data/workspace-activity-demo";
import { DEMO_COMPANY_DEPARTMENTS } from "@/features/workspace/data/workforce-departments-demo";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { fetchCrmLeads } from "@/lib/api/crm";
import { fetchHrEmployees } from "@/lib/api/hrm";
import { hrmEmployeeProfilePath } from "@/lib/workspace/hrm-paths";
import { workspacePaths } from "@/lib/workspace/paths";

export type WorkspaceSearchResult = {
  id: string;
  category: string;
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  keywords?: string[];
  score: number;
};

const MAX_PER_CATEGORY = 8;
const MAX_TOTAL = 60;

const CATEGORY_ORDER = [
  "Employees",
  "Leads",
  "Deals",
  "Contacts",
  "Tasks",
  "Workspace users",
  "KYC",
  "Attendance",
  "Leave",
  "Payroll",
  "Departments",
  "Assets",
  "Policies",
  "Recruitment",
  "Performance",
  "Grievances",
  "Loans",
  "Dialer",
  "Invoices",
  "AI agents",
  "Activity",
  "HR roles",
  "Reports",
  "Pages",
];

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function scoreWorkspaceMatch(label: string, haystack: string, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;

  const terms = q.split(/\s+/).filter(Boolean);
  const lab = label.toLowerCase();
  const hay = haystack.toLowerCase();

  if (terms.length === 1) {
    const term = terms[0]!;
    if (lab === term) return 100;
    if (lab.startsWith(term)) return 85;
    if (lab.split(/\s+/).some((w) => w.startsWith(term))) return 75;
    if (lab.includes(term)) return 65;
    if (hay.includes(term)) return 45;
    return 0;
  }

  if (terms.every((term) => hay.includes(term))) {
    if (terms.every((term) => lab.includes(term))) return 70;
    return 50;
  }

  return 0;
}

export function matchesWorkspaceQuery(haystack: string, query: string): boolean {
  return scoreWorkspaceMatch("", haystack, query) > 0;
}

function listUrl(path: string, query?: string): string {
  if (!query?.trim()) return path;
  return `${path}?q=${encodeURIComponent(query.trim())}`;
}

function buildPageResults(): WorkspaceSearchResult[] {
  const items: WorkspaceSearchResult[] = [];
  const seen = new Set<string>();

  const add = (result: WorkspaceSearchResult) => {
    if (seen.has(result.href)) return;
    seen.add(result.href);
    items.push(result);
  };

  const addNav = (label: string, href: string, icon: LucideIcon, hint: string, keywords: string[] = []) => {
    add({
      id: `page:${href}`,
      category: "Pages",
      label,
      hint,
      href,
      icon,
      keywords: [...keywords, ...tokenize(label), ...tokenize(hint)],
      score: 1,
    });
  };

  addNav("Dashboard", workspacePaths.dashboard, LayoutDashboard, "General", ["home"]);
  addNav("Workspace graph", workspacePaths.workspaceGraph, LayoutDashboard, "General", ["org"]);
  addNav("Data Merge", workspacePaths.migration, LayoutDashboard, "Operations", ["import"]);

  for (const item of CRM_NAV_CHILDREN) {
    if (isCrmNavSubGroup(item)) {
      for (const child of item.children) {
        addNav(`${item.name} · ${child.name}`, child.href, child.icon, "CRM");
      }
    } else {
      addNav(item.name, item.href, item.icon, "CRM");
    }
  }
  addNav("Pipelines", workspacePaths.pipelines, Layers, "CRM");
  addNav("Contacts", workspacePaths.contacts, Users, "CRM");

  for (const item of HRM_NAV_CHILDREN) {
    if (isHrmNavSubGroup(item)) {
      for (const child of item.children) {
        addNav(`${item.name} · ${child.name}`, child.href, child.icon, "HRM");
      }
    } else {
      addNav(item.name, item.href, item.icon, "HRM");
    }
  }

  addNav("Users", workspacePaths.user, Users, "User management");
  addNav("Roles & permissions", workspacePaths.role, ShieldCheck, "User management");
  addNav("HRM roles", workspacePaths.hrmAdmin, ShieldCheck, "HRM settings");
  addNav("KYC Center", workspacePaths.kyc, ShieldCheck, "Operations");
  addNav("Invoices", workspacePaths.invoices, FileText, "Operations");
  addNav("AI Agents", workspacePaths.ai, Sparkles, "Intelligence");
  addNav("Analytics", workspacePaths.reports, Zap, "Intelligence");
  addNav("Notifications", workspacePaths.notifications, Activity, "System");
  addNav("Settings", workspacePaths.settings, LayoutDashboard, "System");

  return items;
}

const PAGE_RESULTS = buildPageResults();

function pushResult(
  results: WorkspaceSearchResult[],
  query: string,
  item: Omit<WorkspaceSearchResult, "score"> & { haystack: string },
) {
  const score = scoreWorkspaceMatch(item.label, item.haystack, query);
  if (score <= 0) return;
  results.push({ ...item, score });
}

function capAndSort(results: WorkspaceSearchResult[]): WorkspaceSearchResult[] {
  const byCategory = new Map<string, WorkspaceSearchResult[]>();
  for (const result of results) {
    const list = byCategory.get(result.category) ?? [];
    if (list.length < MAX_PER_CATEGORY) list.push(result);
    byCategory.set(result.category, list);
  }

  const ordered: WorkspaceSearchResult[] = [];
  for (const category of CATEGORY_ORDER) {
    const items = byCategory.get(category);
    if (!items?.length) continue;
    items.sort((a, b) => b.score - a.score);
    ordered.push(...items);
  }

  for (const [category, items] of byCategory) {
    if (CATEGORY_ORDER.includes(category)) continue;
    items.sort((a, b) => b.score - a.score);
    ordered.push(...items);
  }

  return ordered.slice(0, MAX_TOTAL);
}

function searchLocalRecords(query: string): WorkspaceSearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const results: WorkspaceSearchResult[] = [];

  for (const employee of DEMO_HRM_EMPLOYEE_DIRECTORY) {
    const hay = `${employee.name} ${employee.email} ${employee.employeeCode} ${employee.department} ${employee.designation} ${employee.phone ?? ""} ${employee.location ?? ""}`;
    pushResult(results, q, {
      id: `employee:${employee.id}`,
      category: "Employees",
      label: employee.name,
      hint: `${employee.designation} · ${employee.department}`,
      href: hrmEmployeeProfilePath(employee.id),
      icon: Users,
      haystack: hay,
    });
  }

  for (const perf of DEMO_PERFORMANCE_EMPLOYEES) {
    const hay = `${perf.name} ${perf.designation} ${perf.departmentName} ${perf.teamName}`;
    pushResult(results, q, {
      id: `perf:${perf.id}`,
      category: "Performance",
      label: perf.name,
      hint: `${perf.designation} · Score ${perf.score}`,
      href: listUrl(workspacePaths.hrmPerformance, perf.name),
      icon: Target,
      haystack: hay,
    });
  }

  for (const lead of DEMO_LEADS) {
    const hay = `${lead.name} ${lead.company} ${lead.email} ${lead.reference} ${lead.phone ?? ""} ${lead.owner} ${lead.source}`;
    pushResult(results, q, {
      id: `lead:${lead.id}`,
      category: "Leads",
      label: lead.name,
      hint: `${lead.company} · ${lead.reference}`,
      href: listUrl(workspacePaths.leads, lead.name),
      icon: Target,
      haystack: hay,
    });
  }

  for (const deal of DEMO_DEALS) {
    const hay = `${deal.title} ${deal.company} ${deal.reference} ${deal.contact} ${deal.owner}`;
    pushResult(results, q, {
      id: `deal:${deal.id}`,
      category: "Deals",
      label: deal.title,
      hint: `${deal.company} · ${deal.reference}`,
      href: listUrl(workspacePaths.deals, deal.title),
      icon: Layers,
      haystack: hay,
    });
  }

  for (const contact of DEMO_CONTACTS) {
    const hay = `${contact.name} ${contact.company} ${contact.email} ${contact.role} ${contact.owner}`;
    pushResult(results, q, {
      id: `contact:${contact.id}`,
      category: "Contacts",
      label: contact.name,
      hint: `${contact.company} · ${contact.role}`,
      href: listUrl(workspacePaths.contacts, contact.name),
      icon: Users,
      haystack: hay,
    });
  }

  for (const task of DEMO_CRM_TASKS) {
    const hay = `${task.name} ${task.leadName} ${task.leadRef} ${task.assignedTo} ${task.status}`;
    pushResult(results, q, {
      id: `task:${task.id}`,
      category: "Tasks",
      label: task.name,
      hint: `${task.leadName} · ${task.assignedTo}`,
      href: listUrl(workspacePaths.crmTasks, task.name),
      icon: ListTodo,
      haystack: hay,
    });
  }

  for (const user of DEMO_WORKSPACE_USERS) {
    const hay = `${user.name} ${user.email} ${user.department} ${user.profileRole} ${user.team ?? ""}`;
    pushResult(results, q, {
      id: `user:${user.id}`,
      category: "Workspace users",
      label: user.name,
      hint: `${user.profileRole} · ${user.email}`,
      href: listUrl(workspacePaths.user, user.name),
      icon: Users,
      haystack: hay,
    });
  }

  for (const kyc of DEMO_KYC_CASES) {
    const hay = `${kyc.applicant} ${kyc.company} ${kyc.reference} ${kyc.email} ${kyc.owner}`;
    pushResult(results, q, {
      id: `kyc:${kyc.id}`,
      category: "KYC",
      label: kyc.applicant,
      hint: `${kyc.company} · ${kyc.reference}`,
      href: listUrl(workspacePaths.kyc, kyc.applicant),
      icon: ShieldCheck,
      haystack: hay,
    });
  }

  for (const row of DEMO_HRM_ATTENDANCE) {
    const hay = `${row.employeeName} ${row.employeeCode} ${row.department} ${row.status} ${row.date}`;
    pushResult(results, q, {
      id: `att:${row.id}`,
      category: "Attendance",
      label: row.employeeName,
      hint: `${row.date} · ${row.status.replace("_", " ")}`,
      href: listUrl(workspacePaths.hrmAttendanceAll, row.employeeName),
      icon: Clock,
      haystack: hay,
    });
  }

  for (const brk of DEMO_BREAK_SESSIONS) {
    const hay = `${brk.employeeName} ${brk.department} ${brk.breakType} on break`;
    pushResult(results, q, {
      id: `break:${brk.id}`,
      category: "Attendance",
      label: brk.employeeName,
      hint: `On ${brk.breakType.toLowerCase()} break`,
      href: workspacePaths.hrmAttendanceOnBreak,
      icon: Clock,
      haystack: hay,
    });
  }

  for (const req of DEMO_REGULARIZATION_REQUESTS) {
    const hay = `${req.employeeName} ${req.department} ${req.reason} regularization`;
    pushResult(results, q, {
      id: `reg:${req.id}`,
      category: "Attendance",
      label: req.employeeName,
      hint: `Regularization · ${req.date}`,
      href: listUrl(workspacePaths.hrmAttendanceRegularization, req.employeeName),
      icon: Clock,
      haystack: hay,
    });
  }

  for (const leave of DEMO_HRM_LEAVE) {
    const hay = `${leave.employeeName} ${leave.employeeCode} ${leave.department} ${leave.leaveType} ${leave.requestId}`;
    pushResult(results, q, {
      id: `leave:${leave.id}`,
      category: "Leave",
      label: leave.employeeName,
      hint: `${leave.leaveType} · ${leave.from} – ${leave.to}`,
      href: listUrl(workspacePaths.hrmLeave, leave.employeeName),
      icon: CalendarDays,
      haystack: hay,
    });
  }

  for (const payroll of DEMO_HRM_PAYROLL) {
    const hay = `${payroll.employeeName} ${payroll.employeeCode} ${payroll.department} payroll ${payroll.netPay}`;
    pushResult(results, q, {
      id: `pay:${payroll.id}`,
      category: "Payroll",
      label: payroll.employeeName,
      hint: `${payroll.period} · ₹${payroll.netPay.toLocaleString("en-IN")}`,
      href: listUrl(workspacePaths.hrmPayroll, payroll.employeeName),
      icon: Wallet,
      haystack: hay,
    });
  }

  for (const dept of DEMO_COMPANY_DEPARTMENTS) {
    const hay = `${dept.name} department`;
    pushResult(results, q, {
      id: `dept:${dept.id}`,
      category: "Departments",
      label: dept.name,
      hint: `${dept.memberCount} members`,
      href: listUrl(workspacePaths.hrmDepartments, dept.name),
      icon: Building2,
      haystack: hay,
    });
    for (const team of dept.teams) {
      const teamHay = `${team.name} ${dept.name} team`;
      pushResult(results, q, {
        id: `team:${team.id}`,
        category: "Departments",
        label: team.name,
        hint: `${dept.name} · ${team.memberCount} members`,
        href: listUrl(workspacePaths.workforce, team.name),
        icon: Building2,
        haystack: teamHay,
      });
    }
  }

  for (const role of DEMO_HRM_ROLES) {
    const hay = `${role.name} ${role.description ?? ""} role permissions`;
    pushResult(results, q, {
      id: `hrm-role:${role.id}`,
      category: "HR roles",
      label: role.name,
      hint: role.description ?? "HRM role",
      href: workspacePaths.hrmAdmin,
      icon: ShieldCheck,
      haystack: hay,
    });
  }

  for (const policy of DEMO_HRM_POLICIES) {
    const hay = `${policy.title} ${policy.summary} ${policy.owner} ${policy.tags?.join(" ") ?? ""}`;
    pushResult(results, q, {
      id: `policy:${policy.id}`,
      category: "Policies",
      label: policy.title,
      hint: policy.owner,
      href: listUrl(workspacePaths.hrmPolicies, policy.title),
      icon: ScrollText,
      haystack: hay,
    });
  }

  for (const asset of DEMO_HRM_ASSETS) {
    const hay = `${asset.name} ${asset.tag} ${asset.serial} ${asset.custodian} ${asset.category} ${asset.department}`;
    pushResult(results, q, {
      id: `asset:${asset.id}`,
      category: "Assets",
      label: asset.name,
      hint: `${asset.tag} · ${asset.custodian}`,
      href: listUrl(workspacePaths.hrmAssets, asset.name),
      icon: Package,
      haystack: hay,
    });
  }

  for (const job of DEMO_HRM_JOBS) {
    const hay = `${job.title} ${job.department} job opening recruitment`;
    pushResult(results, q, {
      id: `job:${job.id}`,
      category: "Recruitment",
      label: job.title,
      hint: `${job.department} · ${job.openings} openings`,
      href: listUrl(workspacePaths.hrmRecruitment, job.title),
      icon: UserPlus,
      haystack: hay,
    });
  }

  for (const ticket of DEMO_HRM_GRIEVANCES) {
    const hay = `${ticket.subject} ${ticket.employee} ${ticket.department} grievance`;
    pushResult(results, q, {
      id: `grievance:${ticket.id}`,
      category: "Grievances",
      label: ticket.subject,
      hint: `${ticket.employee} · ${ticket.department}`,
      href: listUrl(workspacePaths.hrmGrievances, ticket.subject),
      icon: MessageSquareWarning,
      haystack: hay,
    });
  }

  for (const loan of DEMO_HRM_LOANS) {
    const hay = `${loan.employee} ${loan.type} ${loan.status} loan`;
    pushResult(results, q, {
      id: `loan:${loan.id}`,
      category: "Loans",
      label: loan.employee,
      hint: `${loan.type} · ${loan.status}`,
      href: listUrl(workspacePaths.hrmLoans, loan.employee),
      icon: Wallet,
      haystack: hay,
    });
  }

  for (const dial of DEMO_DIALER_QUEUE) {
    const hay = `${dial.name} ${dial.company} ${dial.phone} ${dial.queueStatus} dialer`;
    pushResult(results, q, {
      id: `dial:${dial.id}`,
      category: "Dialer",
      label: dial.name,
      hint: `${dial.company} · ${dial.phone}`,
      href: workspacePaths.crmDialer,
      icon: Phone,
      haystack: hay,
    });
  }

  for (const invoice of DEMO_INVOICES) {
    const hay = `${invoice.number} ${invoice.client} ${invoice.status} invoice`;
    pushResult(results, q, {
      id: `invoice:${invoice.id}`,
      category: "Invoices",
      label: invoice.number,
      hint: `${invoice.client} · ${invoice.amount}`,
      href: listUrl(workspacePaths.invoices, invoice.client),
      icon: FileText,
      haystack: hay,
    });
  }

  for (const agent of DEMO_AGENTS) {
    const hay = `${agent.name} ${agent.module} ai agent`;
    pushResult(results, q, {
      id: `agent:${agent.id}`,
      category: "AI agents",
      label: agent.name,
      hint: `${agent.module} · ${agent.status}`,
      href: listUrl(workspacePaths.ai, agent.name),
      icon: Sparkles,
      haystack: hay,
    });
  }

  for (const log of DEMO_HRM_ACTIVITY) {
    const hay = `${log.action} ${log.module} ${log.actor} ${log.detail ?? ""}`;
    pushResult(results, q, {
      id: `hrm-act:${log.id}`,
      category: "Activity",
      label: log.action,
      hint: `${log.module} · ${log.actor}`,
      href: workspacePaths.hrmActivity,
      icon: Activity,
      haystack: hay,
    });
  }

  for (const act of DEMO_WORKSPACE_ACTIVITY) {
    const hay = `${act.userName} ${act.action} ${act.module} ${act.summary}`;
    pushResult(results, q, {
      id: `ws-act:${act.id}`,
      category: "Activity",
      label: act.action,
      hint: `${act.userName} · ${act.module}`,
      href: workspacePaths.userActivity,
      icon: Activity,
      haystack: hay,
    });
  }

  for (const report of DEMO_REPORTS) {
    const hay = `${report.name} ${report.category} report`;
    pushResult(results, q, {
      id: `report:${report.id}`,
      category: "Reports",
      label: report.name,
      hint: report.category,
      href: listUrl(workspacePaths.hrmReports, report.name),
      icon: CalendarDays,
      haystack: hay,
    });
  }

  return capAndSort(results);
}

function searchPages(query: string): WorkspaceSearchResult[] {
  const q = query.trim();
  if (!q) return PAGE_RESULTS.slice(0, 12).map((p) => ({ ...p, score: 1 }));

  return PAGE_RESULTS.map((page) => {
    const hay = [page.label, page.hint, ...(page.keywords ?? [])].join(" ");
    const score = scoreWorkspaceMatch(page.label, hay, q);
    return { ...page, score };
  })
    .filter((page) => page.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function mergeResults(...groups: WorkspaceSearchResult[][]): WorkspaceSearchResult[] {
  const seen = new Set<string>();
  const merged: WorkspaceSearchResult[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }
  }
  return capAndSort(merged);
}

async function searchRemoteRecords(query: string, companyId: string): Promise<WorkspaceSearchResult[]> {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const results: WorkspaceSearchResult[] = [];

  const [employeesResult, leadsResult] = await Promise.allSettled([
    fetchHrEmployees(companyId, { search: q }),
    fetchCrmLeads({ search: q, limit: 20 }),
  ]);

  if (employeesResult.status === "fulfilled") {
    for (const employee of employeesResult.value) {
      const hay = `${employee.name} ${employee.email} ${employee.employeeCode} ${employee.department} ${employee.designation}`;
      pushResult(results, q, {
        id: `api-employee:${employee.id}`,
        category: "Employees",
        label: employee.name,
        hint: `${employee.designation} · ${employee.department}`,
        href: hrmEmployeeProfilePath(employee.id),
        icon: Users,
        haystack: hay,
      });
    }
  }

  if (leadsResult.status === "fulfilled") {
    for (const lead of leadsResult.value) {
      const hay = `${lead.name} ${lead.company} ${lead.email} ${lead.reference}`;
      pushResult(results, q, {
        id: `api-lead:${lead.id}`,
        category: "Leads",
        label: lead.name,
        hint: `${lead.company} · ${lead.reference}`,
        href: listUrl(workspacePaths.leads, lead.name),
        icon: Target,
        haystack: hay,
      });
    }
  }

  return results;
}

export async function searchWorkspace(query: string, companyId: string | null): Promise<WorkspaceSearchResult[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return PAGE_RESULTS.slice(0, 12).map((p) => ({ ...p, score: 1 }));
  }

  const localRecords = searchLocalRecords(trimmed);
  const pages = searchPages(trimmed);
  const remoteRecords = companyId ? await searchRemoteRecords(trimmed, companyId) : [];

  return mergeResults(remoteRecords, localRecords, pages);
}

export function groupSearchResults(results: WorkspaceSearchResult[]): { category: string; items: WorkspaceSearchResult[] }[] {
  const map = new Map<string, WorkspaceSearchResult[]>();
  for (const result of results) {
    const list = map.get(result.category) ?? [];
    list.push(result);
    map.set(result.category, list);
  }

  const groups: { category: string; items: WorkspaceSearchResult[] }[] = [];
  for (const category of CATEGORY_ORDER) {
    const items = map.get(category);
    if (items?.length) groups.push({ category, items });
  }
  for (const [category, items] of map) {
    if (!CATEGORY_ORDER.includes(category)) groups.push({ category, items });
  }
  return groups;
}

const RECENT_KEY = "rvx-recent-search";

export type RecentSearch = { label: string; href: string; category: string };

export function loadRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentSearch[];
    return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(item: RecentSearch) {
  if (typeof window === "undefined") return;
  const prev = loadRecentSearches().filter((r) => r.href !== item.href);
  const next = [item, ...prev].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}
