"use client";

import { useEffect } from "react";
import { Building2, Calendar, DollarSign, Pencil, User, X } from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import {
  DEAL_STAGE_META,
  formatDealValue,
  type DealRecord,
} from "@/features/workspace/data/deals-demo";

type Props = {
  deal: DealRecord | null;
  onClose: () => void;
  onEdit: (deal: DealRecord) => void;
};

export function DealDetailDrawer({ deal, onClose, onEdit }: Props) {
  useEffect(() => {
    if (!deal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [deal, onClose]);

  if (!deal) return null;

  const meta = DEAL_STAGE_META[deal.stage];

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <aside className="relative z-[1] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-slate-400">{deal.reference}</p>
            <h2 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{deal.title}</h2>
            <p className="text-sm text-slate-500">{deal.company}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={meta.label} tone={meta.tone} />
            <StatusBadge
              label={deal.priority.charAt(0).toUpperCase() + deal.priority.slice(1) + " priority"}
              tone={deal.priority === "high" ? "rose" : deal.priority === "medium" ? "amber" : "slate"}
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deal value</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {formatDealValue(deal.value, deal.currency)}
            </p>
            <p className="mt-1 text-sm text-slate-500">{deal.probability}% weighted probability</p>
          </div>

          <dl className="space-y-2.5 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span>
                {deal.contact} · Owner {deal.owner}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{deal.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Close {deal.closeDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span>Source · {deal.source}</span>
            </div>
          </dl>

          <p className="text-xs text-slate-400">Last activity · {deal.lastActivity}</p>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onEdit(deal)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12124a]"
          >
            <Pencil className="h-4 w-4" />
            Edit deal
          </button>
        </div>
      </aside>
    </div>
  );
}
