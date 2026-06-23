"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { HrmReportGenerateModal } from "@/features/workspace/components/hrm/reports/hrm-report-generate-modal";
import { HrmReportRunDetailDrawer } from "@/features/workspace/components/hrm/reports/hrm-report-run-detail-drawer";
import { HrmReportRunsTable } from "@/features/workspace/components/hrm/reports/hrm-report-runs-table";
import { HrmReportTemplateCard } from "@/features/workspace/components/hrm/reports/hrm-report-template-card";
import { HrmReportsAnalyticsPanel } from "@/features/workspace/components/hrm/reports/hrm-reports-analytics-panel";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import { getHrmReportAnalytics } from "@/features/workspace/data/hrm-reports-analytics-demo";
import {
  HRM_REPORT_CATEGORIES,
  type HrmReportCategory,
  type HrmReportFormat,
  type HrmReportRun,
  type HrmReportRunStatus,
  type HrmReportTemplate,
} from "@/features/workspace/data/hrm-reports-demo";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import {
  downloadHrReportRun,
  fetchHrReportRun,
  fetchHrReportRuns,
  fetchHrReportTemplates,
  generateHrReport,
} from "@/lib/api/hrm";
import { downloadHrmReport } from "@/lib/hrm/report-export";
import { cn } from "@/lib/utils/cn";

type Tab = "analytics" | "library" | "history";
type StatusFilter = HrmReportRunStatus | "all";

const DATE_PRESETS = ["30d", "90d", "ytd", "12m"] as const;

export function HrmReportsView() {
  const companyId = useHrCompanyId();
  const analyticsSnapshot = useMemo(() => getHrmReportAnalytics(), []);

  const [tab, setTab] = useState<Tab>("analytics");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HrmReportCategory | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [datePreset, setDatePreset] = useState<(typeof DATE_PRESETS)[number]>("30d");

  const [templates, setTemplates] = useState<HrmReportTemplate[]>([]);
  const [runs, setRuns] = useState<HrmReportRun[]>([]);
  const [generateTemplate, setGenerateTemplate] = useState<HrmReportTemplate | null>(null);
  const [selectedRun, setSelectedRun] = useState<HrmReportRun | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
          setSelectedRun((prev) => {
            if (!prev) return prev;
            const match = updated.find((u) => u.id === prev.id);
            return match ?? prev;
          });
        })
        .catch(() => undefined);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [companyId, runs]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(null), 4000);
  };

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
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q && !`${r.name} ${r.period} ${r.generatedBy}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [runs, query, category, statusFilter]);

  const readyCount = runs.filter((r) => r.status === "ready").length;
  const generatingCount = runs.filter((r) => r.status === "generating").length;

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const handleGenerate = async (
    template: HrmReportTemplate,
    period: string,
    format: HrmReportFormat,
  ) => {
    if (!companyId) return;
    const run = await generateHrReport(companyId, {
      templateId: template.id,
      period,
      format,
    });
    setRuns((prev) => [run, ...prev]);
    setTab("history");
    setSelectedRun(run);
    showSuccess(`Report "${template.name}" generation started.`);
  };

  const handleDownload = async (run: HrmReportRun) => {
    if (!companyId) return;
    setDownloadingId(run.id);
    setError(null);
    try {
      await downloadHrReportRun(companyId, run.id);
      showSuccess(`Downloaded ${run.name}.`);
    } catch {
      downloadHrmReport(run);
      showSuccess(`Downloaded ${run.name} (demo export).`);
    } finally {
      setDownloadingId(null);
    }
  };

  const openGenerateForCategory = (cat: string) => {
    const match = templates.find((t) => t.category === cat);
    if (match) {
      setGenerateTemplate(match);
      setTab("library");
    }
  };

  const handleCategoryChip = (cat: HrmReportCategory | "") => {
    setCategory(cat);
  };

  return (
    <div className="pb-8">
      <CrmShell>
        <HrmCompactBanner
          title="Reports & analytics"
          subtitle="Workforce insights · scheduled exports · compliance packs"
          stats={[
            { label: "Templates", value: templates.length },
            { label: "Ready", value: readyCount, tone: "success" },
            { label: "Running", value: generatingCount, tone: "warning" },
            { label: "Headcount", value: analyticsSnapshot.kpis[0]?.value ?? "—" },
          ]}
          actions={
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
          }
        />

        <HrmPanelTabs
          tabs={[
            { id: "analytics" as const, label: "Analytics" },
            { id: "library" as const, label: "Report library", count: templates.length },
            { id: "history" as const, label: "Run history", count: runs.length },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="space-y-4 p-3 md:p-4">
          {successMessage ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {tab !== "analytics" ? (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1 lg:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tab === "library" ? "Search templates…" : "Search runs…"}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleCategoryChip("")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    category === ""
                      ? "bg-[#191970] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )}
                >
                  All
                </button>
                {HRM_REPORT_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategoryChip(c.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      category === c.id
                        ? "bg-[#191970] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "analytics" ? (
            <HrmReportsAnalyticsPanel
              datePreset={datePreset}
              onDatePresetChange={setDatePreset}
              onGenerateFromInsight={(cat) => openGenerateForCategory(cat)}
            />
          ) : null}

          {tab === "library" ? (
            <>
              <OrgChartStatStrip
                stats={[
                  {
                    label: "Categories",
                    value: HRM_REPORT_CATEGORIES.length,
                    hint: "Report types",
                    icon: BarChart3,
                    tone: "blue",
                  },
                  {
                    label: "Templates",
                    value: templates.length,
                    hint: "Ready to run",
                    icon: FileSpreadsheet,
                    tone: "emerald",
                  },
                  {
                    label: "Exports ready",
                    value: readyCount,
                    hint: "Download now",
                    icon: Download,
                    tone: "amber",
                  },
                ]}
              />

              <CrmPanel>
                <CrmPanelHead
                  title="Report library"
                  subtitle="Pre-built workforce exports — pick a template, set period, and download"
                />
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading templates…
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <p className="py-16 text-center text-sm text-slate-500">
                      No templates match your filters.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredTemplates.map((template) => (
                        <HrmReportTemplateCard
                          key={template.id}
                          template={template}
                          onGenerate={() => setGenerateTemplate(template)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CrmPanel>
            </>
          ) : null}

          {tab === "history" ? (
            <CrmPanel>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 md:px-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Run history</h2>
                  <p className="text-xs text-slate-500">
                    Track generation status and download completed exports
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "all" as const, label: "All" },
                      { id: "ready" as const, label: "Ready" },
                      { id: "generating" as const, label: "Running" },
                      { id: "failed" as const, label: "Failed" },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setStatusFilter(f.id)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                        statusFilter === f.id
                          ? "bg-[#191970] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <HrmReportRunsTable
                rows={filteredRuns}
                loading={loading}
                selectedId={selectedRun?.id ?? null}
                downloadingId={downloadingId}
                onSelect={setSelectedRun}
                onDownload={(run) => void handleDownload(run)}
              />
            </CrmPanel>
          ) : null}
        </div>
      </CrmShell>

      <HrmReportGenerateModal
        open={!!generateTemplate}
        template={generateTemplate}
        onClose={() => setGenerateTemplate(null)}
        onGenerate={handleGenerate}
      />

      <HrmReportRunDetailDrawer
        open={!!selectedRun}
        run={selectedRun}
        downloading={selectedRun ? downloadingId === selectedRun.id : false}
        onClose={() => setSelectedRun(null)}
        onDownload={(run) => void handleDownload(run)}
      />
    </div>
  );
}
