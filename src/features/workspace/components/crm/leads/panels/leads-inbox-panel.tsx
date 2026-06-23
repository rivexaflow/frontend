"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, XCircle } from "lucide-react";

import { CrmListSummary } from "@/features/workspace/components/crm/crm-list-summary";
import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import { isTerminalLeadStatus, LEAD_STATUS_LABELS, type LeadRecord, type LeadStatus } from "@/features/workspace/data/crm-demo";
import { cn } from "@/lib/utils/cn";

const statusTone = (status: LeadStatus): "blue" | "emerald" | "amber" | "rose" => {
  if (status === "interested" || status === "document_received" || status === "move_to_activation" || status === "qualified") {
    return "emerald";
  }
  if (isTerminalLeadStatus(status)) return "rose";
  if (status === "callback" || status === "document_pending" || status === "not_pickup_call" || status === "nurturing") {
    return "amber";
  }
  return "blue";
};
const slaTone = { on_track: "emerald", at_risk: "amber", breached: "rose" } as const;

const statusLabel = LEAD_STATUS_LABELS;

function LeadAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`
      : name.charAt(0);
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
      {initials.toUpperCase()}
    </div>
  );
}

function matchesView(row: LeadRecord, view: string): boolean {
  switch (view) {
    case "all":
      return true;
    case "new":
      return row.status === "new";
    case "hot":
      return (row.scoreBand === "A1" || row.scoreBand === "A2") && !isTerminalLeadStatus(row.status);
    case "attention":
      return row.slaStatus !== "on_track" && !isTerminalLeadStatus(row.status) && row.status !== "qualified" && row.status !== "interested";
    case "qualified":
      return row.status === "qualified";
    case "nurturing":
      return row.status === "nurturing";
    case "lost":
      return row.status === "lost";
    default:
      return true;
  }
}

type Props = {
  leads: LeadRecord[];
  search: string;
  onSelect: (lead: LeadRecord) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
};

export function LeadsInboxPanel({ leads, search, onSelect, onStatusChange }: Props) {
  const { effectiveQuery } = useDebouncedSearch(search, { minLength: 2 });
  const [view, setView] = useState("all");

  const counts = useMemo(
    () => ({
      all: leads.length,
      new: leads.filter((l) => l.status === "new").length,
      hot: leads.filter((l) => (l.scoreBand === "A1" || l.scoreBand === "A2") && !isTerminalLeadStatus(l.status)).length,
      attention: leads.filter(
        (l) => l.slaStatus !== "on_track" && !isTerminalLeadStatus(l.status) && l.status !== "qualified" && l.status !== "interested",
      ).length,
      qualified: leads.filter((l) => l.status === "qualified").length,
      nurturing: leads.filter((l) => l.status === "nurturing").length,
      lost: leads.filter((l) => l.status === "lost").length,
    }),
    [leads],
  );

  const filtered = useMemo(() => {
    const q = effectiveQuery;
    return leads.filter((row) => {
      if (!matchesView(row, view)) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.company.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q)
      );
    });
  }, [leads, effectiveQuery, view]);

  const columns: TableColumn<LeadRecord>[] = [
    {
      key: "lead",
      header: "Lead",
      render: (row) => (
        <div className="flex items-center gap-3">
          <LeadAvatar name={row.name} />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-500">
              {row.title} · {row.company}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div className="text-sm">
          <p className="text-slate-700 dark:text-slate-300">{row.email}</p>
          <p className="text-xs text-slate-500">{row.country}</p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (row) => (
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800">
          {row.source}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              row.score >= 80 ? "text-emerald-600" : row.score >= 60 ? "text-blue-600" : "text-slate-500",
            )}
          >
            {row.score}
          </span>
          {(row.scoreBand === "A1" || row.scoreBand === "A2") && !isTerminalLeadStatus(row.status) ? (
            <StatusBadge label="Hot" tone="emerald" />
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge label={statusLabel[row.status]} tone={statusTone(row.status)} />,
    },
    {
      key: "followup",
      header: "Follow-up",
      render: (row) => (
        <div>
          {row.slaStatus !== "on_track" && !isTerminalLeadStatus(row.status) ? (
            <StatusBadge
              label={row.slaStatus === "breached" ? "Overdue" : "Due soon"}
              tone={slaTone[row.slaStatus]}
            />
          ) : (
            <span className="text-xs text-slate-500">{row.slaDue}</span>
          )}
        </div>
      ),
    },
    { key: "owner", header: "Owner", render: (row) => <span className="text-sm">{row.owner}</span> },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Click a row to see full details. Use <strong className="text-slate-700">Qualify</strong> when they’re
        ready for a deal, or <strong className="text-slate-700">Not a fit</strong> to close them out.
      </p>

      <EnterpriseSegmentTabs
        activeId={view}
        onChange={setView}
        tabs={[
          { id: "all", label: "All", count: counts.all },
          { id: "new", label: "New", count: counts.new },
          { id: "hot", label: "Hot", count: counts.hot },
          { id: "attention", label: "Needs follow-up", count: counts.attention },
          { id: "qualified", label: "Qualified", count: counts.qualified },
          { id: "nurturing", label: "Nurturing", count: counts.nurturing },
          { id: "lost", label: "Not a fit", count: counts.lost },
        ]}
      />

      <CrmListSummary showing={filtered.length} total={leads.length} label="leads" />

      <EnterpriseDataTable
        columns={columns}
        rows={filtered}
        emptyMessage="No leads in this list. Try another tab or clear your search."
        renderActions={(row) =>
          !isTerminalLeadStatus(row.status) ? (
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={() => onSelect(row)}
                className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                aria-label="View lead"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(row.id, "qualified")}
                className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                aria-label="Mark qualified"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(row.id, "lost")}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                aria-label="Mark not a fit"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(row)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              aria-label="View lead"
            >
              <Eye className="h-4 w-4" />
            </button>
          )
        }
      />
    </div>
  );
}
