"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { CrmPanel, CrmPanelBody, CrmPanelHead } from "@/features/workspace/components/crm/crm-panel";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { CrmRecordAvatar } from "@/features/workspace/components/crm/crm-ui-primitives";
import { CrmPageHeader } from "@/features/workspace/components/crm/crm-workspace-header";
import { DEMO_CRM_WHATSAPP_THREADS } from "@/features/workspace/data/crm-extended-demo";
import { cn } from "@/lib/utils/cn";

export function CrmWhatsappView() {
  const [threads] = useState(DEMO_CRM_WHATSAPP_THREADS);
  const [activeId, setActiveId] = useState(threads[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const active = threads.find((t) => t.id === activeId);

  const visible = threads.filter((t) => !query || t.name.toLowerCase().includes(query.toLowerCase()));
  const unread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="pb-8">
      <CrmPageHeader
        eyebrow="Messaging · CRM"
        title="WhatsApp"
        description="Conversations linked to leads — respond without leaving the CRM."
        metrics={[
          { label: "Threads", value: threads.length },
          { label: "Unread", value: unread },
        ]}
      />

      <CrmPanel className="grid min-h-[520px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-100 lg:border-b-0 lg:border-r dark:border-slate-800">
          <CrmPanelHead title="Inbox" subtitle={`${visible.length} conversations`} />
          <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations…"
              className={cn(crm.inputSm, "w-full")}
            />
          </div>
          <ul className="max-h-[420px] overflow-y-auto">
            {visible.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-slate-50 px-3 py-2.5 text-left transition hover:bg-slate-50 dark:border-slate-800",
                    activeId === t.id && "bg-[#191970]/5",
                  )}
                >
                  <CrmRecordAvatar name={t.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">{t.name}</span>
                      <span className="shrink-0 text-[10px] text-slate-400">{t.time}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{t.lastMessage}</span>
                  </span>
                  {t.unread > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#191970] px-1 text-[10px] font-bold text-white">
                      {t.unread}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col">
          {active ? (
            <>
              <CrmPanelHead title={active.name} subtitle={active.phone} />
              <div className="flex-1 space-y-3 bg-slate-50/40 p-4 dark:bg-slate-950/20">
                <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {active.lastMessage}
                </div>
                <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-[#191970] px-3 py-2 text-sm text-white">
                  Hi {active.name.split(" ")[0]}, thanks for reaching out — sharing details shortly.
                </div>
              </div>
              <form
                className="flex gap-2 border-t border-slate-100 p-3 dark:border-slate-800"
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessage("");
                }}
              >
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message…"
                  className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#191970]"
                />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a]"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <CrmPanelBody>
              <p className="py-20 text-center text-sm text-slate-500">Select a conversation</p>
            </CrmPanelBody>
          )}
        </div>
      </CrmPanel>
    </div>
  );
}
