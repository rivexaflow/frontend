"use client";

import { useMemo, useState } from "react";
import { Activity, Mail, UserPlus, Users } from "lucide-react";

import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited";
  lastActive: string;
};

const DEMO_MEMBERS: Member[] = [
  { id: "m1", name: "Priya Singh", email: "priya@acme.com", role: "Admin", status: "active", lastActive: "Now" },
  { id: "m2", name: "James Okon", email: "james@acme.com", role: "Sales", status: "active", lastActive: "2h ago" },
  { id: "m3", name: "Elena Rossi", email: "elena@acme.com", role: "Compliance", status: "invited", lastActive: "—" },
];

const columns: TableColumn<Member>[] = [
  {
    key: "name",
    header: "Member",
    render: (r) => (
      <div>
        <p className="font-semibold">{r.name}</p>
        <p className="text-xs text-slate-500">{r.email}</p>
      </div>
    ),
  },
  { key: "role", header: "Role", render: (r) => <span className="text-sm">{r.role}</span> },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <StatusBadge label={r.status} tone={r.status === "active" ? "emerald" : "amber"} />
    ),
  },
  { key: "last", header: "Last active", render: (r) => <span className="text-xs text-slate-500">{r.lastActive}</span> },
];

export function TeamView() {
  const [search, setSearch] = useState("");
  const { effectiveQuery, validation } = useDebouncedSearch(search, { minLength: 2 });
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = effectiveQuery;
    return DEMO_MEMBERS.filter((m) => {
      const matchesTab = tab === "all" || m.status === tab;
      const matchesSearch =
        !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [effectiveQuery, tab]);

  return (
    <EnterprisePageShell
      eyebrow="Workspace"
      title="Team"
      description="Invite members, assign roles, and govern access across CRM, KYC, billing, and AI modules."
      metrics={[
        { label: "Members", value: "24", icon: Users, tone: "blue" },
        { label: "Pending invites", value: "3", icon: Mail, tone: "amber" },
        { label: "Active today", value: "18", icon: Activity, tone: "emerald" },
        { label: "Seats available", value: "6", icon: UserPlus, tone: "purple" },
      ]}
      toolbar={
        <EnterpriseToolbar
          searchPlaceholder="Search members…"
          searchValue={search}
          onSearchChange={setSearch}
          searchHint={validation.message}
          primaryLabel="Invite member"
        />
      }
      tabs={
        <EnterpriseSegmentTabs
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "invited", label: "Invited" },
          ]}
        />
      }
    >
      <EnterpriseDataTable columns={columns} rows={filtered} />
    </EnterprisePageShell>
  );
}
