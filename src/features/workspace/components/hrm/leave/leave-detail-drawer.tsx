"use client";

import { useEffect } from "react";
import { Building2, Calendar, Check, MessageSquare, User, X, XCircle } from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import { LEAVE_TYPES, type LeaveRequest, type LeaveStatus } from "@/features/workspace/data/hrm-leave-demo";

const STATUS_TONE = {
  pending: "amber",
  approved: "emerald",
  rejected: "rose",
  cancelled: "slate",
} as const;

const STATUS_LABEL = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
} as const;

type Props = {
  request: LeaveRequest | null;
  onClose: () => void;
  onUpdateStatus: (status: LeaveStatus) => void;
};

export function LeaveDetailDrawer({ request, onClose, onUpdateStatus }: Props) {
  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [request, onClose]);

  if (!request) return null;

  const typeLabel = LEAVE_TYPES.find((t) => t.id === request.leaveType)?.label;

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <aside className="relative z-[1] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{request.employeeName}</h2>
            <p className="text-sm text-slate-500">{typeLabel} · {request.requestId}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <StatusBadge label={STATUS_LABEL[request.status]} tone={STATUS_TONE[request.status]} />

          <dl className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>
                {request.from}{request.days > 1 ? ` → ${request.to}` : ""} ({request.days} day{request.days !== 1 ? "s" : ""})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{request.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Submitted {request.submittedAt}</span>
            </div>
            {request.approver ? (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span>Approver: {request.approver}</span>
              </div>
            ) : null}
          </dl>

          {request.reason ? (
            <div className="rounded-xl border border-slate-200/80 p-3 text-sm dark:border-slate-800">
              <div className="flex items-start gap-2 text-slate-600">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <p>{request.reason}</p>
              </div>
            </div>
          ) : null}
        </div>

        {request.status === "pending" ? (
          <div className="flex gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onUpdateStatus("rejected")}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus("approved")}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
