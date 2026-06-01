"use client";

import { useMemo, useState } from "react";
import { BarChart3, Download, LineChart, PieChart } from "lucide-react";

import {
  EnterpriseDataTable,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { DEMO_REPORTS, type ReportRecord } from "@/features/workspace/data/module-records-demo";

const columns: TableColumn<ReportRecord>[] = [
  { key: "name", header: "Report", render: (r) => <span className="font-semibold">{r.name}</span> },
  { key: "cat", header: "Category", render: (r) => <span className="text-sm">{r.category}</span> },
  { key: "sched", header: "Schedule", render: (r) => <span className="text-sm text-slate-500">{r.schedule}</span> },
  { key: "last", header: "Last run", render: (r) => <span className="text-xs text-slate-500">{r.lastRun}</span> },
];

export function AnalyticsView() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEMO_REPORTS.filter((row) => {
      const matchesTab = tab === "all" || row.category.toLowerCase() === tab;
      const matchesSearch = !q || row.name.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [search, tab]);

  return (
    <EnterprisePageShell
      eyebrow="Intelligence"
      title="Analytics"
      description="Cross-module KPIs, funnel analytics, compliance metrics, and scheduled exports for leadership."
      metrics={[
        { label: "Dashboards", value: "18", icon: BarChart3, tone: "blue" },
        { label: "Scheduled exports", value: "6", icon: Download, tone: "purple" },
        { label: "Conversion rate", value: "38%", trend: "+4%", trendUp: true, icon: LineChart, tone: "emerald" },
        { label: "Revenue segments", value: "4", icon: PieChart, tone: "amber" },
      ]}
      toolbar={
        <EnterpriseToolbar
          searchPlaceholder="Search reports…"
          searchValue={search}
          onSearchChange={setSearch}
          primaryLabel="New report"
        />
      }
      tabs={
        <EnterpriseSegmentTabs
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "crm", label: "CRM" },
            { id: "finance", label: "Finance" },
            { id: "compliance", label: "Compliance" },
          ]}
        />
      }
    >
      <EnterpriseDataTable columns={columns} rows={filtered} />
    </EnterprisePageShell>
  );
}
