"use client";

import { Download, Eye, Loader2 } from "lucide-react";

import { HRM_REPORT_CATEGORIES } from "@/features/workspace/data/hrm-reports-demo";
import type { HrmReportFormat, HrmReportRun, HrmReportRunStatus } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLES: Record<HrmReportRunStatus, string> = {
  ready: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  generating: "bg-amber-50 text-amber-700 ring-amber-600/15",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

const STATUS_LABEL: Record<HrmReportRunStatus, string> = {
  ready: "Ready",
  generating: "Generating",
  failed: "Failed",
};

const FORMAT_LABELS: Record<HrmReportFormat, string> = {
  csv: "CSV (UTF-8)",
  xlsx: "Excel (.xls)",
  pdf: "PDF / HTML report",
};

export function RunStatusBadge({ status }: { status: HrmReportRunStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        STATUS_STYLES[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

type Props = {
  rows: HrmReportRun[];
  loading: boolean;
  selectedId: string | null;
  downloadingId: string | null;
  onSelect: (run: HrmReportRun) => void;
  onDownload: (run: HrmReportRun) => void;
};

export function HrmReportRunsTable({
  rows,
  loading,
  selectedId,
  downloadingId,
  onSelect,
  onDownload,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading run history…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">No report runs yet</p>
        <p className="mt-1 text-xs text-slate-500">
          Generate a report from the library to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <th className="px-4 py-3">Report</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Period</th>
            <th className="px-4 py-3">Generated</th>
            <th className="px-4 py-3">Format</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((run) => {
            const selected = selectedId === run.id;
            const downloading = downloadingId === run.id;
            const categoryLabel =
              HRM_REPORT_CATEGORIES.find((c) => c.id === run.category)?.label ?? run.category;

            return (
              <tr
                key={run.id}
                className={cn(
                  "cursor-pointer transition hover:bg-slate-50/80",
                  selected && "bg-[#191970]/[0.03]",
                )}
                onClick={() => onSelect(run)}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{run.name}</p>
                  <p className="text-xs text-slate-500">{run.generatedBy}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{categoryLabel}</td>
                <td className="px-4 py-3 text-slate-600">{run.period}</td>
                <td className="px-4 py-3 text-slate-500">{run.generatedAt}</td>
                <td className="px-4 py-3 uppercase text-slate-500">{run.format}</td>
                <td className="px-4 py-3">
                  <RunStatusBadge status={run.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(run);
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-white"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {run.status === "ready" ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(run);
                        }}
                        disabled={downloading}
                        className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#191970] px-2.5 text-xs font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
                      >
                        {downloading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        Download
                      </button>
                    ) : run.status === "generating" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Processing
                      </span>
                    ) : (
                      <span className="text-xs text-rose-500">Failed</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { FORMAT_LABELS };
