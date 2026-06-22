"use client";

import {
  Award,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  GraduationCap,
  Shield,
  XCircle,
} from "lucide-react";

import type { DocumentTypeStats } from "@/features/workspace/data/hrm-documents-ui";
import { getCategoryLabel, paletteForCategory } from "@/features/workspace/data/hrm-documents-ui";
import type { HrmDocumentTypeCard } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const CATEGORY_ICON: Record<string, React.ElementType> = {
  id_proof: Shield,
  contract: Briefcase,
  offer_letter: FileText,
  certificate: GraduationCap,
  policy_ack: Award,
  other: FileText,
};

type Props = {
  type: HrmDocumentTypeCard;
  stats: DocumentTypeStats;
  onSelect: () => void;
};

export function DocumentTypeCard({ type, stats, onSelect }: Props) {
  const palette = paletteForCategory(type.category);
  const Icon = CATEGORY_ICON[type.category] ?? FileText;
  const pct = stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0;
  const verifyPct = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

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
        "group relative flex min-h-[280px] cursor-pointer flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-200",
        palette.surface,
        palette.border,
        "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(25,25,112,0.1)]",
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#2277ff]/5 transition group-hover:bg-[#2277ff]/10" />

      <div className="relative flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            palette.icon,
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
        {type.mandatory ? (
          <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700 ring-1 ring-rose-500/20">
            Mandatory
          </span>
        ) : (
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200/80">
            Optional
          </span>
        )}
      </div>

      <div className="relative mt-4 min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {getCategoryLabel(type.category)}
        </p>
        <h3 className={cn("mt-1 text-base font-bold leading-snug tracking-tight", palette.accent)}>
          {type.title}
        </h3>
        {type.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{type.description}</p>
        ) : null}
      </div>

      <div className="relative mt-4 rounded-xl bg-white/70 p-3 ring-1 ring-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">
            <span className="font-bold tabular-nums text-slate-900">{stats.submitted}</span>
            <span className="text-slate-400"> / {stats.total}</span> submitted
          </span>
          <span className="font-bold tabular-nums text-[#191970]">{pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#191970] to-[#2277ff] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>Verified {verifyPct}%</span>
          {type.renewalMonths ? <span>Renews every {type.renewalMonths} mo</span> : null}
        </div>
      </div>

      <div className="relative mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
        <StatChip icon={CheckCircle2} value={stats.verified} label="verified" tone="emerald" />
        <StatChip icon={Clock} value={stats.pending} label="pending" tone="amber" />
        <StatChip icon={XCircle} value={stats.missing} label="missing" tone="rose" />
      </div>

      <div className="relative mt-3 flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2277ff] opacity-0 transition group-hover:opacity-100">
          Review submissions
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}

function StatChip({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  tone: "emerald" | "amber" | "rose";
}) {
  const colors = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-white/60 px-2 py-0.5 ring-1 ring-slate-200/60">
      <Icon className={cn("h-3 w-3", colors[tone])} />
      <span className="font-bold tabular-nums text-slate-800">{value}</span>
      <span className="text-slate-400">{label}</span>
    </span>
  );
}
