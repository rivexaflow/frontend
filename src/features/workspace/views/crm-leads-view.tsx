"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Target, TrendingUp, UserPlus } from "lucide-react";

import { LeadFormModal } from "@/features/workspace/components/crm/lead-form-modal";
import { LeadDetailDrawer } from "@/features/workspace/components/crm/leads/lead-detail-drawer";
import { LeadsInboxPanel } from "@/features/workspace/components/crm/leads/panels/leads-inbox-panel";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import { DEMO_LEADS, type LeadRecord, type LeadStatus } from "@/features/workspace/data/crm-demo";

export function CrmLeadsView() {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadRecord[]>(DEMO_LEADS);
  const [search, setSearch] = useState("");
  const { validation } = useDebouncedSearch(search, { minLength: 2 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);

  const metrics = useMemo(() => {
    const newCount = leads.filter((l) => l.status === "new").length;
    const hot = leads.filter(
      (l) => (l.scoreBand === "A1" || l.scoreBand === "A2") && l.status !== "lost",
    ).length;
    const needsAttention = leads.filter(
      (l) => l.slaStatus !== "on_track" && l.status !== "lost" && l.status !== "qualified",
    ).length;
    const qualified = leads.filter((l) => l.status === "qualified").length;
    return { newCount, hot, needsAttention, qualified };
  }, [leads]);

  const updateStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              updatedAt: "Just now",
              slaStatus: status === "qualified" ? "on_track" : l.slaStatus,
            }
          : l,
      ),
    );
    setSelectedLead((sel) => (sel?.id === id ? { ...sel, status } : sel));
  }, []);

  return (
    <>
      <EnterprisePageShell
        eyebrow="Operations · CRM"
        title="Leads"
        description="Everyone you’re selling to lives here. Add leads, follow up on time, and move the best ones to your pipeline."
        metrics={[
          {
            label: "New",
            value: String(metrics.newCount),
            hint: "Not contacted yet",
            icon: UserPlus,
            tone: "blue",
          },
          {
            label: "Hot",
            value: String(metrics.hot),
            hint: "High priority",
            icon: Target,
            tone: "emerald",
          },
          {
            label: "Needs follow-up",
            value: String(metrics.needsAttention),
            hint: "Past due or at risk",
            icon: Clock,
            tone: "amber",
          },
          {
            label: "Qualified",
            value: String(metrics.qualified),
            hint: "Ready for deals",
            icon: TrendingUp,
            tone: "purple",
          },
        ]}
        toolbar={
          <EnterpriseToolbar
            searchPlaceholder="Search by name, company, or email…"
            searchValue={search}
            onSearchChange={setSearch}
            searchHint={validation.message}
            primaryLabel="Add lead"
            onPrimaryClick={() => setModalOpen(true)}
          />
        }
      >
        <LeadsInboxPanel
          leads={leads}
          search={search}
          onSelect={setSelectedLead}
          onStatusChange={updateStatus}
        />
      </EnterprisePageShell>

      <LeadFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(lead) => setLeads((prev) => [lead, ...prev])}
      />

      <LeadDetailDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={updateStatus}
        onConvert={() => router.push("/crm/pipelines")}
      />
    </>
  );
}
