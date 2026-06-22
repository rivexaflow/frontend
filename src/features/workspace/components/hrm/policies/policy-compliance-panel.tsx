"use client";

import { ShieldCheck } from "lucide-react";

import { PolicyStatusBadge } from "@/features/workspace/components/hrm/policies/policy-status-badge";
import {
  categoryMeta,
  getPolicyLibraryStats,
  policyAckPct,
} from "@/features/workspace/data/hrm-policies-ui";
import type { HrmPolicyRecord } from "@/types/hrm";

type Props = {
  policies: HrmPolicyRecord[];
  onSelect: (id: string) => void;
};

export function PolicyCompliancePanel({ policies, onSelect }: Props) {
  const stats = getPolicyLibraryStats(policies);
  const published = policies.filter(
    (p) => p.status === "published" && p.acknowledgmentRequired,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Org compliance", value: `${stats.avgAck}%`, hint: "Avg acknowledgment" },
          { label: "Pending employees", value: stats.pendingTotal, hint: "Across all policies" },
          { label: "Published policies", value: stats.published, hint: "Live in library" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#191970]/15 bg-[#191970]/[0.04] px-4 py-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[#191970]">{item.value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{item.hint}</p>
          </div>
        ))}
      </div>

      {stats.pendingTotal > 0 ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>{stats.pendingTotal} employees</strong> still need to acknowledge one or more
            published policies. Open a policy to send targeted reminders.
          </p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3">Policy</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Acknowledged</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {published.map((policy) => {
              const pct = policyAckPct(policy);
              const meta = categoryMeta(policy.category);
              return (
                <tr key={policy.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-900">{policy.title}</td>
                  <td className="px-4 py-3 text-slate-500">{meta.label}</td>
                  <td className="px-4 py-3">
                    <PolicyStatusBadge status={policy.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">
                    {policy.acknowledgedCount} / {policy.totalEmployees}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold tabular-nums text-[#191970]">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelect(policy.id)}
                      className="text-xs font-semibold text-[#191970] hover:underline"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {published.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-slate-500">
            No published policies require acknowledgment yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
