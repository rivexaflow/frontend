"use client";

import { motion } from "framer-motion";
import { Building2, Calendar, Check, MessageSquare, User, X, XCircle } from "lucide-react";

import { LeaveStatusBadge } from "@/features/workspace/components/hrm/leave/leave-status-badge";
import {
  LEAVE_TYPES,
  type LeaveRequest,
  type LeaveStatus,
} from "@/features/workspace/data/hrm-leave-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  request: LeaveRequest;
  onClose: () => void;
  onUpdateStatus: (status: LeaveStatus) => void;
};

export function LeaveDetailPanel({ request, onClose, onUpdateStatus }: Props) {
  const typeLabel = LEAVE_TYPES.find((t) => t.id === request.leaveType)?.label ?? request.leaveType;
  const canAct = request.status === "pending";

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Close"
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[400px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
      >
        <div className="shrink-0 border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] text-slate-400">{request.requestId}</p>
              <h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{request.employeeName}</h2>
              <p className="text-sm text-slate-500">{typeLabel}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <LeaveStatusBadge status={request.status} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section className="rounded-lg border border-slate-200/90 px-4 dark:border-slate-800">
            <div className="flex items-start gap-3 py-2.5 text-sm">
              <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Duration</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {request.from}{request.days > 1 ? ` → ${request.to}` : ""}
                </p>
                <p className="text-xs text-slate-500">{request.days} day{request.days !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-slate-100 py-2.5 text-sm dark:border-slate-800">
              <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Department</p>
                <p className="font-medium text-slate-900 dark:text-white">{request.department}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-slate-100 py-2.5 text-sm dark:border-slate-800">
              <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[10px] font-semibold uppercase text-slate-400">Submitted</p>
                <p className="font-medium text-slate-900 dark:text-white">{request.submittedAt}</p>
              </div>
            </div>
            {request.approver ? (
              <div className="flex items-start gap-3 border-t border-slate-100 py-2.5 text-sm dark:border-slate-800">
                <User className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Approver</p>
                  <p className="font-medium text-slate-900 dark:text-white">{request.approver}</p>
                </div>
              </div>
            ) : null}
          </section>

          {request.reason ? (
            <section className="mt-4 rounded-lg border border-slate-200/90 px-4 py-3 dark:border-slate-800">
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Reason</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{request.reason}</p>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        {canAct ? (
          <div className="shrink-0 flex gap-2 border-t border-slate-200/90 px-5 py-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onUpdateStatus("rejected")}
              className={cn(
                "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50",
              )}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus("approved")}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#191970] text-sm font-semibold text-white transition hover:bg-[#12124a]"
            >
              <Check className="h-4 w-4" />
              Approve
            </button>
          </div>
        ) : null}
      </motion.aside>
    </>
  );
}
