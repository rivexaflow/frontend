"use client";

import { ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";

import { SubmissionBadge } from "@/features/workspace/components/hrm/documents/document-submission-badge";
import { initials } from "@/features/workspace/data/hrm-assets-demo";
import type { EmployeeDocumentSubmission } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZES = [8, 12, 20] as const;

type Props = {
  rows: EmployeeDocumentSubmission[];
  totalRows: number;
  loading: boolean;
  actionLoading: boolean;
  page: number;
  totalPages: number;
  pageSize: number;
  previewEmployeeId: string | null;
  onPreview: (row: EmployeeDocumentSubmission) => void;
  onVerify: (row: EmployeeDocumentSubmission, status: "verified" | "rejected") => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: (typeof PAGE_SIZES)[number]) => void;
};

export function DocumentsSubmissionsTable({
  rows,
  totalRows,
  loading,
  actionLoading,
  page,
  totalPages,
  pageSize,
  previewEmployeeId,
  onPreview,
  onVerify,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                    No employees match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const selected = previewEmployeeId === row.employeeId;
                  return (
                    <tr
                      key={`${row.employeeId}-${row.documentTypeId}`}
                      className={cn(
                        "transition hover:bg-[#2277ff]/[0.03]",
                        selected && "bg-[#2277ff]/[0.06]",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#191970] text-[10px] font-bold text-white">
                            {initials(row.employeeName)}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">{row.employeeName}</p>
                            <p className="font-mono text-[11px] text-slate-400">{row.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.department}</td>
                      <td className="px-4 py-3 text-slate-600">{row.location}</td>
                      <td className="px-4 py-3">
                        <SubmissionBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500">{row.submittedAt ?? "—"}</td>
                      <td className="px-4 py-3">
                        {row.fileName ? (
                          <span className="font-mono text-xs text-slate-600">{row.fileName}</span>
                        ) : (
                          <span className="text-xs font-medium text-rose-600">Awaiting upload</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {row.submitted && row.fileName ? (
                            <button
                              type="button"
                              onClick={() => onPreview(row)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a]"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </button>
                          ) : null}
                          {row.status === "pending" && row.submissionId ? (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => onVerify(row, "verified")}
                                className="inline-flex h-8 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                              >
                                Verify
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => onVerify(row, "rejected")}
                                className="inline-flex h-8 items-center rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <label className="flex items-center gap-2">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <span>
            <span className="font-semibold tabular-nums text-slate-700">{rangeStart}–{rangeEnd}</span> of {totalRows}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <PaginationBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)} label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </PaginationBtn>
          <span className="px-2 text-xs font-medium text-slate-600">
            {page} / {totalPages}
          </span>
          <PaginationBtn disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} label="Next">
            <ChevronRight className="h-4 w-4" />
          </PaginationBtn>
        </div>
      </div>
    </>
  );
}

function PaginationBtn({
  children,
  disabled,
  onClick,
  label,
}: {
  children: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export { PAGE_SIZES };
