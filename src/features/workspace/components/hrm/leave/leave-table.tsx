"use client";

import { ChevronRight } from "lucide-react";

import { LeaveStatusBadge } from "@/features/workspace/components/hrm/leave/leave-status-badge";
import { LEAVE_TYPES, type LeaveRequest } from "@/features/workspace/data/hrm-leave-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  requests: LeaveRequest[];
  selectedId: string | null;
  onSelect: (request: LeaveRequest) => void;
};

export function LeaveTable({ requests, selectedId, onSelect }: Props) {
  if (requests.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No leave requests match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Request</th>
            <th className="hidden px-4 py-3 md:table-cell">Type</th>
            <th className="px-4 py-3">Dates</th>
            <th className="hidden px-4 py-3 sm:table-cell">Days</th>
            <th className="px-4 py-3">Status</th>
            <th className="w-10 px-2 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {requests.map((row) => {
            const selected = selectedId === row.id;
            const typeLabel = LEAVE_TYPES.find((t) => t.id === row.leaveType)?.label ?? row.leaveType;
            return (
              <tr
                key={row.id}
                onClick={() => onSelect(row)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  selected && "bg-[#191970]/[0.04] dark:bg-blue-950/20",
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{row.employeeName}</p>
                  <p className="text-xs text-slate-500">{row.department}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.requestId}</td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{typeLabel}</td>
                <td className="px-4 py-3 text-slate-600">
                  <span>{row.from}</span>
                  {row.days > 1 ? <span className="text-slate-400"> → {row.to}</span> : null}
                </td>
                <td className="hidden px-4 py-3 tabular-nums text-slate-600 sm:table-cell">{row.days}</td>
                <td className="px-4 py-3">
                  <LeaveStatusBadge status={row.status} />
                </td>
                <td className="px-2 py-3 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
