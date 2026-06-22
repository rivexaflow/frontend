"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Eye, RefreshCw, User } from "lucide-react";

import {
  CrmFilterButton,
  CrmPanel,
  CrmPanelBody,
  CrmPanelFooter,
  CrmPanelHead,
  CrmPanelToolbar,
} from "@/features/workspace/components/crm/crm-panel";
import { CrmListSummary } from "@/features/workspace/components/crm/crm-list-summary";
import { CrmGhostButton, CrmPrimaryButton, CrmRecordAvatar, CrmSourceTag } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { DEMO_CRM_WEBHOOKS, type CrmWebhookRecord } from "@/features/workspace/data/crm-extended-demo";

export function CrmWebhooksView() {
  const [rows] = useState<CrmWebhookRecord[]>(DEMO_CRM_WEBHOOKS);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.subjectName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        r.assignedTo.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const converted = rows.filter((r) => r.status === "converted").length;
  const failed = rows.filter((r) => r.status === "failed").length;

  const columns: TableColumn<CrmWebhookRecord>[] = [
    {
      key: "source",
      header: "Webhook source",
      render: (row) => <CrmSourceTag label={row.source} />,
    },
    {
      key: "subject",
      header: "Data subject / name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <CrmRecordAvatar name={row.subjectName} />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.subjectName}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div>
          <StatusBadge
            label={row.status === "converted" ? "Converted" : row.status === "failed" ? "Failed" : "Pending"}
            tone={row.status === "converted" ? "emerald" : row.status === "failed" ? "rose" : "amber"}
          />
          {row.errorMessage ? (
            <p className="mt-1 flex items-start gap-1 text-[11px] text-rose-600">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
              {row.errorMessage}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "assigned",
      header: "Assigned to",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
          <User className="h-3.5 w-3.5 text-slate-400" />
          {row.assignedTo}
        </span>
      ),
    },
    {
      key: "received",
      header: "Received",
      render: (row) => <span className="text-xs tabular-nums text-slate-500">{row.receivedAt}</span>,
    },
  ];

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="Integrations · CRM"
        title="Webhook data"
        description="Inbound payloads from connected endpoints — review conversion status and assignment."
        metrics={[
          { label: "Logs", value: rows.length },
          { label: "Converted", value: converted },
          { label: "Failed", value: failed },
        ]}
        actions={
          <CrmGhostButton>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </CrmGhostButton>
        }
      />

      <CrmPanel>
        <CrmPanelHead title="Webhook logs" subtitle="All inbound payloads from connected endpoints" accent />
        <CrmPanelToolbar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search name, email, source…"
          filters={<CrmFilterButton />}
        />
        <CrmPanelBody>
          <EnterpriseDataTable
            columns={columns}
            rows={filtered}
            emptyMessage="No webhook logs found."
            renderActions={() => (
              <button type="button" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#191970]" aria-label="View payload">
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
          />
        </CrmPanelBody>
        <CrmPanelFooter>
          <CrmListSummary showing={filtered.length} total={rows.length} label="logs" />
        </CrmPanelFooter>
      </CrmPanel>
    </div>
  );
}
