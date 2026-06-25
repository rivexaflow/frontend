"use client";

import { Check, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import {
  AttendanceDataTable,
  AttendanceEmployeeCell,
  type AttendanceTableColumn,
} from "@/features/workspace/components/hrm/attendance/attendance-data-table";
import {
  AttendanceMetricStrip,
  AttendancePanelCard,
} from "@/features/workspace/components/hrm/attendance/attendance-sub-page-primitives";
import {
  DEMO_REGULARIZATION_REQUESTS,
  type AttendanceRegularizationRequest,
} from "@/features/workspace/data/hrm-attendance-extended-demo";
import { cn } from "@/lib/utils/cn";
import { Clock, FileCheck, FileX, Inbox } from "lucide-react";

type Tab = "pending" | "approved" | "rejected";

const STATUS_STYLE: Record<AttendanceRegularizationRequest["status"], string> = {
  pending: "bg-[#2277FF]/10 text-[#191970] ring-[#2277FF]/25 dark:text-[#2277FF]",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-400",
};

type Props = {
  refreshing: boolean;
  onRefresh: () => void;
};

export function AttendanceRegularizationPanel({ refreshing, onRefresh }: Props) {
  const [tab, setTab] = useState<Tab>("pending");
  const [requests, setRequests] = useState(DEMO_REGULARIZATION_REQUESTS);

  const filtered = useMemo(() => requests.filter((r) => r.status === tab), [requests, tab]);
  const pending = requests.filter((r) => r.status === "pending").length;
  const approved = requests.filter((r) => r.status === "approved").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setTab(status);
  };

  const columns = useMemo<AttendanceTableColumn<AttendanceRegularizationRequest>[]>(() => {
    const base: AttendanceTableColumn<AttendanceRegularizationRequest>[] = [
      {
        key: "employee",
        header: "Employee",
        sortable: true,
        sortValue: (r) => r.employeeName,
        render: (r) => <AttendanceEmployeeCell name={r.employeeName} subtitle={r.department} />,
      },
      {
        key: "date",
        header: "Date",
        sortable: true,
        sortValue: (r) => r.date,
        render: (r) => <span className="text-xs text-slate-600 dark:text-slate-300">{r.date}</span>,
      },
      {
        key: "requested",
        header: "Requested times",
        sortable: true,
        sortValue: (r) => r.requestedCheckIn,
        render: (r) => (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700 ring-1 ring-slate-200/80 dark:bg-slate-950/50 dark:text-slate-200 dark:ring-slate-700">
            {r.requestedCheckIn} – {r.requestedCheckOut}
          </span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        className: "max-w-[220px]",
        render: (r) => (
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{r.reason}</p>
        ),
      },
      {
        key: "submitted",
        header: "Submitted",
        sortable: true,
        sortValue: (r) => r.submittedAt,
        className: "hidden md:table-cell",
        headerClassName: "hidden md:table-cell",
        render: (r) => (
          <span className="text-[10px] text-slate-500">
            {new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        sortValue: (r) => r.status,
        render: (r) => (
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ring-1 ring-inset",
              STATUS_STYLE[r.status],
            )}
          >
            {r.status}
          </span>
        ),
      },
    ];

    if (tab === "pending") {
      base.push({
        key: "actions",
        header: "Review",
        render: (r) => (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => updateStatus(r.id, "approved")}
              className="inline-flex h-7 items-center gap-1 rounded-lg bg-[#191970] px-2 text-[10px] font-semibold text-white hover:bg-[#12124a]"
              aria-label="Approve"
            >
              <Check className="h-3 w-3" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => updateStatus(r.id, "rejected")}
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              aria-label="Reject"
            >
              <X className="h-3 w-3" />
              Reject
            </button>
          </div>
        ),
      });
    }

    return base;
  }, [tab]);

  return (
    <>
      <AttendanceMetricStrip
        metrics={[
          { label: "Pending", value: pending, hint: "Awaiting review", icon: Inbox },
          { label: "Approved", value: approved, hint: "This cycle", icon: FileCheck },
          { label: "Rejected", value: rejected, hint: "This cycle", icon: FileX },
          { label: "SLA", value: "24h", hint: "Target turnaround", icon: Clock },
        ]}
        actions={
          <button type="button" onClick={onRefresh} disabled={refreshing} className={cn(crm.btnSecondarySm, "h-9")}>
            <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
            Refresh
          </button>
        }
      />
      <div className="border-b border-slate-100 px-4 dark:border-slate-800 md:px-5">
        <div className="flex gap-1 py-2">
          {(
            [
              { id: "pending" as const, label: "Pending", count: pending },
              { id: "approved" as const, label: "Approved", count: approved },
              { id: "rejected" as const, label: "Rejected", count: rejected },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                tab === t.id
                  ? "bg-[#191970] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded px-1.5 text-[10px] tabular-nums",
                  tab === t.id ? "bg-white/20" : "bg-slate-200/80 dark:bg-slate-700",
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 md:p-5">
        <AttendancePanelCard title="Requests queue" description={`Showing ${filtered.length} ${tab} requests`}>
          <AttendanceDataTable
            rows={filtered}
            columns={columns}
            minWidth={880}
            emptyMessage={`No ${tab} regularization requests.`}
            emptyIcon={<Inbox className="h-8 w-8 text-slate-300" />}
            footer={
              <span>
                {tab === "pending"
                  ? "Review pending requests within 24h SLA"
                  : `${filtered.length} ${tab} request${filtered.length === 1 ? "" : "s"} on record`}
              </span>
            }
          />
        </AttendancePanelCard>
      </div>
    </>
  );
}
