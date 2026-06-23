"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  UserCheck,
} from "lucide-react";

import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { PolicyCard } from "@/features/workspace/components/hrm/policies/policy-card";
import { PolicyCompliancePanel } from "@/features/workspace/components/hrm/policies/policy-compliance-panel";
import { PolicyCreateModal } from "@/features/workspace/components/hrm/policies/policy-create-modal";
import { PolicyReaderPanel } from "@/features/workspace/components/hrm/policies/policy-reader-panel";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  HRM_POLICY_CATEGORIES,
  type HrmPolicyCategory,
  type HrmPolicyRecord,
  type HrmPolicyStatus,
} from "@/features/workspace/data/hrm-policies-demo";
import { getPolicyLibraryStats } from "@/features/workspace/data/hrm-policies-ui";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
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

type Tab = "library" | "compliance";
type StatusFilter = HrmPolicyStatus | "all";

export function HrmPoliciesView() {
  const companyId = useHrCompanyId();
  const [tab, setTab] = useState<Tab>("library");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HrmPolicyCategory | "">("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [policies, setPolicies] = useState<HrmPolicyRecord[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<HrmPolicyRecord | null>(null);
  const [acknowledgments, setAcknowledgments] = useState<PolicyAcknowledgment[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
      setAcknowledgments([]);
      return;
    }
    setLoadingDetail(true);
    void Promise.all([
      fetchHrPolicy(companyId, selectedId).catch(() => {
        return policies.find((p) => p.id === selectedId) ?? null;
      }),
      fetchHrPolicyAcknowledgments(companyId, selectedId).catch(() => [] as PolicyAcknowledgment[]),
    ])
      .then(([policy, acks]) => {
        setSelectedPolicy(policy);
        setAcknowledgments(acks);
      })
      .finally(() => setLoadingDetail(false));
  }, [companyId, selectedId, policies]);

  const stats = useMemo(() => getPolicyLibraryStats(policies), [policies]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return policies.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (category && p.category !== category) return false;
      if (q && !`${p.title} ${p.summary} ${p.tags.join(" ")}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [policies, query, category, statusFilter]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(null), 4000);
  };

  const updateStatus = async (id: string, status: HrmPolicyStatus) => {
    if (!companyId) return;
    try {
      const updated = await updateHrPolicyStatus(companyId, id, status);
      setPolicies((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (selectedId === id) setSelectedPolicy(updated);
      showSuccess(status === "published" ? "Policy published." : "Policy archived.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update policy status.");
    }
  };

  const handleCreate = async (payload: CreatePolicyPayload) => {
    if (!companyId) return;
    const created = await createHrPolicy(companyId, payload);
    setPolicies((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setTab("library");
    showSuccess("Policy draft saved.");
  };

  const handleExport = async (policyId: string) => {
    if (!companyId) return;
    setActionLoading(true);
    try {
      await exportHrPolicyPdf(companyId, policyId);
      showSuccess("Policy exported.");
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
      showSuccess("Reminders sent to pending employees.");
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
      const [acks, refreshed] = await Promise.all([
        fetchHrPolicyAcknowledgments(companyId, policyId),
        fetchHrPolicy(companyId, policyId),
      ]);
      setAcknowledgments(acks);
      setSelectedPolicy(refreshed);
      setPolicies((prev) => prev.map((p) => (p.id === policyId ? refreshed : p)));
      showSuccess("Your acknowledgment was recorded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record acknowledgment.");
    } finally {
      setActionLoading(false);
    }
  };

  const openPolicy = (id: string) => {
    setSelectedId(id);
    setTab("library");
  };

  const publishedCount = policies.filter((p) => p.status === "published").length;

  return (
    <div className="pb-8">
      <CrmShell>
        <HrmCompactBanner
          title="Company policies"
          subtitle="Policy library · in-app reader · acknowledgment tracking"
          stats={[
            { label: "Policies", value: stats.total },
            { label: "Published", value: publishedCount, tone: "success" },
            { label: "Avg ack", value: `${stats.avgAck}%` },
            { label: "Pending", value: stats.pendingTotal, tone: stats.pendingTotal > 0 ? "warning" : "default" },
          ]}
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true);
                  void load();
                }}
                disabled={refreshing}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-[#191970] hover:bg-indigo-50"
              >
                <Plus className="h-3.5 w-3.5" />
                New policy
              </button>
            </div>
          }
        />

        {!selectedId ? (
          <HrmPanelTabs
            tabs={[
              { id: "library" as const, label: "Policy library", count: policies.length },
              { id: "compliance" as const, label: "Compliance", count: stats.pendingTotal || undefined },
            ]}
            active={tab}
            onChange={setTab}
          />
        ) : null}

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

          {selectedId && selectedPolicy ? (
            <PolicyReaderPanel
              policy={selectedPolicy}
              loading={loadingDetail}
              acknowledgments={acknowledgments}
              actionLoading={actionLoading}
              onBack={() => setSelectedId(null)}
              onPublish={() => void updateStatus(selectedPolicy.id, "published")}
              onArchive={() => void updateStatus(selectedPolicy.id, "archived")}
              onExport={() => void handleExport(selectedPolicy.id)}
              onRemind={() => void handleRemind(selectedPolicy.id)}
              onAcknowledge={() => void handleAcknowledge(selectedPolicy.id)}
            />
          ) : tab === "library" ? (
            <>
              <OrgChartStatStrip
                stats={[
                  {
                    label: "Live policies",
                    value: publishedCount,
                    hint: "Published",
                    icon: BookOpen,
                    tone: "blue",
                  },
                  {
                    label: "Ack compliance",
                    value: `${stats.avgAck}%`,
                    hint: "Org average",
                    icon: UserCheck,
                    tone: "emerald",
                  },
                  {
                    label: "Drafts",
                    value: stats.drafts,
                    hint: "Awaiting publish",
                    icon: Shield,
                    tone: "amber",
                  },
                ]}
              />

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative min-w-0 flex-1 lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search policies…"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "all" as const, label: "All" },
                      { id: "published" as const, label: "Published" },
                      { id: "draft" as const, label: "Drafts" },
                      { id: "archived" as const, label: "Archived" },
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

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    category === ""
                      ? "bg-[#2277ff]/10 text-[#191970] ring-1 ring-[#2277ff]/20"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                  )}
                >
                  All categories
                </button>
                {HRM_POLICY_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                      category === c.id
                        ? "bg-[#2277ff]/10 text-[#191970] ring-1 ring-[#2277ff]/20"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <CrmPanel>
                <CrmPanelHead
                  title="Policy library"
                  subtitle="Click a policy to read the full document and manage acknowledgments"
                />
                <div className="p-4">
                  {loading ? (
                    <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading policies…
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="py-16 text-center text-sm text-slate-500">
                      No policies match your filters.
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {filtered.map((policy) => (
                        <PolicyCard
                          key={policy.id}
                          policy={policy}
                          onSelect={() => openPolicy(policy.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CrmPanel>
            </>
          ) : (
            <CrmPanel>
              <CrmPanelHead
                title="Compliance overview"
                subtitle="Track acknowledgment progress across published policies"
              />
              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading…
                  </div>
                ) : (
                  <PolicyCompliancePanel
                    policies={policies}
                    onSelect={(id) => {
                      openPolicy(id);
                    }}
                  />
                )}
              </div>
            </CrmPanel>
          )}
        </div>
      </CrmShell>

      <PolicyCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
