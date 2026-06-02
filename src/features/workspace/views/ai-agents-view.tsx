"use client";

import { useMemo, useState } from "react";
import { Bot, MessageSquare, Sparkles, Zap } from "lucide-react";

import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { DEMO_AGENTS, type AiAgentRecord } from "@/features/workspace/data/module-records-demo";

const statusTone = { active: "emerald", paused: "amber", draft: "slate" } as const;

const columns: TableColumn<AiAgentRecord>[] = [
  { key: "name", header: "Agent", render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: "module", header: "Module", render: (r) => <span className="text-sm">{r.module}</span> },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge label={r.status} tone={statusTone[r.status]} />,
  },
  { key: "runs", header: "Runs today", render: (r) => <span className="text-sm font-medium">{r.runsToday}</span> },
  { key: "rate", header: "Success", render: (r) => <span className="text-sm">{r.successRate}</span> },
];

export function AiAgentsView() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEMO_AGENTS.filter((row) => {
      const matchesTab = tab === "all" || row.status === tab;
      const matchesSearch = !q || row.name.toLowerCase().includes(q) || row.module.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [search, tab]);

  return (
    <EnterprisePageShell
      eyebrow="Intelligence"
      title="AI Agents"
      description="Governed automations for lead scoring, KYC extraction, invoice follow-ups, and operational copilots."
      metrics={[
        { label: "Active agents", value: "12", icon: Bot, tone: "purple" },
        { label: "Runs today", value: "1.4k", trend: "+22%", trendUp: true, icon: Zap, tone: "blue" },
        { label: "Avg. latency", value: "1.2s", icon: Sparkles, tone: "emerald" },
        { label: "Human handoffs", value: "8", icon: MessageSquare, tone: "amber" },
      ]}
      toolbar={
        <EnterpriseToolbar
          searchPlaceholder="Search agents…"
          searchValue={search}
          onSearchChange={setSearch}
          primaryLabel="Deploy agent"
        />
      }
      tabs={
        <EnterpriseSegmentTabs
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "paused", label: "Paused" },
            { id: "draft", label: "Draft" },
          ]}
        />
      }
    >
      <EnterpriseDataTable columns={columns} rows={filtered} />
    </EnterprisePageShell>
  );
}
