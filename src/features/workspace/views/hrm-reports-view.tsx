"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  Loader2,
  Play,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import {
  HRM_REPORT_CATEGORIES,
  type HrmReportCategory,
  type HrmReportFormat,
  type HrmReportRun,
  type HrmReportRunStatus,
  type HrmReportTemplate,
} from "@/features/workspace/data/hrm-reports-demo";
import {
  downloadHrReportRun,
  fetchHrReportRun,
  fetchHrReportRuns,
  fetchHrReportTemplates,
  generateHrReport,
} from "@/lib/api/hrm";
import { downloadHrmReport } from "@/lib/hrm/report-export";
import { cn } from "@/lib/utils/cn";

type Tab = "templates" | "history";

const STATUS_STYLES: Record<HrmReportRunStatus, string> = {
  ready: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  generating: "bg-amber-50 text-amber-700 ring-amber-600/15",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/15",
};

function RunStatusBadge({ status }: { status: HrmReportRunStatus }) {
  const label = status === "ready" ? "Ready" : status === "generating" ? "Generating" : "Failed";
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STATUS_STYLES[status])}>
      {label}
    </span>
  );
}

const FORMAT_LABELS: Record<HrmReportFormat, string> = {
  csv: "CSV (UTF-8)",
  xlsx: "Excel (.xls)",
  pdf: "PDF / HTML report",
};

