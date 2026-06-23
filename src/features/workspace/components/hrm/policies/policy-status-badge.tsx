"use client";

import type { HrmPolicyStatus } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const STATUS_STYLES: Record<HrmPolicyStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-500/15",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  archived: "bg-slate-100 text-slate-500 ring-slate-500/15",
};

const STATUS_LABEL: Record<HrmPolicyStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function PolicyStatusBadge({ status }: { status: HrmPolicyStatus }) {
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
