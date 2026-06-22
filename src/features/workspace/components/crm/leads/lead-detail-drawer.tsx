"use client";

import { useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  TrendingUp,
  User,
  X,
  XCircle,
} from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import { isTerminalLeadStatus, LEAD_STATUS_LABELS, type LeadRecord, type LeadStatus } from "@/features/workspace/data/crm-demo";

const statusTone = (status: LeadStatus): "blue" | "emerald" | "amber" | "rose" => {
  if (status === "interested" || status === "document_received" || status === "move_to_activation" || status === "qualified") {
    return "emerald";
  }
  if (isTerminalLeadStatus(status)) return "rose";
  if (status === "callback" || status === "document_pending" || status === "not_pickup_call" || status === "nurturing") {
    return "amber";
  }
  return "blue";
};

type Props = {
  lead: LeadRecord | null;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onConvert: () => void;
};

export function LeadDetailDrawer({ lead, onClose, onStatusChange, onConvert }: Props) {
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lead, onClose]);

  if (!lead) return null;

  const isHot = (lead.scoreBand === "A1" || lead.scoreBand === "A2") && !isTerminalLeadStatus(lead.status);

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <aside className="relative z-[1] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{lead.name}</h2>
            <p className="text-sm text-slate-500">
              {lead.title} at {lead.company}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={LEAD_STATUS_LABELS[lead.status]} tone={statusTone(lead.status)} />
            {isHot ? <StatusBadge label="Hot lead" tone="emerald" /> : null}
          </div>

          <dl className="space-y-2.5 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                {lead.email}
              </a>
            </div>
            {lead.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                {lead.phone}
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-slate-400" />
              {lead.country}
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              Came from: {lead.source}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              Owner: {lead.owner}
            </div>
          </dl>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Priority score</p>
            <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{lead.score}</p>
            <p className="mt-1 text-xs text-slate-500">
              Higher scores mean stronger fit and more engagement — follow up sooner.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Activity</p>
            <ul className="mt-2 space-y-1 text-slate-500">
              <li>Last activity: {lead.lastActivity}</li>
              <li>Follow-up: {lead.slaDue}</li>
              <li>First contact: {lead.firstTouchDue}</li>
            </ul>
          </div>
        </div>

        {!isTerminalLeadStatus(lead.status) ? (
          <div className="space-y-2 border-t border-slate-100 p-4 dark:border-slate-800">
            {lead.status === "interested" || lead.status === "ready_to_open_account" || lead.status === "move_to_activation" ? (
              <button
                type="button"
                onClick={onConvert}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <TrendingUp className="h-4 w-4" />
                Open pipeline
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onStatusChange(lead.id, "interested");
                  onConvert();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <TrendingUp className="h-4 w-4" />
                Qualify & create deal
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(lead.id, "interested")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark interested
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(lead.id, "not_interested")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-700"
              >
                <XCircle className="h-4 w-4" />
                Not interested
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