export function HrmReportsView() {
  const companyId = useHrCompanyId();
  const [tab, setTab] = useState<Tab>("templates");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HrmReportCategory | "">("");
  const [templates, setTemplates] = useState<HrmReportTemplate[]>([]);
  const [runs, setRuns] = useState<HrmReportRun[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [generateTemplate, setGenerateTemplate] = useState<HrmReportTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [templateList, runList] = await Promise.all([
        fetchHrReportTemplates(companyId),
        fetchHrReportRuns(companyId, { category: category || undefined }),
      ]);
      setTemplates(templateList);
      setRuns(runList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reports.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, category]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  useEffect(() => {
    if (!companyId) return;
    const pending = runs.filter((r) => r.status === "generating");
    if (pending.length === 0) return;

    const interval = window.setInterval(() => {
      void Promise.all(pending.map((r) => fetchHrReportRun(companyId, r.id)))
        .then((updated) => {
          setRuns((prev) =>
            prev.map((run) => {
              const match = updated.find((u) => u.id === run.id);
              return match ?? run;
            }),
          );
        })
        .catch(() => undefined);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [companyId, runs]);

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (category && t.category !== category) return false;
      if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [templates, query, category]);

  const filteredRuns = useMemo(() => {
    const q = query.trim().toLowerCase();
    return runs.filter((r) => {
      if (category && r.category !== category) return false;
      if (q && !`${r.name} ${r.period} ${r.generatedBy}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [runs, query, category]);

  const readyCount = runs.filter((r) => r.status === "ready").length;

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const handleGenerate = async (template: HrmReportTemplate, period: string, format: HrmReportFormat) => {
    if (!companyId) return;
    try {
      const run = await generateHrReport(companyId, {
        templateId: template.id,
        period,
        format,
      });
      setRuns((prev) => [run, ...prev]);
      setTab("history");
      setExpandedRunId(run.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report.");
      throw err;
    }
  };

  const handleDownload = async (run: HrmReportRun) => {
    if (!companyId) return;
    setDownloadingId(run.id);
    setError(null);
    try {
      await downloadHrReportRun(companyId, run.id);
    } catch {
      downloadHrmReport(run);
    } finally {
      setDownloadingId(null);
    }
  };

  const toggleExpand = (runId: string) => {
    setExpandedRunId((prev) => (prev === runId ? null : runId));
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HR reports</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Headcount, payroll, attendance, leave, and compliance exports — download from generated runs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Templates", value: templates.length, icon: FileSpreadsheet },
              { label: "Generated", value: runs.length, icon: BarChart3 },
              { label: "Ready", value: readyCount, icon: Download },
              { label: "Categories", value: HRM_REPORT_CATEGORIES.length, icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3 border-b border-slate-200/90 px-4 py-4 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
              {(["templates", "history"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium capitalize transition",
                    tab === t ? "bg-[#191970] text-white" : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative min-w-0 flex-1 lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports…" className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950" />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value as HrmReportCategory | "")} className="h-9 rounded-lg border border-slate-200 px-2.5 text-sm dark:border-slate-700 dark:bg-slate-950">
              <option value="">All categories</option>
              {HRM_REPORT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading reports…
          </div>
        ) : tab === "templates" ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{template.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{HRM_REPORT_CATEGORIES.find((c) => c.id === template.category)?.label ?? template.category}</p>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">{template.defaultFormat}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{template.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">~{template.estimatedMinutes} min</span>
                  <button type="button" onClick={() => setGenerateTemplate(template)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a]">
                    <Play className="h-3.5 w-3.5" /> Generate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="w-8 px-4 py-3" />
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Generated</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRuns.map((run) => {
                  const expanded = expandedRunId === run.id;
                  return (
                    <ReportHistoryRow
                      key={run.id}
                      run={run}
                      expanded={expanded}
                      downloading={downloadingId === run.id}
                      onToggle={() => toggleExpand(run.id)}
                      onDownload={() => void handleDownload(run)}
                    />
                  );
                })}
              </tbody>
            </table>
            {filteredRuns.length === 0 ? (
              <p className="px-4 py-12 text-center text-sm text-slate-500">No report runs match your filters.</p>
            ) : null}
          </div>
        )}
      </div>

      {generateTemplate ? (
        <GenerateReportModal
          template={generateTemplate}
          onClose={() => setGenerateTemplate(null)}
          onGenerate={handleGenerate}
        />
      ) : null}
    </div>
  );
}

function ReportHistoryRow({
  run,
  expanded,
  downloading,
  onToggle,
  onDownload,
}: {
  run: HrmReportRun;
  expanded: boolean;
  downloading: boolean;
  onToggle: () => void;
  onDownload: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-slate-50/60">
        <td className="px-4 py-3">
          <button type="button" onClick={onToggle} className="rounded p-1 text-slate-400 hover:bg-slate-100" aria-label={expanded ? "Collapse" : "Expand"}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </td>
        <td className="px-4 py-3 font-medium text-slate-900">{run.name}</td>
        <td className="px-4 py-3 text-slate-600">{run.period}</td>
        <td className="px-4 py-3 text-slate-500">{run.generatedAt}</td>
        <td className="px-4 py-3 uppercase text-slate-500">{run.format}</td>
        <td className="px-4 py-3"><RunStatusBadge status={run.status} /></td>
        <td className="px-4 py-3 text-right">
          {run.status === "ready" ? (
            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Download
            </button>
          ) : run.status === "generating" ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
            </span>
          ) : (
            <span className="text-xs text-rose-500">Failed</span>
          )}
        </td>
      </tr>
      {expanded ? (
        <tr className="bg-slate-50/50">
          <td colSpan={7} className="px-4 py-4">
            <ReportRunDetailInline run={run} downloading={downloading} onDownload={onDownload} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function ReportRunDetailInline({
  run,
  downloading,
  onDownload,
}: {
  run: HrmReportRun;
  downloading: boolean;
  onDownload: () => void;
}) {
  const format = (run.format as HrmReportFormat) in FORMAT_LABELS ? (run.format as HrmReportFormat) : "csv";

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Generated by", value: run.generatedBy },
          { label: "Category", value: HRM_REPORT_CATEGORIES.find((c) => c.id === run.category)?.label ?? run.category },
          { label: "Export format", value: FORMAT_LABELS[format] },
          { label: "File size", value: run.fileSize ?? "—" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>
      {run.recordCount != null ? (
        <p className="mt-3 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{run.recordCount}</span> records included in this export.
        </p>
      ) : null}
      {run.status === "generating" ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating report — status updates automatically.
        </div>
      ) : run.status === "ready" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download {String(run.format).toUpperCase()}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-rose-600">Report generation failed. Try generating again with a different period or format.</p>
      )}
    </div>
  );
}

function GenerateReportModal({
  template,
  onClose,
  onGenerate,
}: {
  template: HrmReportTemplate;
  onClose: () => void;
  onGenerate: (template: HrmReportTemplate, period: string, format: HrmReportFormat) => Promise<void>;
}) {
  const [period, setPeriod] = useState("May 2026");
  const [format, setFormat] = useState<HrmReportFormat>(
    (template.defaultFormat as HrmReportFormat) || "csv",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onGenerate(template, period.trim(), format);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal open title={`Generate: ${template.name}`} description={template.description} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Reporting period" htmlFor="rpt-period">
          <input id="rpt-period" value={period} onChange={(e) => setPeriod(e.target.value)} className={inputClassName} placeholder="e.g. May 2026" />
        </FormField>
        <FormField label="Export format" htmlFor="rpt-format">
          <select id="rpt-format" value={format} onChange={(e) => setFormat(e.target.value as HrmReportFormat)} className={selectClassName}>
            <option value="csv">CSV (UTF-8 with BOM)</option>
            <option value="xlsx">Excel spreadsheet (.xls)</option>
            <option value="pdf">PDF report</option>
          </select>
        </FormField>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {submitting ? "Starting…" : "Generate"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
