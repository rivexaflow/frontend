"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  BookOpen,
  ChevronRight,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  UserCheck,
} from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
  selectClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import {
  HRM_POLICY_CATEGORIES,
  HRM_POLICY_STATUSES,
  type HrmPolicyCategory,
  type HrmPolicyRecord,
  type HrmPolicyStatus,
} from "@/features/workspace/data/hrm-policies-demo";
import type { CreatePolicyPayload, PolicyAcknowledgment } from "@/types/hrm";
import {
  acknowledgeHrPolicy,
  createHrPolicy,
  exportHrPolicyPdf,
  fetchHrEmployees,
  fetchHrPolicies,
  fetchHrPolicy,
  fetchHrPolicyAcknowledgments,
  remindHrPolicyAcknowledgments,
  updateHrPolicyStatus,
} from "@/lib/api/hrm";
import { authStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils/cn";

type ReaderTab = "document" | "acknowledgment";

const STATUS_STYLES: Record<HrmPolicyStatus, string> = {
  draft: "bg-slate-100 text-slate-600 ring-slate-500/15",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  archived: "bg-slate-100 text-slate-500 ring-slate-500/15",
};

function PolicyStatusBadge({ status }: { status: HrmPolicyStatus }) {
  const label = HRM_POLICY_STATUSES.find((s) => s.id === status)?.label ?? status;
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", STATUS_STYLES[status])}>
      {label}
    </span>
  );
}

