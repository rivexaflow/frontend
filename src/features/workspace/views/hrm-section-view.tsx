"use client";

import {
  Calendar,
  ClipboardList,
  FileText,
  Settings,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { EnterpriseModuleView } from "@/features/workspace/views/enterprise-module-view";

type HrmSectionKey =
  | "employees"
  | "payroll"
  | "attendance"
  | "leave"
  | "admin"
  | "events"
  | "documents"
  | "policies"
  | "setup"
  | "reports";

const SECTION_CONFIG: Record<
  HrmSectionKey,
  {
    title: string;
    description: string;
    icon: LucideIcon;
    primaryLabel: string;
    searchPlaceholder: string;
  }
> = {
  employees: {
    title: "Employees",
    description: "Directory, profiles, designations, and employment lifecycle for your organization.",
    icon: Users,
    primaryLabel: "Add employee",
    searchPlaceholder: "Search employees…",
  },
  payroll: {
    title: "Payroll",
    description: "Pay runs, payslips, allowances, and statutory compliance in one governed workspace.",
    icon: Wallet,
    primaryLabel: "Run payroll",
    searchPlaceholder: "Search payroll records…",
  },
  attendance: {
    title: "Attendance",
    description: "Clock-in policies, shifts, overtime, and attendance reports with audit trail.",
    icon: ClipboardList,
    primaryLabel: "Mark attendance",
    searchPlaceholder: "Search attendance…",
  },
  leave: {
    title: "Manage leave",
    description: "Leave types, balances, approvals, and team calendars aligned to company policy.",
    icon: Calendar,
    primaryLabel: "Apply leave",
    searchPlaceholder: "Search leave requests…",
  },
  admin: {
    title: "HR admin",
    description: "Branches, departments, designations, and HR configuration for enterprise scale.",
    icon: Shield,
    primaryLabel: "HR settings",
    searchPlaceholder: "Search HR admin…",
  },
  events: {
    title: "Events",
    description: "Company events, town halls, and team engagements with RSVP and reminders.",
    icon: Calendar,
    primaryLabel: "Create event",
    searchPlaceholder: "Search events…",
  },
  documents: {
    title: "Documents",
    description: "Employee document vault, templates, and version-controlled HR files.",
    icon: FileText,
    primaryLabel: "Upload document",
    searchPlaceholder: "Search documents…",
  },
  policies: {
    title: "Company policy",
    description: "Publish and acknowledge policies with compliance tracking across the workforce.",
    icon: FileText,
    primaryLabel: "New policy",
    searchPlaceholder: "Search policies…",
  },
  setup: {
    title: "System setup",
    description: "HRM module configuration, workflows, integrations, and notification rules.",
    icon: Settings,
    primaryLabel: "Configure",
    searchPlaceholder: "Search settings…",
  },
  reports: {
    title: "HR reports",
    description: "Headcount, attrition, payroll summaries, and exportable compliance reports.",
    icon: ClipboardList,
    primaryLabel: "Generate report",
    searchPlaceholder: "Search reports…",
  },
};

type Props = {
  section: HrmSectionKey;
};

export function HrmSectionView({ section }: Props) {
  const config = SECTION_CONFIG[section];
  const Icon = config.icon;

  return (
    <EnterpriseModuleView
      eyebrow="People · HRM"
      title={config.title}
      description={config.description}
      metrics={[
        { label: "Active records", value: "24", icon: Icon, tone: "blue" },
        { label: "Pending actions", value: "3", icon: ClipboardList, tone: "amber" },
      ]}
      checklist={[
        { id: "1", title: "Connect HRIS / payroll API", status: "active", meta: "Recommended" },
        { id: "2", title: "Import employee master data", status: "pending" },
        { id: "3", title: "Enable approval workflows", status: "pending" },
      ]}
      primaryLabel={config.primaryLabel}
      searchPlaceholder={config.searchPlaceholder}
    />
  );
}
