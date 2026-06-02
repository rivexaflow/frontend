"use client";

import { useMemo, useState } from "react";
import { Building2, Mail, Star, Users } from "lucide-react";

import { ContactFormModal } from "@/features/workspace/components/crm/contact-form-modal";
import { CrmListSummary } from "@/features/workspace/components/crm/crm-list-summary";
import {
  EnterpriseDataTable,
  StatusBadge,
  type TableColumn,
} from "@/features/workspace/components/enterprise/enterprise-data-table";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import { DEMO_CONTACTS, type ContactRecord } from "@/features/workspace/data/crm-demo";

const engagementTone: Record<ContactRecord["engagement"], "emerald" | "amber" | "slate"> = {
  high: "emerald",
  medium: "amber",
  low: "slate",
};

function ContactAvatar({ name }: { name: string }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function CrmContactsView() {
  const [contacts, setContacts] = useState<ContactRecord[]>(DEMO_CONTACTS);
  const [search, setSearch] = useState("");
  const { effectiveQuery, validation } = useDebouncedSearch(search, { minLength: 2 });
  const [tab, setTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = effectiveQuery;
    return contacts.filter((row) => {
      const matchesTab = tab === "all" || row.engagement === tab;
      const matchesSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.company.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.role.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [contacts, effectiveQuery, tab]);

  const stats = useMemo(() => {
    const high = contacts.filter((c) => c.engagement === "high").length;
    const accounts = new Set(contacts.map((c) => c.company)).size;
    return { high, accounts };
  }, [contacts]);

  const columns: TableColumn<ContactRecord>[] = [
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div className="flex items-center gap-3">
          <ContactAvatar name={row.name} />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-500">{row.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          {row.company}
        </span>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (row) => (
        <a
          href={`mailto:${row.email}`}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          <Mail className="h-3.5 w-3.5" />
          {row.email}
        </a>
      ),
    },
    {
      key: "engagement",
      header: "Engagement",
      render: (row) => (
        <StatusBadge label={row.engagement} tone={engagementTone[row.engagement]} />
      ),
    },
    { key: "owner", header: "Owner", render: (row) => <span className="text-sm text-slate-600">{row.owner}</span> },
    {
      key: "lastTouch",
      header: "Last touch",
      render: (row) => <span className="text-xs text-slate-500">{row.lastTouch}</span>,
    },
  ];

  return (
    <>
      <EnterprisePageShell
        eyebrow="Operations · CRM"
        title="Contacts"
        description="Account directory with engagement scoring, activity history, and stakeholder mapping."
        metrics={[
          {
            label: "Total contacts",
            value: String(contacts.length),
            hint: "Active directory",
            trend: "+4%",
            trendUp: true,
            icon: Users,
            tone: "blue",
          },
          {
            label: "High engagement",
            value: String(stats.high),
            hint: "Priority accounts",
            icon: Star,
            tone: "emerald",
          },
          {
            label: "Companies",
            value: String(stats.accounts),
            hint: "Unique accounts",
            icon: Building2,
            tone: "amber",
          },
          {
            label: "Owners",
            value: String(new Set(contacts.map((c) => c.owner)).size),
            hint: "Assigned reps",
            icon: Mail,
            tone: "purple",
          },
        ]}
        toolbar={
          <EnterpriseToolbar
            searchPlaceholder="Search contacts…"
            searchValue={search}
            onSearchChange={setSearch}
            searchHint={validation.message}
            primaryLabel="Add contact"
            onPrimaryClick={() => setModalOpen(true)}
          />
        }
        tabs={
          <EnterpriseSegmentTabs
            activeId={tab}
            onChange={setTab}
            tabs={[
              { id: "all", label: "All", count: contacts.length },
              { id: "high", label: "High", count: contacts.filter((c) => c.engagement === "high").length },
              {
                id: "medium",
                label: "Medium",
                count: contacts.filter((c) => c.engagement === "medium").length,
              },
              { id: "low", label: "Low", count: contacts.filter((c) => c.engagement === "low").length },
            ]}
          />
        }
      >
        <div className="mb-3">
          <CrmListSummary showing={filtered.length} total={contacts.length} label="contacts" />
        </div>
        <EnterpriseDataTable
          columns={columns}
          rows={filtered}
          emptyMessage="No contacts match your filters."
        />
      </EnterprisePageShell>

      <ContactFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(contact) => setContacts((prev) => [contact, ...prev])}
      />
    </>
  );
}
