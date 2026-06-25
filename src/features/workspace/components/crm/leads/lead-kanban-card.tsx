"use client";

import {
  Bell,
  CalendarDays,
  ClipboardList,
  MoreVertical,
  Phone,
  UserRound,
  Zap,
} from "lucide-react";

import { CrmTooltip } from "@/features/workspace/components/crm/crm-tooltip";
import { SCORE_BAND_META, type LeadRecord } from "@/features/workspace/data/crm-demo";
import { cn } from "@/lib/utils/cn";

const BAND_TAG: Record<LeadRecord["scoreBand"], string> = {
  A1: "CHAMPION",
  A2: "RISING STAR",
  B1: "BUILDER",
  B2: "NURTURE",
  C: "COLD",
};

type Props = {
  lead: LeadRecord;
  isDragging?: boolean;
  onSelect: () => void;
};

function StatCell({
  icon: Icon,
  value,
  tone,
  tooltip,
}: {
  icon: typeof ClipboardList;
  value: string;
  tone: "brand" | "rose" | "sky";
  tooltip: string;
}) {
  const toneClass = {
    brand: "text-[#191970] bg-[#191970]/[0.07] border-transparent dark:text-blue-300 dark:bg-blue-950/30",
    rose: "text-rose-700 bg-rose-50 border-rose-100 dark:bg-rose-950/40 dark:text-rose-350 dark:border-rose-900/30 animate-pulse border",
    sky: "text-sky-700 bg-sky-50 border-transparent dark:text-sky-300 dark:bg-sky-950/30",
  }[tone];

  return (
    <CrmTooltip label={tooltip}>
      <span
        className={cn(
          "inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold tabular-nums transition-all duration-200",
          toneClass,
        )}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
        <span className="truncate">{value}</span>
      </span>
    </CrmTooltip>
  );
}

const scoreGlow: Record<LeadRecord["scoreBand"], string> = {
  A1: "hover:shadow-emerald-500/10 hover:shadow-lg hover:border-emerald-500/30",
  A2: "hover:shadow-blue-500/10 hover:shadow-lg hover:border-blue-500/30",
  B1: "hover:shadow-amber-500/10 hover:shadow-lg hover:border-amber-500/30",
  B2: "hover:shadow-slate-500/10 hover:shadow-md hover:border-slate-500/30",
  C: "hover:shadow-slate-400/5 hover:shadow-sm",
};

export function LeadKanbanCard({ lead, isDragging, onSelect }: Props) {
  const bandMeta = SCORE_BAND_META[lead.scoreBand];
  const slaAlerts = lead.slaStatus === "on_track" ? 0 : 1;
  const touchTarget = Math.max(lead.touchCount, 3);

  return (
    <article
      className={cn(
        "group/card rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_2.5px_rgba(15,23,42,0.05)] transition-all duration-300 ease-out hover:-translate-y-[3.5px] dark:border-slate-700 dark:bg-slate-900",
        scoreGlow[lead.scoreBand],
        isDragging && "rotate-[0.5deg] shadow-xl ring-2 ring-[#2277FF]/30 scale-[1.015]",
        lead.scoreBand === "A1" && "border-l-[3.5px] border-l-[#2277FF]",
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="min-w-0 flex-1 text-left outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[#2277FF]/40"
          >
            <p className="truncate text-[13px] font-bold leading-tight text-slate-900 dark:text-white">
              {lead.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{lead.company}</p>
          </button>

          <div className="flex shrink-0 items-center gap-0.5">
            {lead.phone ? (
              <CrmTooltip label="Click to call">
                <a
                  href={`tel:${lead.phone.replace(/\s/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#191970] text-white transition hover:bg-[#12124a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/50"
                  aria-label={`Call ${lead.name}`}
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={2.2} />
                </a>
              </CrmTooltip>
            ) : (
              <CrmTooltip label="No phone on file">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-300">
                  <Phone className="h-3.5 w-3.5" />
                </span>
              </CrmTooltip>
            )}
            <button
              type="button"
              onClick={onSelect}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Lead actions"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <StatCell
            icon={ClipboardList}
            value={`${lead.touchCount}/${touchTarget}`}
            tone="brand"
            tooltip={`${lead.touchCount} touch points · ${lead.lastActivity}`}
          />
          <StatCell
            icon={Bell}
            value={`${slaAlerts}/1`}
            tone={slaAlerts ? "rose" : "brand"}
            tooltip={
              slaAlerts
                ? `SLA ${lead.slaStatus === "breached" ? "breached" : "at risk"} · ${lead.slaDue}`
                : "SLA on track"
            }
          />
          <StatCell
            icon={CalendarDays}
            value={lead.slaDue.length > 12 ? lead.slaDue.slice(0, 10) : lead.slaDue}
            tone="sky"
            tooltip={`Follow-up · ${lead.firstTouchDue}`}
          />
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <CrmTooltip label={`Responsible: ${lead.owner}`} side="bottom">
            <span className="inline-flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/80 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
              <UserRound className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="truncate">{lead.owner}</span>
            </span>
          </CrmTooltip>
          <CrmTooltip label={`${bandMeta.label} · Score ${lead.score}`} side="bottom">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#191970]/15 bg-[#191970]/[0.06] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#191970]">
              <Zap className="h-3 w-3" />
              {BAND_TAG[lead.scoreBand]}
            </span>
          </CrmTooltip>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] text-slate-400 dark:border-slate-800">
          <span className="truncate">{lead.source}</span>
          <span className="shrink-0 font-medium tabular-nums">{lead.updatedAt}</span>
        </div>
      </div>
    </article>
  );
}
