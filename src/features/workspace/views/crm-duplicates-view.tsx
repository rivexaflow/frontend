"use client";

import { useMemo, useState } from "react";
import { GitMerge, Mail, Phone } from "lucide-react";

import {
  CrmPanel,
  CrmPanelBody,
  CrmPanelFooter,
  CrmPanelToolbar,
} from "@/features/workspace/components/crm/crm-panel";
import { CrmListSummary } from "@/features/workspace/components/crm/crm-list-summary";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { DEMO_CRM_DUPLICATES, type CrmDuplicateRecord } from "@/features/workspace/data/crm-extended-demo";

export function CrmDuplicatesView() {
  const [rows, setRows] = useState(DEMO_CRM_DUPLICATES);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.value.toLowerCase().includes(q) ||
        r.leadA.toLowerCase().includes(q) ||
        r.leadB.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const open = rows.filter((r) => r.status === "open").length;

  const merge = (id: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "merged" as const } : r)));
  };

  const columns: TableColumn<CrmDuplicateRecord>[] = [
    {
      key: "field",
      header: "Match field",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium capitalize text-slate-800">
          {r.field === "phone" ? <Phone className="h-3.5 w-3.5 text-[#191970]" /> : <Mail className="h-3.5 w-3.5 text-[#191970]" />}
          {r.field}
        </span>
      ),
    },
    { key: "value", header: "Value", render: (r) => <span className="font-mono text-sm text-slate-700">{r.value}</span> },
    {
      key: "records",
      header: "Matching records",
      render: (r) => (
        <span className="text-sm text-slate-700">
          {r.leadA} <span className="text-slate-300">·</span> {r.leadB}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge
          label={r.status === "open" ? "Open" : r.status === "merged" ? "Merged" : "Ignored"}
          tone={r.status === "merged" ? "emerald" : r.status === "ignored" ? "slate" : "amber"}
        />
      ),
    },
    { key: "detected", header: "Detected", render: (r) => <span className="text-xs text-slate-500">{r.detectedAt}</span> },
  ];

  return (
    <div className="pb-4">
      <CrmPageHeader
        metrics={[
          { label: "Open", value: open },
          { label: "Merged", value: rows.filter((r) => r.status === "merged").length },
          { label: "Total", value: rows.length },
        ]}
      />

      <CrmPanel>
        <CrmPanelToolbar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search value or lead name…"
        />
        <CrmPanelBody>
          <EnterpriseDataTable
            columns={columns}
            rows={filtered}
            emptyMessage="No duplicates detected."
            renderActions={(row) =>
              row.status === "open" ? (
                <button
                  type="button"
                  onClick={() => merge(row.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-[#191970] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#12124a]"
                >
                  <GitMerge className="h-3 w-3" />
                  Merge
                </button>
              ) : null
            }
          />
        </CrmPanelBody>
        <CrmPanelFooter>
          <CrmListSummary showing={filtered.length} total={rows.length} label="matches" />
        </CrmPanelFooter>
      </CrmPanel>
    </div>
  );
}
