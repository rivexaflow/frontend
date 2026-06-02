"use client";

import { History } from "lucide-react";

import type { AuditEntry } from "@/features/workspace/data/kyc-demo";

type Props = {
  entries: AuditEntry[];
};

export function KycAuditPanel({ entries }: Props) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800">
        Immutable audit trail for regulator examinations — every approval, rejection, screening decision, and system rescreen is logged with actor and timestamp.
      </p>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.map((entry) => (
            <li key={entry.id} className="flex gap-4 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800">
                <History className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{entry.action}</p>
                  {entry.caseRef ? (
                    <span className="font-mono text-[10px] font-bold text-blue-600">{entry.caseRef}</span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">
                  {entry.actor} · {entry.resource}
                  {entry.ip !== "—" ? ` · ${entry.ip}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{entry.timestamp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
