"use client";

import { BookOpen, ChevronRight, ShieldCheck } from "lucide-react";

import { PolicyStatusBadge } from "@/features/workspace/components/hrm/policies/policy-status-badge";
import {
  categoryMeta,
  policyAckPct,
} from "@/features/workspace/data/hrm-policies-ui";
import type { HrmPolicyRecord } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type Props = {
  policy: HrmPolicyRecord;
  onSelect: () => void;
};

export function PolicyCard({ policy, onSelect }: Props) {
  const meta = categoryMeta(policy.category);
  const ackPct = policyAckPct(policy);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative flex min-h-[240px] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-200",
        meta.surface,
        meta.border,
        "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(25,25,112,0.1)]",
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#2277ff]/5 transition group-hover:bg-[#2277ff]/10" />

      <div className="relative flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            meta.iconBg,
          )}
        >
          <BookOpen className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <PolicyStatusBadge status={policy.status} />
      </div>

      <div className="relative mt-4 min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {meta.label} · v{policy.version}
        </p>
        <h3 className={cn("mt-1 text-base font-bold leading-snug tracking-tight", meta.accent)}>
          {policy.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{policy.summary}</p>
      </div>

      <div className="relative mt-4 rounded-xl bg-white/70 p-3 ring-1 ring-white/80 backdrop-blur-sm">
        {policy.acknowledgmentRequired && policy.status === "published" ? (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">
                <span className="font-bold tabular-nums text-slate-900">{policy.acknowledgedCount}</span>
                <span className="text-slate-400"> / {policy.totalEmployees}</span> acknowledged
              </span>
              <span className="font-bold tabular-nums text-[#191970]">{ackPct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#191970] to-emerald-500 transition-all"
                style={{ width: `${ackPct}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-500">
            Effective {policy.effectiveFrom} · Owner {policy.owner}
          </p>
        )}
      </div>

      <div className="relative mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          {policy.acknowledgmentRequired ? (
            <>
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Ack required
            </>
          ) : (
            "Reference only"
          )}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-[#2277ff] opacity-0 transition group-hover:opacity-100">
          Open policy
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}
