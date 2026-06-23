"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Scale, ShieldAlert } from "lucide-react";

import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { GrievanceDetailDrawer } from "@/features/workspace/components/hrm/grievances/grievance-detail-drawer";
import {
  GrievanceSubmitWizard,
  type GrievanceSubmitValues,
} from "@/features/workspace/components/hrm/grievances/grievance-submit-wizard";
import { GrievanceTicketCard } from "@/features/workspace/components/hrm/grievances/grievance-ticket-card";
import { GrievanceTicketsTable } from "@/features/workspace/components/hrm/grievances/grievance-tickets-table";
import {
  GrievanceToolbar,
  type GrievanceFilters,
} from "@/features/workspace/components/hrm/grievances/grievance-toolbar";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { HrmDirectoryViewToggle } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  DEMO_HRM_GRIEVANCES,
  getGrievanceStats,
  nextTicketId,
  type GrievanceComment,
  type GrievanceStage,
  type HrmGrievanceTicket,
} from "@/features/workspace/data/hrm-grievances-demo";

type Tab = "all" | "active" | "resolved";

const EMPTY_FILTERS: GrievanceFilters = { query: "", stage: "", priority: "" };

export function HrmGrievancesView() {
  const [tickets, setTickets] = useState<HrmGrievanceTicket[]>(() => [...DEMO_HRM_GRIEVANCES]);
  const [tab, setTab] = useState<Tab>("all");
  const [filters, setFilters] = useState<GrievanceFilters>(EMPTY_FILTERS);
  const [viewMode, setViewMode] = useState<HrmViewMode>("grid");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const stats = useMemo(() => getGrievanceStats(tickets), [tickets]);

  const tabFiltered = useMemo(() => {
    if (tab === "active") return tickets.filter((t) => t.stage !== "resolved");
    if (tab === "resolved") return tickets.filter((t) => t.stage === "resolved");
    return tickets;
  }, [tickets, tab]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return tabFiltered.filter((t) => {
      if (filters.stage && t.stage !== filters.stage) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (!q) return true;
      const hay = `${t.id} ${t.subject} ${t.employee} ${t.department} ${t.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [tabFiltered, filters]);

  const selectedTicket = selectedId ? tickets.find((t) => t.id === selectedId) ?? null : null;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    window.setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSubmit = (values: GrievanceSubmitValues) => {
    const id = nextTicketId(tickets);
    const now = new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const ticket: HrmGrievanceTicket = {
      id,
      subject: values.subject,
      category: values.category,
      description: values.description,
      employee: values.anonymous ? "Anonymous" : "Priya Mehta",
      department: values.department,
      priority: values.priority,
      stage: "submitted",
      anonymous: values.anonymous,
      language: values.language,
      evidence: values.evidence,
      comments: [
        {
          id: `c-${Date.now()}`,
          author: values.anonymous ? "Anonymous" : "Priya Mehta",
          role: "employee",
          body: "Grievance submitted. Thank you for providing a safe way to report this.",
          at: `${now} · just now`,
        },
      ],
      filedAt: now,
      updatedAt: now,
    };
    setTickets((prev) => [ticket, ...prev]);
    setSelectedId(id);
    showSuccess(`Ticket ${id} created — we'll keep you updated at every step.`);
  };

  const handleAddComment = (ticketId: string, body: string) => {
    const comment: GrievanceComment = {
      id: `c-${Date.now()}`,
      author: "Priya Mehta",
      role: "employee",
      body,
      at: new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
    };
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, comments: [...t.comments, comment], updatedAt: comment.at } : t)),
    );
  };

  const handleAdvanceStage = (ticketId: string, stage: GrievanceStage) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              stage,
              assignedTo: stage === "assigned" ? "Anita Desai" : t.assignedTo,
              updatedAt: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
            }
          : t,
      ),
    );
  };

  return (
    <div className="pb-8">
      {successMessage ? (
        <div className="mx-3 mb-3 mt-1 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 md:mx-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      ) : null}

      <CrmShell>
        <HrmCompactBanner
          title="Grievances"
          subtitle="Confidential reporting · transparent tracking · HR resolution queue"
          stats={[
            { label: "Active", value: stats.active, tone: "warning" },
            { label: "Pending review", value: stats.pending },
            { label: "Assigned", value: stats.assigned },
            { label: "Resolved", value: stats.resolved, tone: "success" },
          ]}
          actions={
            <button
              type="button"
              onClick={() => setWizardOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25"
            >
              File a grievance
            </button>
          }
        />

        <HrmPanelTabs
          tabs={[
            { id: "all" as const, label: "All tickets", count: tickets.length },
            { id: "active" as const, label: "Active queue", count: stats.active },
            { id: "resolved" as const, label: "Resolved", count: stats.resolved },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="space-y-4 p-3 md:p-4">
          <OrgChartStatStrip
            stats={[
              { label: "Total tickets", value: stats.total, hint: "All time", icon: Scale, tone: "blue" },
              { label: "Awaiting review", value: stats.pending, hint: "Needs HR action", icon: Clock, tone: "amber" },
              { label: "High priority", value: stats.highPriority, hint: "Open urgent", icon: ShieldAlert, tone: "amber" },
            ]}
          />

          <div className="rounded-xl border border-[#2277ff]/15 bg-[#2277ff]/[0.04] px-4 py-3">
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#2277ff]" />
              <p>
                <strong className="font-semibold text-slate-800">You're in a safe space.</strong> Reports can be filed
                anonymously. Every ticket gets a reference ID and a clear status tracker from submission to resolution.
              </p>
            </div>
          </div>

          <CrmPanel>
            <CrmPanelHead
              title="Grievance register"
              subtitle="Click any ticket to view progress, evidence, and message HR"
              actions={
                <div className="flex items-center gap-2">
                  <HrmDirectoryViewToggle viewMode={viewMode} onChange={setViewMode} />
                </div>
              }
            />
            <div className="space-y-4 p-4">
              <GrievanceToolbar
                filters={filters}
                onChange={setFilters}
                onFileGrievance={() => setWizardOpen(true)}
                resultCount={filtered.length}
              />

              {viewMode === "grid" ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((ticket) => (
                    <GrievanceTicketCard
                      key={ticket.id}
                      ticket={ticket}
                      selected={selectedId === ticket.id}
                      onSelect={() => setSelectedId(ticket.id)}
                    />
                  ))}
                </div>
              ) : (
                <GrievanceTicketsTable
                  tickets={filtered}
                  selectedId={selectedId}
                  onSelect={(t) => setSelectedId(t.id)}
                />
              )}

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                  <Scale className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">No tickets match your filters</p>
                </div>
              ) : null}
            </div>
          </CrmPanel>
        </div>
      </CrmShell>

      <GrievanceSubmitWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onSubmit={handleSubmit} />

      <GrievanceDetailDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedId(null)}
        onAddComment={handleAddComment}
        onAdvanceStage={handleAdvanceStage}
      />
    </div>
  );
}
