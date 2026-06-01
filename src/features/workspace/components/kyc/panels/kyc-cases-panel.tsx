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
import {
  VERIFICATION_TYPE_LABELS,
  type KycCase,
} from "@/features/workspace/data/kyc-demo";
import { cn } from "@/lib/utils/cn";

const riskTone = { low: "emerald", medium: "amber", high: "rose" } as const;
const statusTone = {
  pending: "amber",
  in_review: "blue",
  approved: "emerald",
  rejected: "rose",
  escalated: "purple",
} as const;

type Props = {
  cases: KycCase[];
  search: string;
  onSelectCase: (c: KycCase) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function KycCasesPanel({ cases, search, onSelectCase, onApprove, onReject }: Props) {
  const { effectiveQuery } = useDebouncedSearch(search, { minLength: 2 });
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = effectiveQuery;
    return cases.filter((row) => {
      const matchesTab =
        tab === "all" ||
        (tab === "queue" && (row.status === "pending" || row.status === "in_review" || row.status === "escalated")) ||
        row.status === tab;
      const matchesSearch =
        !q ||
        row.applicant.toLowerCase().includes(q) ||
        row.company.toLowerCase().includes(q) ||
        row.reference.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [cases, effectiveQuery, tab]);

  const columns: TableColumn<KycCase>[] = [
    {
      key: "ref",
      header: "Case",
      render: (row) => (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">{row.reference}</p>
          <p className="font-semibold text-slate-900 dark:text-white">{row.applicant}</p>
          <p className="text-xs text-slate-500">{row.company}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {VERIFICATION_TYPE_LABELS[row.verificationType]}
        </span>
      ),
    },
    {
      key: "risk",
      header: "Risk",
      render: (row) => <StatusBadge label={row.risk} tone={riskTone[row.risk]} />,
    },
    {
      key: "score",
      header: "AI score",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full",
                row.aiScore >= 80 ? "bg-emerald-500" : row.aiScore >= 60 ? "bg-amber-500" : "bg-rose-500",
              )}
              style={{ width: `${row.aiScore}%` }}
            />
          </div>
          <span className="text-sm font-bold tabular-nums">{row.aiScore}%</span>
        </div>
      ),
    },
    {
      key: "flags",
      header: "Screening",
      render: (row) => (
        <div className="flex gap-1">
          {row.pepHit ? <StatusBadge label="PEP" tone="rose" /> : null}
          {row.sanctionsHit ? <StatusBadge label="SDN" tone="rose" /> : null}
          {!row.pepHit && !row.sanctionsHit ? (
            <span className="text-xs text-slate-400">Clear</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge label={row.status.replace("_", " ")} tone={statusTone[row.status]} />
      ),
    },
    { key: "sla", header: "SLA", render: (row) => <span className="text-xs text-slate-500">{row.slaDue}</span> },
  ];

  return (
    <div className="space-y-4">
      <EnterpriseSegmentTabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: cases.length },
          {
            id: "queue",
            label: "In queue",
            count: cases.filter((c) => ["pending", "in_review", "escalated"].includes(c.status)).length,
          },
          { id: "approved", label: "Approved", count: cases.filter((c) => c.status === "approved").length },
          { id: "rejected", label: "Rejected", count: cases.filter((c) => c.status === "rejected").length },
        ]}
      />
      <CrmListSummary showing={filtered.length} total={cases.length} label="cases" />
      <EnterpriseDataTable
        columns={columns}
        rows={filtered}
        emptyMessage="No cases match your filters."
        renderActions={(row) => (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => onSelectCase(row)}
              className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
              aria-label="View case"
            >
              <Eye className="h-4 w-4" />
            </button>
            {row.status !== "approved" && row.status !== "rejected" ? (
              <>
                <button
                  type="button"
                  onClick={() => onApprove(row.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                  aria-label="Approve"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onReject(row.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Reject"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        )}
      />
    </div>
  );
}