export function HrmPoliciesView() {
  const companyId = useHrCompanyId();
  const [policies, setPolicies] = useState<HrmPolicyRecord[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<HrmPolicyRecord | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HrmPolicyCategory | "">("");
  const [readerTab, setReaderTab] = useState<ReaderTab>("document");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const list = await fetchHrPolicies(companyId, {
        category: category || undefined,
      });
      setPolicies(list);
      setSelectedId((prev) => prev || list[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load policies.");
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
    if (!companyId || !selectedId) {
      setSelectedPolicy(null);
      return;
    }
    setLoadingDetail(true);
    void fetchHrPolicy(companyId, selectedId)
      .then(setSelectedPolicy)
      .catch(() => {
        const fallback = policies.find((p) => p.id === selectedId) ?? null;
        setSelectedPolicy(fallback);
      })
      .finally(() => setLoadingDetail(false));
  }, [companyId, selectedId, policies]);

  useEffect(() => {
    if (!companyId || !selectedId || readerTab !== "acknowledgment") {
      setAcknowledgments([]);
      return;
    }
    void fetchHrPolicyAcknowledgments(companyId, selectedId).then(setAcknowledgments);
  }, [companyId, selectedId, readerTab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return policies.filter((p) => {
      if (category && p.category !== category) return false;
      if (q && !`${p.title} ${p.summary} ${p.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [policies, query, category]);

  const selected = selectedPolicy ?? policies.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const publishedCount = policies.filter((p) => p.status === "published").length;
  const avgAck = publishedCount
    ? Math.round(
        policies
          .filter((p) => p.status === "published" && p.acknowledgmentRequired)
          .reduce((s, p) => s + (p.acknowledgedCount / p.totalEmployees) * 100, 0) /
          Math.max(1, policies.filter((p) => p.status === "published" && p.acknowledgmentRequired).length),
      )
    : 0;

  const updateStatus = async (id: string, status: HrmPolicyStatus) => {
    if (!companyId) return;
    try {
      const updated = await updateHrPolicyStatus(companyId, id, status);
      setPolicies((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (selectedId === id) setSelectedPolicy(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update policy status.");
    }
  };

  const handleCreate = async (payload: CreatePolicyPayload) => {
    if (!companyId) return;
    const created = await createHrPolicy(companyId, payload);
    setPolicies((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setSelectedPolicy(created);
  };

  const handleExport = async (policyId: string) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      await exportHrPolicyPdf(companyId, policyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not export policy.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemind = async (policyId: string) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      await remindHrPolicyAcknowledgments(companyId, policyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reminders.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcknowledge = async (policyId: string) => {
    if (!companyId) return;
    const user = authStore.getState().user;
    setActionLoading(true);
    try {
      let employeeId = user?.id;
      if (!employeeId) {
        const employees = await fetchHrEmployees(companyId, { search: user?.email });
        employeeId = employees.find((e) => e.email === user?.email)?.id;
      }
      if (!employeeId) throw new Error("Could not resolve employee for acknowledgment.");
      await acknowledgeHrPolicy(companyId, policyId, { employeeId });
      const acks = await fetchHrPolicyAcknowledgments(companyId, policyId);
      setAcknowledgments(acks);
      const refreshed = await fetchHrPolicy(companyId, policyId);
      setSelectedPolicy(refreshed);
      setPolicies((prev) => prev.map((p) => (p.id === policyId ? refreshed : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record acknowledgment.");
    } finally {
      setActionLoading(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    document.getElementById(`policy-section-${sectionId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Company policy</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Full policy library with in-panel reader, table of contents, and acknowledgment tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Policies", value: policies.length, icon: BookOpen },
              { label: "Published", value: publishedCount, icon: Shield },
              { label: "Avg ack", value: `${avgAck}%`, icon: UserCheck },
              { label: "Drafts", value: policies.filter((p) => p.status === "draft").length, icon: Send },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200/90 px-4 py-4 lg:flex-row lg:items-center dark:border-slate-800">
          <div className="relative min-w-0 flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search policies…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as HrmPolicyCategory | "")}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="">All categories</option>
            {HRM_POLICY_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              void load();
            }}
            disabled={refreshing}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white hover:bg-[#12124a] lg:ml-auto"
          >
            <Plus className="h-4 w-4" /> New policy
          </button>
        </div>

        {error ? (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading policies…
          </div>
        ) : (
        <div className="flex min-h-[640px] flex-col lg:flex-row">
          {/* Policy list */}
          <aside className="w-full shrink-0 border-b border-slate-200/90 lg:w-72 lg:border-b-0 lg:border-r dark:border-slate-800">
            <div className="max-h-[280px] overflow-y-auto lg:max-h-[calc(640px-1px)]">
              {filtered.map((policy) => {
                const ackPct =
                  policy.totalEmployees > 0
                    ? Math.round((policy.acknowledgedCount / policy.totalEmployees) * 100)
                    : 0;
                return (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(policy.id);
                      setReaderTab("document");
                      setActiveSectionId(null);
                    }}
                    className={cn(
                      "flex w-full flex-col gap-1 border-b border-slate-100 px-4 py-3.5 text-left transition last:border-0 dark:border-slate-800",
                      selected?.id === policy.id
                        ? "bg-[#191970]/5 border-l-2 border-l-[#191970]"
                        : "hover:bg-slate-50/80 dark:hover:bg-slate-900/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{policy.title}</p>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      v{policy.version} · {HRM_POLICY_CATEGORIES.find((c) => c.id === policy.category)?.label}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <PolicyStatusBadge status={policy.status} />
                      {policy.acknowledgmentRequired && policy.status === "published" ? (
                        <span className="text-[10px] font-medium text-slate-500">{ackPct}% ack</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Broad reader */}
          {selected ? (
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b border-slate-200/90 px-6 py-4 dark:border-slate-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selected.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Version {selected.version} · Effective {selected.effectiveFrom} · Owner: {selected.owner}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PolicyStatusBadge status={selected.status} />
                    {selected.status === "draft" ? (
                      <button type="button" onClick={() => void updateStatus(selected.id, "published")} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white">
                        <Send className="h-3.5 w-3.5" /> Publish
                      </button>
                    ) : null}
                    {selected.status === "published" ? (
                      <button type="button" onClick={() => void updateStatus(selected.id, "archived")} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600">
                        <Archive className="h-3.5 w-3.5" /> Archive
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleExport(selected.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 disabled:opacity-50"
                    >
                      <Download className="h-3.5 w-3.5" /> Export PDF
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex gap-1 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
                  {(["document", "acknowledgment"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setReaderTab(tab)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition",
                        readerTab === tab ? "bg-[#191970] text-white" : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {loadingDetail ? (
                <div className="flex flex-1 items-center justify-center gap-2 py-12 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading policy…
                </div>
              ) : readerTab === "document" ? (
                <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                  <nav className="shrink-0 border-b border-slate-100 px-6 py-4 lg:w-52 lg:border-b-0 lg:border-r dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contents</p>
                    <ul className="mt-3 space-y-1">
                      {selected.sections.map((section) => (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(section.id)}
                            className={cn(
                              "w-full rounded-md px-2 py-1.5 text-left text-xs font-medium transition",
                              activeSectionId === section.id
                                ? "bg-[#191970]/10 text-[#191970]"
                                : "text-slate-600 hover:bg-slate-50",
                            )}
                          >
                            {section.heading}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <article className="min-w-0 flex-1 overflow-y-auto px-6 py-6 lg:max-h-[520px]">
                    <p className="mb-6 rounded-xl border border-slate-200/90 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-950/40">
                      {selected.summary}
                    </p>
                    <div className="prose-policy space-y-8">
                      {selected.sections.map((section) => (
                        <section key={section.id} id={`policy-section-${section.id}`} className="scroll-mt-4">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{section.heading}</h3>
                          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{section.body}</p>
                        </section>
                      ))}
                    </div>
                    <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400 dark:border-slate-800">
                      Last updated {selected.lastUpdated}
                      {selected.publishedAt ? ` · Published ${selected.publishedAt}` : ""}
                    </p>
                  </article>
                </div>
              ) : (
                <AcknowledgmentPanel
                  policy={selected}
                  acknowledgments={acknowledgments}
                  actionLoading={actionLoading}
                  onRemind={() => void handleRemind(selected.id)}
                  onAcknowledge={() => void handleAcknowledge(selected.id)}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-12 text-sm text-slate-500">Select a policy to read</div>
          )}
        </div>
        )}
      </div>

      <CreatePolicyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

function AcknowledgmentPanel({
  policy,
  acknowledgments,
  actionLoading,
  onRemind,
  onAcknowledge,
}: {
  policy: HrmPolicyRecord;
  acknowledgments: PolicyAcknowledgment[];
  actionLoading: boolean;
  onRemind: () => void;
  onAcknowledge: () => void;
}) {
  const ackPct = policy.totalEmployees > 0 ? Math.round((policy.acknowledgedCount / policy.totalEmployees) * 100) : 0;
  const pending = policy.totalEmployees - policy.acknowledgedCount;

  return (
    <div className="overflow-y-auto px-6 py-6 lg:max-h-[520px]">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Acknowledged", value: policy.acknowledgedCount, tone: "text-emerald-600" },
          { label: "Pending", value: pending, tone: "text-amber-600" },
          { label: "Completion", value: `${ackPct}%`, tone: "text-[#191970]" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", stat.tone)}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${ackPct}%` }} />
      </div>
      <p className="mt-6 text-sm text-slate-600">
        {policy.acknowledgmentRequired
          ? "Employees must acknowledge this policy within 14 days of publish. Overdue accounts are flagged in the compliance dashboard."
          : "Acknowledgment is not required for this archived policy."}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={actionLoading || policy.status !== "published"}
          onClick={onRemind}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Send reminder to pending
        </button>
        <button
          type="button"
          disabled={actionLoading || policy.status !== "published"}
          onClick={onAcknowledge}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          <UserCheck className="h-4 w-4" /> Record my acknowledgment
        </button>
      </div>
      {acknowledgments.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Acknowledged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {acknowledgments.map((ack) => (
                <tr key={ack.employeeId}>
                  <td className="px-4 py-3 font-medium text-slate-900">{ack.employeeName}</td>
                  <td className="px-4 py-3 text-slate-500">{ack.department ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{ack.status}</td>
                  <td className="px-4 py-3 text-slate-500">{ack.acknowledgedAt ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function CreatePolicyModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreatePolicyPayload) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<HrmPolicyCategory>("hr");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle("");
      setCategory("hr");
      setSummary("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      setError("Title and summary are required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        summary: summary.trim(),
        sections: [
          { heading: "1. Overview", body: summary.trim() },
          { heading: "2. Scope", body: "Add detailed clauses before publishing this policy to the workforce." },
        ],
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create policy.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal open={open} title="New policy" description="Draft a policy with sections. Use the in-panel reader to expand content before publish." onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Policy title" htmlFor="pol-title">
          <input id="pol-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClassName} />
        </FormField>
        <FormField label="Category" htmlFor="pol-cat">
          <select id="pol-cat" value={category} onChange={(e) => setCategory(e.target.value as HrmPolicyCategory)} className={selectClassName}>
            {HRM_POLICY_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Executive summary" htmlFor="pol-summary">
          <textarea id="pol-summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className={`${inputClassName} min-h-[100px] py-2`} />
        </FormField>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 border-t pt-4">
          <button type="button" onClick={onClose} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" disabled={submitting} className="h-10 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? "Saving…" : "Save draft"}
          </button>
        </div>
      </form>
    </EnterpriseFormModal>
  );
}
