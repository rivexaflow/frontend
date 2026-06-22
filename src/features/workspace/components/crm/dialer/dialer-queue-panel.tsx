"use client";

import { Phone, Search, SkipForward, Zap } from "lucide-react";

import { dialer } from "@/features/workspace/components/crm/dialer/dialer-styles";
import { CrmRecordAvatar } from "@/features/workspace/components/crm/crm-ui-primitives";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import type { DialerContact } from "@/features/workspace/data/crm-dialer-demo";
import { SCORE_BAND_META } from "@/features/workspace/data/crm-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  queue: DialerContact[];
  activeContactId?: string;
  powerDial: boolean;
  onPowerDialChange: (value: boolean) => void;
  onCall: (contact: DialerContact) => void;
  onSkip: (contactId: string) => void;
  onStartSession: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  disabled?: boolean;
};

const STATUS_LABEL: Record<DialerContact["queueStatus"], string> = {
  pending: "Ready",
  calling: "Calling",
  completed: "Done",
  skipped: "Skipped",
  no_answer: "No answer",
};

const BAND_CLASS: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20",
  blue: "bg-blue-500/15 text-blue-700 ring-blue-500/20",
  amber: "bg-amber-500/15 text-amber-700 ring-amber-500/20",
  slate: "bg-slate-500/10 text-slate-600 ring-slate-500/15",
};

export function DialerQueuePanel({
  queue,
  activeContactId,
  powerDial,
  onPowerDialChange,
  onCall,
  onSkip,
  onStartSession,
  search,
  onSearchChange,
  disabled,
}: Props) {
  const q = search.trim().toLowerCase();
  const visible = queue.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.phone.includes(q),
  );
  const pending = queue.filter((c) => c.queueStatus === "pending").length;
  const completed = queue.filter((c) => c.queueStatus === "completed").length;
  const progress = queue.length > 0 ? Math.round(((completed + queue.filter((c) => c.queueStatus === "skipped" || c.queueStatus === "no_answer").length) / queue.length) * 100) : 0;

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950/30 dark:to-slate-900">
      <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Call queue</p>
            <p className="mt-0.5 text-xs text-slate-500">{pending} leads remaining</p>
          </div>
          <button
            type="button"
            disabled={disabled || pending === 0}
            onClick={onStartSession}
            className={cn(crm.btnPrimarySm, "shadow-md shadow-[#191970]/20")}
          >
            <Phone className="h-3.5 w-3.5" />
            Start session
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <span>Session progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#191970] to-indigo-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onPowerDialChange(!powerDial)}
          className={cn(
            "mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition",
            powerDial
              ? "border-[#191970]/25 bg-[#191970]/[0.06]"
              : "border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900",
          )}
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg",
                powerDial ? "bg-[#191970] text-white" : "bg-slate-100 text-slate-500 dark:bg-slate-800",
              )}
            >
              <Zap className="h-3.5 w-3.5" />
            </span>
            <span>
              <span className="block text-xs font-semibold text-slate-900 dark:text-white">Power dial</span>
              <span className="block text-[10px] text-slate-500">Auto-dial next after disposition</span>
            </span>
          </span>
          <span
            className={cn(
              "relative h-5 w-9 shrink-0 rounded-full transition",
              powerDial ? "bg-[#191970]" : "bg-slate-200 dark:bg-slate-700",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition",
                powerDial ? "left-[18px]" : "left-0.5",
              )}
            />
          </span>
        </button>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter queue…"
            className={cn(crm.inputSm, "w-full pl-9")}
          />
        </div>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {visible.map((contact, index) => {
          const band = SCORE_BAND_META[contact.scoreBand];
          const isActive = contact.id === activeContactId;
          const isPending = contact.queueStatus === "pending";
          return (
            <li key={contact.id}>
              <div
                className={cn(
                  dialer.queueItem,
                  isActive && dialer.queueItemActive,
                  !isPending && "opacity-55",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800">
                    {index + 1}
                  </span>
                  <CrmRecordAvatar name={contact.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {contact.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">{contact.company}</p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset",
                          BAND_CLASS[band.tone] ?? BAND_CLASS.slate,
                        )}
                      >
                        {contact.scoreBand}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">{contact.phone}</p>
                    {isPending ? (
                      <div className="mt-2 flex gap-1.5 opacity-100 transition group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onCall(contact)}
                          className={cn(
                            crm.btnPrimarySm,
                            "h-7 flex-1 shadow-sm shadow-[#191970]/15",
                          )}
                        >
                          <Phone className="h-3 w-3" />
                          Call now
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onSkip(contact.id)}
                          className={cn(crm.btnSecondarySm, "h-7 w-8 px-0")}
                          aria-label="Skip lead"
                        >
                          <SkipForward className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {STATUS_LABEL[contact.queueStatus]}
                        {contact.lastCalled ? ` · ${contact.lastCalled}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
            No leads match your filter.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
