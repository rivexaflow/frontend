"use client";

import { useMemo, useState } from "react";

import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import type { ScreeningAlert } from "@/features/workspace/data/kyc-demo";

const listTone = { pep: "purple", sanctions: "rose", adverse_media: "amber" } as const;
const statusTone = { open: "amber", cleared: "emerald", confirmed: "rose" } as const;

type Props = {
  alerts: ScreeningAlert[];
  search: string;
  onClear: (id: string) => void;
  onConfirm: (id: string) => void;
};

export function KycScreeningPanel({ alerts, search, onClear, onConfirm }: Props) {
  const { effectiveQuery } = useDebouncedSearch(search, { minLength: 2 });
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = effectiveQuery;
    return alerts.filter((a) => {
      const matchesTab = tab === "all" || a.listType === tab || (tab === "open" && a.status === "open");
      const matchesSearch =
        !q || a.subject.toLowerCase().includes(q) || a.caseRef.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [alerts, effectiveQuery, tab]);

  const columns: TableColumn<ScreeningAlert>[] = [
    {
      key: "subject",
      header: "Subject",
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{row.subject}</p>
          <p className="text-[10px] font-bold text-blue-600">{row.caseRef}</p>
        </div>
      ),
    },
    {
      key: "list",
      header: "List type",
      render: (row) => (
        <StatusBadge
          label={row.listType.replace("_", " ")}
          tone={listTone[row.listType]}
        />
      ),
    },
    { key: "source", header: "Source", render: (row) => <span className="text-sm">{row.source}</span> },
    {
      key: "match",
      header: "Match %",
      render: (row) => <span className="text-sm font-bold tabular-nums">{row.matchStrength}%</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge label={row.status} tone={statusTone[row.status]} />,
    },
    { key: "time", header: "Detected", render: (row) => <span className="text-xs text-slate-500">{row.detectedAt}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40">
        Screens against <strong>1,500+ watchlists</strong> — UN, OFAC, EU, HM Treasury, PEP registries, and adverse media. Continuous monitoring re-screens daily.
      </div>
      <EnterpriseSegmentTabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: alerts.length },
          { id: "open", label: "Open", count: alerts.filter((a) => a.status === "open").length },
          { id: "pep", label: "PEP" },
          { id: "sanctions", label: "Sanctions" },
          { id: "adverse_media", label: "Adverse media" },
        ]}
      />
      <EnterpriseDataTable
        columns={columns}
        rows={filtered}
        emptyMessage="No screening alerts."
        renderActions={(row) =>
          row.status === "open" ? (
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={() => onClear(row.id)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => onConfirm(row.id)}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Confirm
              </button>
            </div>
          ) : null
        }
      />
    </div>
  );
}
