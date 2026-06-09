"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import type {
  EmployeeDocumentSubmission,
  HrmDocumentStatus,
  HrmDocumentTypeCard,
} from "@/types/hrm";
import {
  fetchHrDocumentPreviewUrl,
  fetchHrDocumentTypeSubmissions,
  fetchHrDocumentTypes,
  remindHrDocumentSubmissions,
  verifyHrDocumentSubmission,
} from "@/lib/api/hrm";
import { cn } from "@/lib/utils/cn";

type TypeStats = {
  total: number;
  submitted: number;
  verified: number;
  pending: number;
  missing: number;
};

function computeTypeStats(submissions: EmployeeDocumentSubmission[]): TypeStats {
  const total = submissions.length;
  const submitted = submissions.filter((s) => s.submitted).length;
  const verified = submissions.filter((s) => s.status === "verified").length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const missing = submissions.filter((s) => !s.submitted || s.status === "not_submitted").length;
  return { total, submitted, verified, pending, missing };
}

type SubmissionFilter = "all" | "submitted" | "pending" | "missing";
const PAGE_SIZES = [8, 12, 20] as const;

const STATUS_LABEL: Record<HrmDocumentStatus, string> = {
  verified: "Verified",
  pending: "Pending review",
  expired: "Expired",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

const STATUS_STYLE: Record<HrmDocumentStatus, string> = {
  verified: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/15",
  expired: "bg-orange-50 text-orange-700 ring-orange-600/15",
  rejected: "bg-rose-50 text-rose-700 ring-rose-600/15",
  not_submitted: "bg-slate-100 text-slate-500 ring-slate-500/15",
};

function SubmissionBadge({ status }: { status: HrmDocumentStatus }) {
  return (
    <span className={cn("inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function maskId(seed: string): string {
  const digits = seed.replace(/\D/g, "").padEnd(4, "0").slice(0, 4);
  return `XXXX-XXXX-${digits}12`;
}

export function HrmDocumentsView() {
  const companyId = useHrCompanyId();
  const [documentTypes, setDocumentTypes] = useState<HrmDocumentTypeCard[]>([]);
  const [submissionsByType, setSubmissionsByType] = useState<Record<string, EmployeeDocumentSubmission[]>>({});
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState<SubmissionFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(8);
  const [previewRow, setPreviewRow] = useState<EmployeeDocumentSubmission | null>(null);
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

  const typeStats = useMemo(() => {
    const map = new Map<string, TypeStats>();
    for (const t of documentTypes) {
      map.set(t.id, computeTypeStats(submissionsByType[t.id] ?? []));
    }
    return map;
  }, [documentTypes, submissionsByType]);

  const allSubmissions = useMemo(
    () => Object.values(submissionsByType).flat(),
    [submissionsByType],
  );
  const totalVerified = allSubmissions.filter((s) => s.status === "verified").length;
  const totalMissing = allSubmissions.filter((s) => !s.submitted).length;

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

  const handleRemind = async (typeId: string) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      await remindHrDocumentSubmissions(companyId, { documentTypeId: typeId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reminders.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredSubmissions.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
    setPreviewRow(null);
  }, [selectedTypeId, query, submissionFilter, pageSize]);

  const stats = selectedType ? typeStats.get(selectedType.id) : null;

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Documents</h1>
            <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
              Track mandatory uploads and preview employee submissions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { label: "Types", value: documentTypes.length },
              { label: "Verified", value: totalVerified },
              { label: "Missing", value: totalMissing },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-sm text-slate-500">{stat.label}</span>
                <span className="text-base font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                void loadTypes();
              }}
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
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading document types…
          </div>
        ) : !selectedType ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {documentTypes.map((type) => (
              <DocumentTypeCard
                key={type.id}
                type={type}
                stats={typeStats.get(type.id) ?? { total: 0, submitted: 0, verified: 0, pending: 0, missing: 0 }}
                onSelect={() => setSelectedTypeId(type.id)}
              />
            ))}
          </div>
        ) : (
          <CompliancePanel
            companyId={companyId}
            type={selectedType}
            stats={stats!}
            loading={loadingSubmissions}
            actionLoading={actionLoading}
            query={query}
            onQueryChange={setQuery}
            submissionFilter={submissionFilter}
            onFilterChange={setSubmissionFilter}
            rows={pageRows}
            totalRows={filteredSubmissions.length}
            page={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPageChange={setPage}
            previewRow={previewRow}
            onPreview={setPreviewRow}
            onVerify={handleVerify}
            onRemind={() => void handleRemind(selectedType.id)}
            onBack={() => {
              setSelectedTypeId(null);
              setQuery("");
              setSubmissionFilter("all");
              setPreviewRow(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function DocumentTypeCard({
  type,
  stats,
  onSelect,
}: {
  type: HrmDocumentTypeCard;
  stats: TypeStats;
  onSelect: () => void;
}) {
  const pct = stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group rounded-xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition hover:border-[#191970]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#191970]/10 text-[#191970]">
          <FileText className="h-6 w-6" />
        </div>
        {type.mandatory ? (
          <span className="rounded-md bg-rose-50 px-2.5 py-1 text-sm font-semibold text-rose-700 ring-1 ring-rose-600/15">
            Mandatory
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-[#191970] dark:text-white">{type.title}</h3>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            <span className="font-semibold text-slate-900 dark:text-white">{stats.submitted}</span> / {stats.total} submitted
          </span>
          <span className="font-semibold">{pct}%</span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-[#191970] transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{stats.verified} verified</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-amber-500" />{stats.pending} pending</span>
          <span className="inline-flex items-center gap-1.5"><XCircle className="h-4 w-4 text-rose-500" />{stats.missing} missing</span>
        </div>
      </div>
    </button>
  );
}

function CompliancePanel({
  companyId,
  type,
  stats,
  loading,
  actionLoading,
  query,
  onQueryChange,
  submissionFilter,
  onFilterChange,
  rows,
  totalRows,
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPageChange,
  previewRow,
  onPreview,
  onVerify,
  onRemind,
  onBack,
}: {
  companyId: string | null;
  type: HrmDocumentTypeCard;
  stats: TypeStats;
  loading: boolean;
  actionLoading: boolean;
  query: string;
  onQueryChange: (v: string) => void;
  submissionFilter: SubmissionFilter;
  onFilterChange: (v: SubmissionFilter) => void;
  rows: EmployeeDocumentSubmission[];
  totalRows: number;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageSizeChange: (v: (typeof PAGE_SIZES)[number]) => void;
  onPageChange: (v: number) => void;
  previewRow: EmployeeDocumentSubmission | null;
  onPreview: (row: EmployeeDocumentSubmission | null) => void;
  onVerify: (row: EmployeeDocumentSubmission, status: "verified" | "rejected") => void;
  onRemind: () => void;
  onBack: () => void;
}) {
  const pct = stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0;
  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows);

  return (
    <div>
      <div className="border-b border-slate-200/90 px-5 py-5 dark:border-slate-800">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-base font-medium text-[#191970] hover:underline">
          <ArrowLeft className="h-5 w-5" /> All document types
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{type.title}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRemind}
              disabled={actionLoading}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Bell className="h-4 w-4" />
              Send reminders
            </button>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-sm font-medium text-slate-500">Compliance</p>
              <p className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{pct}%</p>
              <p className="text-sm text-slate-600">{stats.submitted} of {stats.total} employees</p>
            </div>
          </div>
        </div>
      </div>

      {previewRow ? (
        <DocumentPreviewPanel
          companyId={companyId}
          row={previewRow}
          type={type}
          onClose={() => onPreview(null)}
          onVerify={onVerify}
          actionLoading={actionLoading}
        />
      ) : null}

      <div className="flex flex-col gap-3 border-b border-slate-200/90 px-5 py-4 lg:flex-row lg:items-center dark:border-slate-800">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search employee, ID, department…"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-base outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
        <div className="flex flex-wrap gap-2">
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
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition",
                submissionFilter === f.id
                  ? "bg-[#191970] text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-base">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-4">Employee</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Location</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Submitted</th>
              <th className="px-5 py-4">File</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-base text-slate-500">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-base text-slate-500">No employees match this filter.</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={`${row.employeeId}-${row.documentTypeId}`}
                  className={cn(
                    "hover:bg-slate-50/60 dark:hover:bg-slate-900/40",
                    previewRow?.employeeId === row.employeeId ? "bg-[#191970]/5" : "",
                  )}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 dark:text-white">{row.employeeName}</p>
                    <p className="font-mono text-sm text-slate-500">{row.employeeCode}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{row.department}</td>
                  <td className="px-5 py-4 text-slate-600">{row.location}</td>
                  <td className="px-5 py-4"><SubmissionBadge status={row.status} /></td>
                  <td className="px-5 py-4 text-slate-600">{row.submittedAt ?? "—"}</td>
                  <td className="px-5 py-4">
                    {row.fileName ? (
                      <span className="font-mono text-sm text-slate-600">{row.fileName}</span>
                    ) : (
                      <span className="text-sm font-medium text-rose-600">Awaiting upload</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {row.submitted && row.fileName ? (
                        <button
                          type="button"
                          onClick={() => onPreview(row)}
                          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a]"
                        >
                          <Eye className="h-4 w-4" /> Preview
                        </button>
                      ) : null}
                      {row.status === "pending" && row.submissionId ? (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onVerify(row, "verified")}
                            className="inline-flex h-10 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 disabled:opacity-50"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onVerify(row, "rejected")}
                            className="inline-flex h-10 items-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <label className="flex items-center gap-2">
            Rows per page
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-base dark:border-slate-700 dark:bg-slate-950"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <span>
            <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">{rangeStart}–{rangeEnd}</span> of {totalRows}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <PaginationBtn disabled={page <= 1} onClick={() => onPageChange(1)} label="First">First</PaginationBtn>
          <PaginationBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)} label="Previous" icon={<ChevronLeft className="h-5 w-5" />} />
          <span className="px-3 text-sm font-medium text-slate-700">Page {page} of {totalPages}</span>
          <PaginationBtn disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} label="Next" icon={<ChevronRight className="h-5 w-5" />} />
          <PaginationBtn disabled={page >= totalPages} onClick={() => onPageChange(totalPages)} label="Last">Last</PaginationBtn>
        </div>
      </div>
    </div>
  );
}

function DocumentPreviewPanel({
  companyId,
  row,
  type,
  onClose,
  onVerify,
  actionLoading,
}: {
  companyId: string | null;
  row: EmployeeDocumentSubmission;
  type: HrmDocumentTypeCard;
  onClose: () => void;
  onVerify: (row: EmployeeDocumentSubmission, status: "verified" | "rejected") => void;
  actionLoading: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!companyId || !row.submissionId) {
      setPreviewUrl(row.fileUrl ?? null);
      return;
    }
    setPreviewLoading(true);
    void fetchHrDocumentPreviewUrl(companyId, row.submissionId)
      .then(setPreviewUrl)
      .catch(() => setPreviewUrl(row.fileUrl ?? null))
      .finally(() => setPreviewLoading(false));
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [companyId, row.submissionId, row.fileUrl]);

  const isImage = row.fileName?.match(/\.(png|jpg|jpeg|webp)$/i) || previewUrl?.includes("image");
  const maskedId = maskId(row.employeeId);

  return (
    <div className="border-b border-slate-200/90 bg-slate-50/50 px-5 py-5 dark:border-slate-800 dark:bg-slate-950/30">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Document preview</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{type.title}</h3>
          <p className="mt-1 text-base text-slate-600">{row.employeeName} · {row.employeeCode}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <X className="h-4 w-4" /> Close preview
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800">
            <span className="font-mono text-sm text-slate-600">{row.fileName}</span>
            <span className="rounded-md bg-slate-200/80 px-2.5 py-1 text-sm font-semibold uppercase text-slate-600">
              {isImage ? "Image" : "PDF"}
            </span>
          </div>
          <div className="flex min-h-[420px] items-center justify-center p-6">
            {previewLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            ) : previewUrl ? (
              isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={row.fileName ?? "Document preview"} className="max-h-[380px] max-w-full rounded-lg object-contain" />
              ) : (
                <iframe src={previewUrl} title={row.fileName ?? "Document preview"} className="h-[380px] w-full rounded-lg border-0" />
              )
            ) : (
              <DocumentPreviewContent type={type} row={row} maskedId={maskedId} />
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-500">Submission details</p>
            <dl className="mt-3 space-y-3 text-base">
              <div>
                <dt className="text-sm text-slate-500">Status</dt>
                <dd className="mt-1"><SubmissionBadge status={row.status} /></dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Submitted on</dt>
                <dd className="mt-1 font-medium text-slate-900 dark:text-white">{row.submittedAt ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Department</dt>
                <dd className="mt-1 font-medium text-slate-900 dark:text-white">{row.department}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Location</dt>
                <dd className="mt-1 font-medium text-slate-900 dark:text-white">{row.location}</dd>
              </div>
              {row.verifiedBy ? (
                <div>
                  <dt className="text-sm text-slate-500">Verified by</dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">{row.verifiedBy}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          {row.status === "verified" ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              HR verified — safe for payroll and compliance use.
            </div>
          ) : row.status === "pending" && row.submissionId ? (
            <div className="flex gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onVerify(row, "verified")}
                className="h-10 flex-1 rounded-lg bg-[#191970] text-sm font-semibold text-white disabled:opacity-50"
              >
                Verify
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onVerify(row, "rejected")}
                className="h-10 flex-1 rounded-lg border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function DocumentPreviewContent({
  type,
  row,
  maskedId,
}: {
  type: HrmDocumentTypeCard;
  row: EmployeeDocumentSubmission;
  maskedId: string;
}) {
  if (type.id === "doc_type_aadhaar") {
    return (
      <div className="w-full max-w-md rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-orange-800">Government of India</div>
          <div className="rounded bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">आधार</div>
        </div>
        <p className="mt-4 text-sm font-semibold text-orange-900">Aadhaar</p>
        <p className="mt-6 font-mono text-2xl font-bold tracking-widest text-slate-900">{maskedId}</p>
        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="text-lg font-bold text-slate-900">{row.employeeName}</p>
          </div>
          <div className="flex h-20 w-16 items-center justify-center rounded-lg border border-slate-300 bg-slate-200 text-xs text-slate-500">
            Photo
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500">DOB: XX / XX / XXXX</p>
      </div>
    );
  }

  if (type.id === "doc_type_pan") {
    return (
      <div className="w-full max-w-md rounded-xl border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-md">
        <p className="text-sm font-bold text-blue-900">INCOME TAX DEPARTMENT · GOVT. OF INDIA</p>
        <p className="mt-6 text-sm font-semibold text-slate-600">Permanent Account Number Card</p>
        <p className="mt-4 font-mono text-2xl font-bold tracking-wider text-slate-900">
          {row.employeeCode.replace("EMP", "ABCDE")}1234F
        </p>
        <p className="mt-8 text-lg font-bold text-slate-900">{row.employeeName}</p>
        <p className="mt-2 text-sm text-slate-500">Father&apos;s Name: —</p>
        <p className="mt-4 text-sm text-slate-500">Date of birth: XX / XX / XXXX</p>
      </div>
    );
  }

  if (type.category === "contract" || type.category === "offer_letter") {
    return (
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 shadow-inner">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-400">Rivexaflow Pvt. Ltd.</p>
        <h4 className="mt-4 text-xl font-bold text-slate-900">{type.title}</h4>
        <p className="mt-6 text-base leading-relaxed text-slate-700">
          This agreement is entered into between Rivexaflow Pvt. Ltd. and{" "}
          <span className="font-semibold">{row.employeeName}</span> ({row.employeeCode}), effective from the date of joining.
        </p>
        <p className="mt-4 text-base leading-relaxed text-slate-700">
          Compensation, role ({row.department}), work location ({row.location}), and notice period terms are as per the signed offer and company policy pack.
        </p>
        <div className="mt-10 border-t border-slate-200 pt-6">
          <p className="text-sm text-slate-500">Employee signature</p>
          <p className="mt-2 font-semibold text-slate-900">{row.employeeName}</p>
          <p className="mt-1 text-sm text-slate-500">Date: {row.submittedAt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FileText className="h-16 w-16" />
      </div>
      <p className="text-lg font-semibold text-slate-900">{type.title}</p>
      <p className="text-base text-slate-600">{row.fileName}</p>
      <p className="text-sm text-slate-500">Uploaded by {row.employeeName}</p>
    </div>
  );
}

function PaginationBtn({
  children,
  icon,
  disabled,
  onClick,
  label,
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
    >
      {icon ?? children}
    </button>
  );
}
