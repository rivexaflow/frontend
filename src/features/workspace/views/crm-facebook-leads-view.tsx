"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, CheckCircle2, Eye, RefreshCw, User } from "lucide-react";

import {
  CrmFilterButton,
  CrmNotice,
  CrmPanel,
  CrmPanelBody,
  CrmPanelFooter,
  CrmPanelHead,
  CrmPanelToolbar,
} from "@/features/workspace/components/crm/crm-panel";
import { CrmListSummary } from "@/features/workspace/components/crm/crm-list-summary";
import { CrmPrimaryButton, CrmRecordAvatar, CrmSourceTag } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { DEMO_CRM_FACEBOOK_LEADS, type CrmFacebookLeadRecord } from "@/features/workspace/data/crm-extended-demo";

const STATUS_META: Record<
  CrmFacebookLeadRecord["status"],
  { label: string; tone: "emerald" | "rose" | "amber" | "blue" | "slate" }
> = {
  new: { label: "New", tone: "blue" },
  imported: { label: "Converted", tone: "emerald" },
  duplicate: { label: "Duplicate", tone: "rose" },
  failed: { label: "Failed", tone: "rose" },
  skipped: { label: "Skipped", tone: "slate" },
};

export function CrmFacebookLeadsView() {
  const [rows] = useState<CrmFacebookLeadRecord[]>(DEMO_CRM_FACEBOOK_LEADS);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.campaign.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const columns: TableColumn<CrmFacebookLeadRecord>[] = [
    {
      key: "feed",
      header: "Feed source",
      render: (row) => <CrmSourceTag label={row.campaign} />,
    },
    {
      key: "lead",
      header: "Lead details",
      render: (row) => (
        <div className="flex items-center gap-3">
          <CrmRecordAvatar name={row.name} />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
            {row.phone ? <p className="text-xs text-slate-400">{row.phone}</p> : null}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const meta = STATUS_META[row.status];
        return (
          <div>
            <StatusBadge label={meta.label} tone={meta.tone} />
            {row.errorMessage ? (
              <p className="mt-1 flex items-start gap-1 text-[11px] text-slate-500">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-rose-500" />
                {row.errorMessage}
              </p>
            ) : null}
          </div>
        );
      },
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
      header: "Received at",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs tabular-nums text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          {row.receivedAt}
        </span>
      ),
    },
  ];

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="Integrations · CRM"
        title="Facebook leads"
        description="Incoming leads from Meta campaigns and lead forms — review before import."
        metrics={[
          { label: "Synced", value: rows.length },
          { label: "New", value: rows.filter((r) => r.status === "new").length },
          { label: "Converted", value: rows.filter((r) => r.status === "imported").length },
        ]}
        actions={
          <CrmPrimaryButton>
            <RefreshCw className="h-3.5 w-3.5" />
            Sync now
          </CrmPrimaryButton>
        }
      />

      <CrmPanel>
        <CrmPanelHead title="Facebook lead logs" subtitle="Incoming leads from Meta campaigns and forms" accent />
        <CrmNotice>
          <strong>Note:</strong> Leads are skipped during sync if they already exist in the CRM log or pipeline to
          prevent duplicates.
        </CrmNotice>
        <CrmPanelToolbar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Quick search…"
          filters={<CrmFilterButton />}
        />
        <CrmPanelBody>
          <EnterpriseDataTable
            columns={columns}
            rows={filtered}
            emptyMessage="No Facebook leads synced yet."
            renderActions={(row) =>
              row.status === "new" ? (
                <button type="button" className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50" aria-label="Import">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button type="button" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100" aria-label="View">
                  <Eye className="h-3.5 w-3.5" />
                </button>
              )
            }
          />
        </CrmPanelBody>
        <CrmPanelFooter>
          <CrmListSummary showing={filtered.length} total={rows.length} label="leads" />
        </CrmPanelFooter>
      </CrmPanel>
    </div>
  );
}
