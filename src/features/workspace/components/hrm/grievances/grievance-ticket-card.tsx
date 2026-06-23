"use client";

import { ArrowUpRight, Building2, MessageSquare, Paperclip, Shield } from "lucide-react";

import { GrievanceStatusTracker } from "@/features/workspace/components/hrm/grievances/grievance-status-tracker";
import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import { displayEmployee, type HrmGrievanceTicket } from "@/features/workspace/data/hrm-grievances-demo";
import { cn } from "@/lib/utils/cn";

const PRIORITY_TONE: Record<HrmGrievanceTicket["priority"], "default" | "warning" | "danger"> = {
  low: "default",
  medium: "warning",
  high: "danger",
};

type Props = {
  ticket: HrmGrievanceTicket;
  selected?: boolean;
  onSelect: () => void;
};

export function GrievanceTicketCard({ ticket, selected, onSelect }: Props) {
  const employee = displayEmployee(ticket);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition-all dark:bg-slate-900",
        selected ? "border-[#191970] ring-2 ring-[#191970]/20" : "border-slate-200/90 hover:border-[#2277ff]/30 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[11px] font-bold text-[#191970]">{ticket.id}</span>
            {ticket.anonymous ? (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                <Shield className="h-3 w-3" />
                Anonymous
              </span>
            ) : null}
            <StatusPill label={ticket.priority} tone={PRIORITY_TONE[ticket.priority]} />
          </div>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">{ticket.subject}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{ticket.category}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#2277ff]" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {employee} · {ticket.department}
        </span>
      </div>

      <div className="mt-3 rounded-xl bg-slate-50/80 px-3 py-2 dark:bg-slate-950/40">
        <GrievanceStatusTracker stage={ticket.stage} compact />
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {ticket.comments.length} message{ticket.comments.length === 1 ? "" : "s"}
        </span>
        {ticket.evidence.length > 0 ? (
          <span className="inline-flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            {ticket.evidence.length} file{ticket.evidence.length === 1 ? "" : "s"}
          </span>
        ) : null}
        <span>Filed {ticket.filedAt}</span>
      </div>
    </button>
  );
}
