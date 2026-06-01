"use client";

import { useMemo, useState } from "react";
import { AlertCircle, DollarSign, FileText, Send } from "lucide-react";

import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { DEMO_INVOICES, type InvoiceRecord } from "@/features/workspace/data/module-records-demo";

const statusTone = {
  draft: "slate",
  sent: "blue",
  paid: "emerald",
  overdue: "rose",
} as const;

const columns: TableColumn<InvoiceRecord>[] = [
  { key: "number", header: "Invoice", render: (r) => <span className="font-semibold">{r.number}</span> },
  { key: "client", header: "Client", render: (r) => <span className="text-sm">{r.client}</span> },
  { key: "amount", header: "Amount", render: (r) => <span className="font-semibold">{r.amount}</span> },
  { key: "due", header: "Due", render: (r) => <span className="text-sm text-slate-500">{r.dueDate}</span> },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge label={r.status} tone={statusTone[r.status]} />,
  },
];

export function InvoicesView() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEMO_INVOICES.filter((row) => {
      const matchesTab = tab === "all" || row.status === tab;
      const matchesSearch =
        !q || row.number.toLowerCase().includes(q) || row.client.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [search, tab]);

  return (
    <EnterprisePageShell
      eyebrow="Finance"
      title="Invoicing"
      description="Quotes, invoices, payment tracking, tax profiles, and automated dunning across currencies."
      metrics={[
        { label: "Outstanding", value: "$186k", hint: "Net 30", icon: DollarSign, tone: "blue" },
        { label: "Sent this week", value: "24", icon: Send, tone: "emerald" },
        { label: "Overdue", value: "5", icon: AlertCircle, tone: "rose" },
        { label: "Collected MTD", value: "$92k", trend: "+18%", trendUp: true, icon: FileText, tone: "purple" },
      ]}
      toolbar={
        <EnterpriseToolbar
          searchPlaceholder="Search invoices…"
          searchValue={search}
          onSearchChange={setSearch}
          primaryLabel="Create invoice"
        />
      }
      tabs={
        <EnterpriseSegmentTabs
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "draft", label: "Draft" },
            { id: "sent", label: "Sent" },
            { id: "paid", label: "Paid" },
            { id: "overdue", label: "Overdue" },
          ]}
        />
      }
    >
      <EnterpriseDataTable columns={columns} rows={filtered} />
    </EnterprisePageShell>
  );
}
