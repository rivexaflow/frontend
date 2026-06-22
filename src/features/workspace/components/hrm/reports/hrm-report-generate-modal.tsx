"use client";

import { FormEvent, useEffect, useState } from "react";
import { FileSpreadsheet, FileText, Loader2, Play, Table2 } from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import {
  REPORT_PERIOD_PRESETS,
  type ReportPeriodPresetId,
} from "@/features/workspace/data/hrm-reports-analytics-demo";
import { HRM_REPORT_CATEGORIES } from "@/features/workspace/data/hrm-reports-demo";
import type { HrmReportFormat, HrmReportTemplate } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

const FORMAT_OPTIONS: {
  id: HrmReportFormat;
  label: string;
  hint: string;
  icon: React.ElementType;
}[] = [
  { id: "csv", label: "CSV", hint: "UTF-8 with BOM · best for imports", icon: Table2 },
  { id: "xlsx", label: "Excel", hint: "Spreadsheet · finance & HR ops", icon: FileSpreadsheet },
  { id: "pdf", label: "PDF", hint: "Formatted report · board packs", icon: FileText },
];

type Props = {
  open: boolean;
  template: HrmReportTemplate | null;
  onClose: () => void;
  onGenerate: (template: HrmReportTemplate, period: string, format: HrmReportFormat) => Promise<void>;
};

export function HrmReportGenerateModal({ open, template, onClose, onGenerate }: Props) {
  const [periodPreset, setPeriodPreset] = useState<ReportPeriodPresetId>("current_month");
  const [customPeriod, setCustomPeriod] = useState("May 2026");
  const [format, setFormat] = useState<HrmReportFormat>("csv");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !template) return;
    setPeriodPreset("current_month");
    setCustomPeriod("May 2026");
    setFormat((template.defaultFormat as HrmReportFormat) || "csv");
    setError(null);
  }, [open, template]);

  if (!template) return null;

  const categoryLabel =
    HRM_REPORT_CATEGORIES.find((c) => c.id === template.category)?.label ?? template.category;

  const resolvedPeriod =
    periodPreset === "custom"
      ? customPeriod.trim()
      : REPORT_PERIOD_PRESETS.find((p) => p.id === periodPreset)?.value ?? customPeriod;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resolvedPeriod) {
      setError("Enter a reporting period.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onGenerate(template, resolvedPeriod, format);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal
      open={open}
      title={`Generate: ${template.name}`}
      description={`${categoryLabel} · ${template.description}`}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-xs font-semibold text-slate-700">Reporting period</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REPORT_PERIOD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPeriodPreset(preset.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  periodPreset === preset.id
                    ? "bg-[#191970] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {periodPreset === "custom" ? (
            <div className="mt-3">
              <FormField label="Custom period label" htmlFor="rpt-custom-period">
                <input
                  id="rpt-custom-period"
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  className={inputClassName}
                  placeholder="e.g. Apr 27 – May 26, 2026"
                />
              </FormField>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Selected: <span className="font-semibold text-slate-700">{resolvedPeriod}</span>
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-700">Export format</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {FORMAT_OPTIONS.map((opt) => {
              const selected = format === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormat(opt.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition",
                    selected
                      ? "border-[#191970]/30 bg-[#191970]/[0.04] ring-2 ring-[#191970]/15"
                      : "border-slate-200 bg-white hover:border-slate-300",
                  )}
                >
                  <Icon className={cn("h-4 w-4", selected ? "text-[#191970]" : "text-slate-400")} />
                  <p className="mt-2 text-sm font-semibold text-slate-900">{opt.label}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{opt.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
          Estimated runtime <strong className="text-slate-800">~{template.estimatedMinutes} min</strong>.
          You&apos;ll be redirected to run history when generation starts. Large payroll exports may take longer.
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Generate report
              </>
            )}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
