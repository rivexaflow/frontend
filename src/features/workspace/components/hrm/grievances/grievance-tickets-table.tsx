"use client";

import { ChevronRight, MessageSquare, Paperclip, Shield } from "lucide-react";

import { GrievanceStatusTracker } from "@/features/workspace/components/hrm/grievances/grievance-status-tracker";
import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { displayEmployee, type HrmGrievanceTicket } from "@/features/workspace/data/hrm-grievances-demo";
import { cn } from "@/lib/utils/cn";

const PRIORITY_TONE: Record<HrmGrievanceTicket["priority"], "default" | "warning" | "danger"> = {
  low: "default",
  medium: "warning",
  high: "danger",
};

type Props = {
  tickets: HrmGrievanceTicket[];
  selectedId: string | null;
  onSelect: (ticket: HrmGrievanceTicket) => void;
};

export function GrievanceTicketsTable({ tickets, selectedId, onSelect }: Props) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
        <p className="text-sm font-medium text-slate-600">No grievances match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className={cn(crm.tableHead, "bg-slate-50/95")}>
              <th className="px-4 py-3 font-bold">Ticket</th>
              <th className="px-4 py-3 font-bold">Subject</th>
              <th className="px-4 py-3 font-bold">Employee</th>
              <th className="px-4 py-3 font-bold">Category</th>
              <th className="px-4 py-3 font-bold">Priority</th>
              <th className="px-4 py-3 font-bold">Progress</th>
              <th className="px-4 py-3 font-bold">Filed</th>
              <th className="w-10 px-2 py-3" aria-hidden />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tickets.map((ticket, i) => (
              <tr
                key={ticket.id}
                onClick={() => onSelect(ticket)}
                className={cn(
                  crm.tableRow,
                  "cursor-pointer",
                  i % 2 === 1 && "bg-slate-50/50",
                  selectedId === ticket.id && "bg-[#191970]/[0.04]",
                )}
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-xs font-bold text-[#191970]">{ticket.id}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{ticket.subject}</p>
                  <div className="mt-1 flex gap-2 text-[11px] text-slate-400">
                    {ticket.comments.length > 0 ? (
                      <span className="inline-flex items-center gap-0.5">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.comments.length}
                      </span>
                    ) : null}
                    {ticket.evidence.length > 0 ? (
                      <span className="inline-flex items-center gap-0.5">
                        <Paperclip className="h-3 w-3" />
                        {ticket.evidence.length}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {ticket.anonymous ? <Shield className="h-3.5 w-3.5 text-slate-400" /> : null}
                    <div>
                      <p className="font-medium text-slate-800">{displayEmployee(ticket)}</p>
                      <p className="text-xs text-slate-500">{ticket.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{ticket.category}</td>
                <td className="px-4 py-3">
                  <StatusPill label={ticket.priority} tone={PRIORITY_TONE[ticket.priority]} />
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-[180px]">
                    <GrievanceStatusTracker stage={ticket.stage} compact />
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">{ticket.filedAt}</td>
                <td className="px-2 py-3 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
