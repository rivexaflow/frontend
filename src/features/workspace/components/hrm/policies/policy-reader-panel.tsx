"use client";

import { useState } from "react";
import {
  Archive,
  ArrowLeft,
  Download,
  Loader2,
  Send,
  UserCheck,
} from "lucide-react";

import { PolicyStatusBadge } from "@/features/workspace/components/hrm/policies/policy-status-badge";
import { categoryMeta, policyAckPct } from "@/features/workspace/data/hrm-policies-ui";
import type { HrmPolicyRecord, HrmPolicyStatus, PolicyAcknowledgment } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type ReaderTab = "document" | "acknowledgment";

type Props = {
  policy: HrmPolicyRecord;
  loading: boolean;
  acknowledgments: PolicyAcknowledgment[];
  actionLoading: boolean;
  onBack: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onExport: () => void;
  onRemind: () => void;
  onAcknowledge: () => void;
};

export function PolicyReaderPanel({
  policy,
  loading,
  acknowledgments,
  actionLoading,
  onBack,
  onPublish,
  onArchive,
  onExport,
  onRemind,
  onAcknowledge,
}: Props) {
  const [readerTab, setReaderTab] = useState<ReaderTab>("document");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const meta = categoryMeta(policy.category);
  const ackPct = policyAckPct(policy);
  const pending = Math.max(0, policy.totalEmployees - policy.acknowledgedCount);

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    document.getElementById(`policy-section-${sectionId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#191970] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        All policies
      </button>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className={cn("border-b border-slate-100 bg-gradient-to-r px-5 py-5", meta.surface)}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {meta.label} · Version {policy.version}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{policy.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Effective {policy.effectiveFrom} · Owner {policy.owner}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {policy.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500 ring-1 ring-slate-200/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PolicyStatusBadge status={policy.status} />
              {policy.status === "draft" ? (
                <button
                  type="button"
                  onClick={onPublish}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white hover:bg-[#12124a]"
                >
                  <Send className="h-3.5 w-3.5" />
                  Publish
                </button>
              ) : null}
              {policy.status === "published" ? (
                <button
                  type="button"
                  onClick={onArchive}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </button>
              ) : null}
              <button
                type="button"
                disabled={actionLoading}
                onClick={onExport}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export PDF
              </button>
            </div>
          </div>

          {policy.acknowledgmentRequired && policy.status === "published" ? (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="min-w-[200px] flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Acknowledgment progress</span>
                  <span className="font-bold tabular-nums text-[#191970]">{ackPct}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#191970] to-emerald-500"
                    style={{ width: `${ackPct}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-3 text-xs font-medium text-slate-600">
                <span>
                  <strong className="text-emerald-700">{policy.acknowledgedCount}</strong> done
                </span>
                <span>
                  <strong className="text-amber-700">{pending}</strong> pending
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex gap-1 rounded-lg border border-white/80 bg-white/60 p-0.5">
            {(["document", "acknowledgment"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setReaderTab(tab)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition",
                  readerTab === tab
                    ? "bg-[#191970] text-white"
                    : "text-slate-600 hover:bg-white",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading policy…
          </div>
        ) : readerTab === "document" ? (
          <div className="flex min-h-[480px] flex-col lg:flex-row">
            <nav className="shrink-0 border-b border-slate-100 px-5 py-4 lg:w-56 lg:border-b-0 lg:border-r">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Contents
              </p>
              <ul className="mt-3 space-y-1">
                {policy.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "w-full rounded-md px-2 py-1.5 text-left text-xs font-medium transition",
                        activeSectionId === section.id
                          ? "bg-[#191970]/10 text-[#191970]"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      {section.heading}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <article className="min-w-0 flex-1 overflow-y-auto px-5 py-6 lg:max-h-[560px]">
              <p className="mb-6 rounded-xl border border-[#2277ff]/15 bg-[#2277ff]/[0.04] px-4 py-3 text-sm leading-relaxed text-slate-600">
                {policy.summary}
              </p>
              <div className="space-y-8">
                {policy.sections.map((section) => (
                  <section key={section.id} id={`policy-section-${section.id}`} className="scroll-mt-4">
                    <h3 className="text-base font-bold text-slate-900">{section.heading}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
                  </section>
                ))}
              </div>
              <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-400">
                Last updated {policy.lastUpdated}
                {policy.publishedAt ? ` · Published ${policy.publishedAt}` : ""}
              </p>
            </article>
          </div>
        ) : (
          <PolicyAcknowledgmentTab
            policy={policy}
            acknowledgments={acknowledgments}
            actionLoading={actionLoading}
            onRemind={onRemind}
            onAcknowledge={onAcknowledge}
          />
        )}
      </div>
    </div>
  );
}

function PolicyAcknowledgmentTab({
  policy,
  acknowledgments,
  actionLoading,
  onRemind,
  onAcknowledge,
}: {
  policy: HrmPolicyRecord;
  acknowledgments: PolicyAcknowledgment[];
  actionLoading: boolean;
  onRemind: () => void;
  onAcknowledge: () => void;
}) {
  const ackPct = policyAckPct(policy);
  const pending = Math.max(0, policy.totalEmployees - policy.acknowledgedCount);

  return (
    <div className="overflow-y-auto px-5 py-6 lg:max-h-[560px]">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Acknowledged", value: policy.acknowledgedCount, tone: "text-emerald-600" },
          { label: "Pending", value: pending, tone: "text-amber-600" },
          { label: "Completion", value: `${ackPct}%`, tone: "text-[#191970]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums", stat.tone)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-600">
        {policy.acknowledgmentRequired
          ? "Employees must acknowledge within 14 days of publish. Overdue accounts appear in compliance reports."
          : "Acknowledgment is not required for this policy."}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={actionLoading || policy.status !== "published"}
          onClick={onRemind}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Send reminders
        </button>
        <button
          type="button"
          disabled={actionLoading || policy.status !== "published"}
          onClick={onAcknowledge}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          <UserCheck className="h-4 w-4" />
          Record my acknowledgment
        </button>
      </div>

      {acknowledgments.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200/80">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Acknowledged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {acknowledgments.map((ack) => (
                <tr key={ack.employeeId}>
                  <td className="px-4 py-3 font-medium text-slate-900">{ack.employeeName}</td>
                  <td className="px-4 py-3 text-slate-500">{ack.department ?? "—"}</td>
                  <td className="px-4 py-3 capitalize text-slate-600">{ack.status}</td>
                  <td className="px-4 py-3 text-slate-500">{ack.acknowledgedAt ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
