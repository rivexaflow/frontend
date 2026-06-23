"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { DocumentPreviewDrawer } from "@/features/workspace/components/hrm/documents/document-preview-drawer";
import { DocumentRemindModal } from "@/features/workspace/components/hrm/documents/document-remind-modal";
import { DocumentTypeCard } from "@/features/workspace/components/hrm/documents/document-type-card";
import {
  DocumentsSubmissionsTable,
  PAGE_SIZES,
} from "@/features/workspace/components/hrm/documents/documents-submissions-table";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  computeDocumentTypeStats,
  computeOrgCompliancePct,
  type DocumentTypeStats,
} from "@/features/workspace/data/hrm-documents-ui";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import type { EmployeeDocumentSubmission, HrmDocumentTypeCard } from "@/types/hrm";
import {
  fetchHrDocumentTypeSubmissions,
  fetchHrDocumentTypes,
  remindHrDocumentSubmissions,
  verifyHrDocumentSubmission,
} from "@/lib/api/hrm";
import { cn } from "@/lib/utils/cn";

type SubmissionFilter = "all" | "submitted" | "pending" | "missing";
type ViewTab = "types" | "mandatory";

export function HrmDocumentsView() {
  const companyId = useHrCompanyId();
  const [documentTypes, setDocumentTypes] = useState<HrmDocumentTypeCard[]>([]);
  const [submissionsByType, setSubmissionsByType] = useState<Record<string, EmployeeDocumentSubmission[]>>({});
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<ViewTab>("types");
  const [query, setQuery] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(8);
  const [previewRow, setPreviewRow] = useState<EmployeeDocumentSubmission | null>(null);
  const [remindOpen, setRemindOpen] = useState(false);
  const [remindSending, setRemindSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTypes = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const types = await fetchHrDocumentTypes(companyId);
      setDocumentTypes(types);
      const results = await Promise.all(
        types.map(async (t) => {
          const rows = await fetchHrDocumentTypeSubmissions(companyId, t.id).catch(() => []);
          return [t.id, rows] as const;
        }),
      );
      setSubmissionsByType(Object.fromEntries(results));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load documents.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    void loadTypes();
  }, [loadTypes]);

  const loadTypeSubmissions = useCallback(
    async (typeId: string) => {
      if (!companyId) return;
      setLoadingSubmissions(true);
      try {
        const rows = await fetchHrDocumentTypeSubmissions(companyId, typeId);
        setSubmissionsByType((prev) => ({ ...prev, [typeId]: rows }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load submissions.");
      } finally {
        setLoadingSubmissions(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    if (selectedTypeId && companyId && !submissionsByType[selectedTypeId]) {
      void loadTypeSubmissions(selectedTypeId);
    }
  }, [selectedTypeId, companyId, submissionsByType, loadTypeSubmissions]);

  const selectedType = selectedTypeId
    ? documentTypes.find((t) => t.id === selectedTypeId) ?? null
    : null;

  const typeStatsMap = useMemo(() => {
    const map = new Map<string, DocumentTypeStats>();
    for (const t of documentTypes) {
      map.set(t.id, computeDocumentTypeStats(submissionsByType[t.id] ?? []));
    }
    return map;
  }, [documentTypes, submissionsByType]);

  const allSubmissions = useMemo(
    () => Object.values(submissionsByType).flat(),
    [submissionsByType],
  );

  const orgStats = useMemo(() => {
    const perType = [...typeStatsMap.values()];
    const totalVerified = allSubmissions.filter((s) => s.status === "verified").length;
    const totalPending = allSubmissions.filter((s) => s.status === "pending").length;
    const totalMissing = allSubmissions.filter((s) => !s.submitted).length;
    const compliancePct = computeOrgCompliancePct(perType);
    return { totalVerified, totalPending, totalMissing, compliancePct };
  }, [allSubmissions, typeStatsMap]);

  const visibleTypes = useMemo(() => {
    if (viewTab === "mandatory") return documentTypes.filter((t) => t.mandatory);
    return documentTypes;
  }, [documentTypes, viewTab]);

  const filteredSubmissions = useMemo(() => {
    if (!selectedTypeId) return [];
    const rows = submissionsByType[selectedTypeId] ?? [];
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (submissionFilter === "submitted" && !row.submitted) return false;
      if (submissionFilter === "pending" && row.status !== "pending") return false;
      if (submissionFilter === "missing" && row.submitted) return false;
      if (q && !`${row.employeeName} ${row.employeeCode} ${row.department}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [selectedTypeId, submissionsByType, query, submissionFilter]);

  const handleVerify = async (row: EmployeeDocumentSubmission, status: "verified" | "rejected") => {
    if (!companyId || !row.submissionId) return;
    setActionLoading(true);
    try {
      const updated = await verifyHrDocumentSubmission(companyId, row.submissionId, { status });
      setSubmissionsByType((prev) => ({
        ...prev,
        [row.documentTypeId]: (prev[row.documentTypeId] ?? []).map((s) =>
          s.employeeId === row.employeeId ? { ...s, ...updated } : s,
        ),
      }));
      if (previewRow?.employeeId === row.employeeId) setPreviewRow({ ...row, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify document.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemind = async (payload: { employeeIds: string[]; message: string }) => {
    if (!companyId || !selectedTypeId) return;
    setRemindSending(true);
    try {
      await remindHrDocumentSubmissions(companyId, {
        documentTypeId: selectedTypeId,
        employeeIds: payload.employeeIds,
        message: payload.message,
      });
    } catch (err) {
      throw err instanceof Error ? err : new Error("Could not send reminders.");
    } finally {
      setRemindSending(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredSubmissions.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
    setPreviewRow(null);
  }, [selectedTypeId, query, submissionFilter, pageSize]);

  const selectedStats = selectedType ? typeStatsMap.get(selectedType.id) : null;
  const compliancePct =
    selectedStats && selectedStats.total > 0
      ? Math.round((selectedStats.submitted / selectedStats.total) * 100)
      : 0;

  const mandatoryCount = documentTypes.filter((t) => t.mandatory).length;

  return (
    <div className="pb-8">
      <CrmShell>
        <HrmCompactBanner
          title="Documents"
          subtitle="Mandatory uploads · HR verification · compliance tracking"
          stats={[
            { label: "Types", value: documentTypes.length },
            { label: "Verified", value: orgStats.totalVerified, tone: "success" },
            { label: "Pending", value: orgStats.totalPending, tone: "warning" },
            { label: "Missing", value: orgStats.totalMissing, tone: "danger" },
          ]}
          actions={
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                void loadTypes();
              }}
              disabled={refreshing}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
              Refresh
            </button>
          }
        />

        {!selectedType ? (
          <HrmPanelTabs
            tabs={[
              { id: "types" as const, label: "All types", count: documentTypes.length },
              { id: "mandatory" as const, label: "Mandatory", count: mandatoryCount },
            ]}
            active={viewTab}
            onChange={setViewTab}
          />
        ) : null}

        <div className="space-y-4 p-3 md:p-4">
          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {!selectedType ? (
            <>
              <OrgChartStatStrip
                stats={[
                  {
                    label: "Org compliance",
                    value: `${orgStats.compliancePct}%`,
                    hint: "Verified submissions",
                    icon: ShieldCheck,
                    tone: "emerald",
                  },
                  {
                    label: "Pending review",
                    value: orgStats.totalPending,
                    hint: "Awaiting HR",
                    icon: Clock,
                    tone: "amber",
                  },
                  {
                    label: "Missing uploads",
                    value: orgStats.totalMissing,
                    hint: "Action needed",
                    icon: XCircle,
                    tone: "amber",
                  },
                ]}
              />

              {orgStats.totalMissing > 0 ? (
                <div className="flex items-start gap-2 rounded-xl border border-[#2277ff]/15 bg-[#2277ff]/[0.04] px-4 py-3 text-sm text-slate-600">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#2277ff]" />
                  <p>
                    <strong className="font-semibold text-slate-800">{orgStats.totalMissing} submissions missing</strong>{" "}
                    across the org. Open a document type to send reminders or review uploads.
                  </p>
                </div>
              ) : null}

              <CrmPanel>
                <CrmPanelHead
                  title="Document types"
                  subtitle="Click a type to review employee submissions and verify uploads"
                />
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading document types…
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {visibleTypes.map((type) => (
                        <DocumentTypeCard
                          key={type.id}
                          type={type}
                          stats={typeStatsMap.get(type.id) ?? { total: 0, submitted: 0, verified: 0, pending: 0, missing: 0 }}
                          onSelect={() => setSelectedTypeId(type.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CrmPanel>
            </>
          ) : (
            <CrmPanel>
              <div className="border-b border-slate-100 px-4 py-4 md:px-5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTypeId(null);
                    setQuery("");
                    setSubmissionFilter("all");
                    setPreviewRow(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#191970] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All document types
                </button>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedType.title}</h2>
                    <p className="mt-0.5 max-w-xl text-sm text-slate-500">{selectedType.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRemindOpen(true)}
                      disabled={actionLoading}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Bell className="h-3.5 w-3.5" />
                      Send reminders
                    </button>
                    <div className="rounded-xl border border-[#191970]/15 bg-[#191970]/[0.04] px-4 py-2.5 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Compliance</p>
                      <p className="text-2xl font-bold tabular-nums text-[#191970]">{compliancePct}%</p>
                      <p className="text-[11px] text-slate-500">
                        {selectedStats?.submitted ?? 0} of {selectedStats?.total ?? 0} submitted
                      </p>
                    </div>
                  </div>
                </div>

                {selectedStats ? (
                  <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-slate-600">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {selectedStats.verified} verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                      <Clock className="h-3.5 w-3.5" />
                      {selectedStats.pending} pending
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
                      <XCircle className="h-3.5 w-3.5" />
                      {selectedStats.missing} missing
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative min-w-0 flex-1 lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search employee, ID, department…"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { id: "all" as const, label: "All" },
                        { id: "submitted" as const, label: "Submitted" },
                        { id: "pending" as const, label: "Pending" },
                        { id: "missing" as const, label: "Not submitted" },
                      ] as const
                    ).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSubmissionFilter(f.id)}
                        className={cn(
                          "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                          submissionFilter === f.id
                            ? "bg-[#191970] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <DocumentsSubmissionsTable
                  rows={pageRows}
                  totalRows={filteredSubmissions.length}
                  loading={loadingSubmissions}
                  actionLoading={actionLoading}
                  page={safePage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  previewEmployeeId={previewRow?.employeeId ?? null}
                  onPreview={setPreviewRow}
                  onVerify={handleVerify}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            </CrmPanel>
          )}
        </div>
      </CrmShell>

      <DocumentPreviewDrawer
        open={!!previewRow}
        companyId={companyId}
        row={previewRow}
        type={selectedType}
        actionLoading={actionLoading}
        onClose={() => setPreviewRow(null)}
        onVerify={handleVerify}
      />

      <DocumentRemindModal
        open={remindOpen}
        type={selectedType}
        submissions={selectedTypeId ? submissionsByType[selectedTypeId] ?? [] : []}
        sending={remindSending}
        onClose={() => setRemindOpen(false)}
        onSend={handleRemind}
      />
    </div>
  );
}
