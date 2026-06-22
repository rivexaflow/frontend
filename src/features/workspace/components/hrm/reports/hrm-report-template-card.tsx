"use client";

import {
  Briefcase,
  Clock,
  FileSpreadsheet,
  FileText,
  Play,
  ShieldCheck,
  TrendingDown,
  Users,
} from "lucide-react";

import { HRM_REPORT_CATEGORIES } from "@/features/workspace/data/hrm-reports-demo";
import type { HrmReportCategory, HrmReportFormat, HrmReportTemplate } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const CATEGORY_META: Record<
  HrmReportCategory,
  { icon: React.ElementType; surface: string; border: string; accent: string; iconBg: string }
> = {
  headcount: {
    icon: Users,
    surface: "from-[#eef2ff] via-white to-[#f5f7ff]",
    border: "border-[#c7d2fe]/70 hover:border-[#2277ff]/45",
    accent: "text-[#191970]",
    iconBg: "from-[#191970] to-[#2277ff]",
  },
  attrition: {
    icon: TrendingDown,
    surface: "from-[#fff1f2] via-white to-[#fff5f5]",
    border: "border-rose-200/70 hover:border-rose-400/45",
    accent: "text-rose-900",
    iconBg: "from-rose-500 to-orange-500",
  },
  payroll: {
    icon: Briefcase,
    surface: "from-[#ecfdf5] via-white to-[#f4fdf8]",
    border: "border-emerald-200/70 hover:border-emerald-400/45",
    accent: "text-emerald-900",
    iconBg: "from-emerald-600 to-teal-500",
  },
  attendance: {
    icon: Clock,
    surface: "from-[#f0f9ff] via-white to-[#f8fcff]",
    border: "border-sky-200/70 hover:border-[#0056ff]/45",
    accent: "text-[#0056ff]",
    iconBg: "from-[#2277ff] to-[#0056ff]",
  },
  leave: {
    icon: FileText,
    surface: "from-[#fffbeb] via-white to-[#fffdf5]",
    border: "border-amber-200/70 hover:border-amber-400/45",
    accent: "text-amber-950",
    iconBg: "from-amber-500 to-orange-500",
  },
  compliance: {
    icon: ShieldCheck,
    surface: "from-slate-50 via-white to-slate-50",
    border: "border-slate-200/80 hover:border-slate-400/45",
    accent: "text-slate-800",
    iconBg: "from-slate-600 to-slate-800",
  },
};

const FORMAT_LABEL: Record<HrmReportFormat, string> = {
  csv: "CSV",
  xlsx: "Excel",
  pdf: "PDF",
};

type Props = {
  template: HrmReportTemplate;
  onGenerate: () => void;
};

export function HrmReportTemplateCard({ template, onGenerate }: Props) {
  const category = template.category as HrmReportCategory;
  const meta = CATEGORY_META[category] ?? CATEGORY_META.headcount;
  const Icon = meta.icon;
  const categoryLabel =
    HRM_REPORT_CATEGORIES.find((c) => c.id === category)?.label ?? template.category;
  const format = (template.defaultFormat as HrmReportFormat) || "csv";

  return (
    <article
      className={cn(
        "group relative flex min-h-[220px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-200",
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
          <Icon className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200/80">
          <FileSpreadsheet className="h-3 w-3" />
          {FORMAT_LABEL[format] ?? format}
        </span>
      </div>

      <div className="relative mt-4 min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {categoryLabel}
        </p>
        <h3 className={cn("mt-1 text-base font-bold leading-snug tracking-tight", meta.accent)}>
          {template.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {template.description}
        </p>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">~{template.estimatedMinutes} min to generate</span>
        <button
          type="button"
          onClick={onGenerate}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white opacity-90 transition hover:bg-[#12124a] group-hover:opacity-100"
        >
          <Play className="h-3.5 w-3.5" />
          Generate
        </button>
      </div>
    </article>
  );
}
