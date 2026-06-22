"use client";

import type { HrmDocumentStatus } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

export const STATUS_LABEL: Record<HrmDocumentStatus, string> = {
  verified: "Verified",
  pending: "Pending review",
  expired: "Expired",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

export const STATUS_STYLE: Record<HrmDocumentStatus, string> = {
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/15",
  expired: "bg-orange-50 text-orange-700 ring-orange-600/15",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
  not_submitted: "bg-slate-100 text-slate-500 ring-slate-500/15",
};

export function SubmissionBadge({ status }: { status: HrmDocumentStatus }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
