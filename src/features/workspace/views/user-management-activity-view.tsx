"use client";

import { Activity, Clock } from "lucide-react";

import {
  EnterpriseDataTable,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";

type ActivityRow = {
  id: string;
  user: string;
  action: string;
  module: string;
  when: string;
};

const DEMO_ACTIVITY: ActivityRow[] = [
  { id: "a1", user: "Priya Mehta", action: "Updated lead stage", module: "CRM · Leads", when: "12 min ago" },
  { id: "a2", user: "James Okonkwo", action: "Approved KYC case", module: "KYC Center", when: "34 min ago" },
  { id: "a3", user: "Elena Rossi", action: "Closed deal · Acme Corp", module: "CRM · Pipelines", when: "1 hr ago" },
  { id: "a4", user: "Sarah Chen", action: "Invited new member", module: "User management", when: "2 hr ago" },
  { id: "a5", user: "Marcus Webb", action: "Exported audit log", module: "Compliance", when: "Yesterday" },
];

const columns: TableColumn<ActivityRow>[] = [
  { key: "user", header: "User", render: (r) => <span className="font-semibold">{r.user}</span> },
  { key: "action", header: "Action", render: (r) => r.action },
  { key: "module", header: "Module", render: (r) => <span className="text-slate-500">{r.module}</span> },
  { key: "when", header: "When", render: (r) => <span className="text-xs text-slate-500">{r.when}</span> },
];

export function UserManagementActivityView() {
  return (
    <EnterprisePageShell
      eyebrow="User management"
      title="User activity"
      description="Audit trail of sign-ins, record changes, and module actions across your workspace."
      metrics={[
        { label: "Events today", value: "48", icon: Activity, tone: "blue" },
        { label: "Avg. session", value: "2h 14m", icon: Clock, tone: "slate" },
      ]}
    >
      <EnterpriseDataTable columns={columns} rows={DEMO_ACTIVITY} />
    </EnterprisePageShell>
  );
}
