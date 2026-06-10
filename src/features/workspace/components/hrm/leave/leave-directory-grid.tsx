"use client";

import { Calendar, ChevronRight, Plus } from "lucide-react";

import { LeaveStatusBadge } from "@/features/workspace/components/hrm/leave/leave-status-badge";
import { LEAVE_TYPES, type LeaveRequest } from "@/features/workspace/data/hrm-leave-demo";
import { cn } from "@/lib/utils/cn";

const BRAND = "#191970";

type Props = {
  requests: LeaveRequest[];
  selectedId: string | null;
  onSelect: (request: LeaveRequest) => void;
  onApply: () => void;
};

function LeaveCard({
  request,
  selected,
  onSelect,
}: {
  request: LeaveRequest;
  selected: boolean;
  onSelect: () => void;
}) {
  const typeLabel = LEAVE_TYPES.find((t) => t.id === request.leaveType)?.label ?? request.leaveType;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition dark:bg-slate-900",
        selected
          ? "border-[#191970] ring-1 ring-[#191970]/25"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-md dark:border-slate-800",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{request.employeeName}</p>
          <p className="text-[11px] text-slate-500">{request.department}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#191970]" />
      </div>
      <p className="mt-2 font-mono text-[11px] text-slate-400">{request.requestId}</p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div>
          <p className="text-[11px] font-medium text-slate-600">{typeLabel}</p>
          <p className="text-xs text-slate-500">
            {request.from}
            {request.days > 1 ? ` → ${request.to}` : ""} · {request.days}d
          </p>
        </div>
        <LeaveStatusBadge status={request.status} />
      </div>
    </button>
  );
}

function ApplyLeaveCard({ onApply }: { onApply: () => void }) {
  return (
    <button
      type="button"
      onClick={onApply}
      className="group flex w-full items-center gap-3 overflow-hidden rounded-xl border border-dashed border-slate-200 bg-gradient-to-r from-slate-50/80 to-blue-50/40 px-3 py-3 text-left transition hover:border-[#191970]/40 hover:shadow-sm dark:border-slate-700 dark:from-slate-950/40 dark:to-blue-950/20"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-indigo-700 text-white shadow-sm transition group-hover:scale-105">
        <Plus className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Apply leave</p>
        <p className="truncate text-[11px] text-slate-500">Submit a new leave request</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#191970]" />
    </button>
  );
}

export function LeaveDirectoryGrid({ requests, selectedId, onSelect, onApply }: Props) {
  if (requests.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Calendar className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No leave requests match your filters</p>
        <button
          type="button"
          onClick={onApply}
          className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
          <Plus className="h-3.5 w-3.5" />
          Apply leave
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 bg-slate-50/50 p-3 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1280px]:grid-cols-4 dark:bg-slate-950/20">
      {requests.map((request) => (
        <LeaveCard
          key={request.id}
          request={request}
          selected={selectedId === request.id}
          onSelect={() => onSelect(request)}
        />
      ))}
      <ApplyLeaveCard onApply={onApply} />
    </div>
  );
}
