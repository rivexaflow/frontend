"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock,
  FileCheck,
  Radar,
  ShieldCheck,
} from "lucide-react";

import { KycCaseDetailDrawer } from "@/features/workspace/components/kyc/kyc-case-detail-drawer";
import { KycModuleNav } from "@/features/workspace/components/kyc/kyc-module-nav";
import { KycNewCaseModal } from "@/features/workspace/components/kyc/kyc-new-case-modal";
import { KycAuditPanel } from "@/features/workspace/components/kyc/panels/kyc-audit-panel";
import { KycCasesPanel } from "@/features/workspace/components/kyc/panels/kyc-cases-panel";
import { KycDocumentsPanel } from "@/features/workspace/components/kyc/panels/kyc-documents-panel";
import { KycIdentityPanel } from "@/features/workspace/components/kyc/panels/kyc-identity-panel";
import { KycMonitoringPanel } from "@/features/workspace/components/kyc/panels/kyc-monitoring-panel";
import { KycScreeningPanel } from "@/features/workspace/components/kyc/panels/kyc-screening-panel";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import {
  DEMO_KYC_AUDIT,
  DEMO_KYC_CASES,
  DEMO_KYC_DOCUMENTS,
  DEMO_MONITORING_EVENTS,
  DEMO_SCREENING_ALERTS,
  type AuditEntry,
  type KycCase,
  type KycModuleId,
  type KycDocument,
  type MonitoringEvent,
  type ScreeningAlert,
} from "@/features/workspace/data/kyc-demo";

export function KycCenterView() {
  const [module, setModule] = useState<KycModuleId>("cases");
  const [cases, setCases] = useState<KycCase[]>(DEMO_KYC_CASES);
  const [alerts, setAlerts] = useState<ScreeningAlert[]>(DEMO_SCREENING_ALERTS);
  const [documents, setDocuments] = useState<KycDocument[]>(DEMO_KYC_DOCUMENTS);
  const [monitoring, setMonitoring] = useState<MonitoringEvent[]>(DEMO_MONITORING_EVENTS);
  const [audit, setAudit] = useState<AuditEntry[]>(DEMO_KYC_AUDIT);
  const [search, setSearch] = useState("");
  const { validation } = useDebouncedSearch(search, { minLength: 2 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<KycCase | null>(null);

  const metrics = useMemo(() => {
    const queue = cases.filter((c) =>
      ["pending", "in_review", "escalated"].includes(c.status),
    ).length;
    const approvedToday = cases.filter((c) => c.status === "approved").length;
    const highRisk = cases.filter((c) => c.risk === "high").length;
    const openAlerts = alerts.filter((a) => a.status === "open").length;
    return { queue, approvedToday, highRisk, openAlerts };
  }, [cases, alerts]);

  const moduleCounts = useMemo(
    (): Partial<Record<KycModuleId, number>> => ({
      cases: metrics.queue,
      screening: metrics.openAlerts,
      documents: documents.filter((d) => d.status === "pending").length,
      monitoring: monitoring.filter((e) => e.severity !== "info").length,
    }),
    [metrics, documents, monitoring],
  );

  const appendAudit = useCallback((action: string, resource: string, caseRef?: string) => {
    setAudit((prev) => [
      {
        id: `au${Date.now()}`,
        actor: "Priya Singh",
        action,
        resource,
        caseRef,
        ip: "10.0.4.12",
        timestamp: "Just now",
      },
      ...prev,
    ]);
  }, []);

  const updateCaseStatus = useCallback(
    (id: string, status: KycCase["status"]) => {
      setCases((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, slaDue: status === "approved" ? "—" : c.slaDue } : c)),
      );
      const c = cases.find((x) => x.id === id);
      if (c) {
        appendAudit(`Case ${status.replace("_", " ")}`, c.reference, c.reference);
        setSelectedCase((sel) => (sel?.id === id ? { ...sel, status } : sel));
      }
    },
    [cases, appendAudit],
  );

  const handleApprove = (id: string) => updateCaseStatus(id, "approved");
  const handleReject = (id: string) => updateCaseStatus(id, "rejected");
  const handleEscalate = (id: string) => updateCaseStatus(id, "escalated");

  const panelTitle: Record<KycModuleId, string> = {
    cases: "Case queue",
    identity: "Identity verification",
    screening: "PEP & sanctions screening",
    documents: "Document verification",
    monitoring: "Ongoing monitoring",
    audit: "Audit trail",
  };

  return (
    <>
      <EnterprisePageShell
        metrics={[
          {
            label: "In review queue",
            value: String(metrics.queue),
            hint: "SLA tracked",
            icon: Clock,
            tone: "amber",
            onClick: () => setModule("cases"),
          },
          {
            label: "Approved",
            value: String(metrics.approvedToday),
            hint: "Active cases",
            icon: FileCheck,
            tone: "emerald",
            onClick: () => setModule("cases"),
          },
          {
            label: "High risk",
            value: String(metrics.highRisk),
            hint: "Requires EDD",
            icon: AlertTriangle,
            tone: "rose",
            onClick: () => setModule("cases"),
          },
          {
            label: "Open screening hits",
            value: String(metrics.openAlerts),
            hint: "PEP / sanctions / media",
            icon: Radar,
            tone: "blue",
            onClick: () => setModule("screening"),
          },
        ]}
      >
        <div className="space-y-6">
          <KycModuleNav active={module} onChange={setModule} counts={moduleCounts} />

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              {panelTitle[module]}
            </h2>

            {module === "cases" && (
              <KycCasesPanel
                cases={cases}
                search={search}
                onSelectCase={setSelectedCase}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}
            {module === "identity" && (
              <KycIdentityPanel cases={cases} onSelectCase={setSelectedCase} />
            )}
            {module === "screening" && (
              <KycScreeningPanel
                alerts={alerts}
                search={search}
                onClear={(id) => {
                  setAlerts((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: "cleared" as const } : a)),
                  );
                  appendAudit("Screening alert cleared", id);
                }}
                onConfirm={(id) => {
                  setAlerts((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: "confirmed" as const } : a)),
                  );
                  appendAudit("Screening hit confirmed", id);
                }}
              />
            )}
            {module === "documents" && (
              <KycDocumentsPanel
                documents={documents}
                search={search}
                onVerify={(id) => {
                  setDocuments((prev) =>
                    prev.map((d) =>
                      d.id === id ? { ...d, status: "verified" as const, ocrConfidence: 96 } : d,
                    ),
                  );
                  appendAudit("Document verified", id);
                }}
                onReject={(id) => {
                  setDocuments((prev) =>
                    prev.map((d) => (d.id === id ? { ...d, status: "failed" as const } : d)),
                  );
                  appendAudit("Document rejected", id);
                }}
              />
            )}
            {module === "monitoring" && (
              <KycMonitoringPanel
                events={monitoring}
                onAcknowledge={(id) => {
                  setMonitoring((prev) => prev.filter((e) => e.id !== id));
                  appendAudit("Monitoring alert acknowledged", id);
                }}
              />
            )}
            {module === "audit" && <KycAuditPanel entries={audit} />}
          </section>
        </div>
      </EnterprisePageShell>

      <KycNewCaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(record) => {
          setCases((prev) => [record, ...prev]);
          appendAudit("Case opened", record.reference, record.reference);
        }}
      />

      <KycCaseDetailDrawer
        caseRecord={selectedCase}
        onClose={() => setSelectedCase(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onEscalate={handleEscalate}
      />
    </>
  );
}
