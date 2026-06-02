"use client";

import { useMemo, useState } from "react";
import { Bell, CheckCheck, Mail, MessageCircle } from "lucide-react";

import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import { cn } from "@/lib/utils/cn";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  module: string;
  priority: "high" | "medium" | "low";
  read: boolean;
  time: string;
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "SLA breach on lead queue",
    body: "12 leads exceeded first-response SLA in CRM.",
    module: "CRM",
    priority: "high",
    read: false,
    time: "12m ago",
  },
  {
    id: "n2",
    title: "KYC case approved",
    body: "NovaPay UBO verification completed.",
    module: "KYC",
    priority: "medium",
    read: false,
    time: "1h ago",
  },
  {
    id: "n3",
    title: "Invoice INV-2038 overdue",
    body: "Automated reminder sent to billing contact.",
    module: "Invoicing",
    priority: "high",
    read: true,
    time: "3h ago",
  },
];

export function NotificationsView() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEMO_NOTIFICATIONS.filter((n) => {
      const matchesTab =
        tab === "all" || (tab === "unread" && !n.read) || (tab === "read" && n.read);
      const matchesSearch = !q || n.title.toLowerCase().includes(q) || n.module.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [search, tab]);

  return (
    <EnterprisePageShell
      eyebrow="System"
      title="Notifications"
      description="Alerts across CRM, KYC, invoicing, and AI workflows — with channel preferences and digests."
      metrics={[
        { label: "Unread", value: "12", icon: Bell, tone: "blue" },
        { label: "Email queued", value: "4", icon: Mail, tone: "amber" },
        { label: "WhatsApp", value: "8", icon: MessageCircle, tone: "emerald" },
        { label: "Cleared today", value: "56", icon: CheckCheck, tone: "slate" },
      ]}
      toolbar={
        <EnterpriseToolbar
          searchPlaceholder="Search notifications…"
          searchValue={search}
          onSearchChange={setSearch}
          primaryLabel="Preferences"
          showExport={false}
        />
      }
      tabs={
        <EnterpriseSegmentTabs
          activeId={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "read", label: "Read" },
          ]}
        />
      }
    >
      <ul className="space-y-2">
        {filtered.map((n) => (
          <li
            key={n.id}
            className={cn(
              "rounded-xl border px-4 py-3 transition",
              n.read
                ? "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
                : "border-blue-200/80 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    {n.module}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                      n.priority === "high" && "bg-rose-100 text-rose-700",
                      n.priority === "medium" && "bg-amber-100 text-amber-700",
                      n.priority === "low" && "bg-slate-100 text-slate-600",
                    )}
                  >
                    {n.priority}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-500">{n.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </EnterprisePageShell>
  );
}
