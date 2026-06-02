"use client";

import { useEffect } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  Mail,
  Shield,
  X,
  XCircle,
} from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import {
  VERIFICATION_TYPE_LABELS,
  type KycCase,
} from "@/features/workspace/data/kyc-demo";
import { cn } from "@/lib/utils/cn";

const riskTone = { low: "emerald", medium: "amber", high: "rose" } as const;
const statusTone = {
  pending: "amber",
  in_review: "blue",
  approved: "emerald",
  rejected: "rose",
  escalated: "purple",
} as const;

type Props = {
  caseRecord: KycCase | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEscalate: (id: string) => void;
};

export function KycCaseDetailDrawer({
  caseRecord,
  onClose,
  onApprove,
  onReject,
  onEscalate,
}: Props) {
  useEffect(() => {
    if (!caseRecord) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [caseRecord, onClose]);

  if (!caseRecord) return null;

  const docPct = Math.round(
    (caseRecord.documentsComplete / Math.max(caseRecord.documentsTotal, 1)) * 100,
  );

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className="relative z-[1] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{caseRecord.reference}</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{caseRecord.applicant}</h2>
            <p className="text-sm text-slate-500">{caseRecord.company}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={caseRecord.status.replace("_", " ")} tone={statusTone[caseRecord.status]} />
            <StatusBadge label={`${caseRecord.risk} risk`} tone={riskTone[caseRecord.risk]} />
            {caseRecord.pepHit ? <StatusBadge label="PEP hit" tone="rose" /> : null}
            {caseRecord.sanctionsHit ? <StatusBadge label="Sanctions" tone="rose" /> : null}
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              {caseRecord.email}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Globe className="h-4 w-4 text-slate-400" />
              {caseRecord.jurisdiction}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Building2 className="h-4 w-4 text-slate-400" />
              {VERIFICATION_TYPE_LABELS[caseRecord.verificationType]}
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Shield className="h-4 w-4 text-slate-400" />
              Provider: {caseRecord.provider} · AI score {caseRecord.aiScore}%
            </div>
          </dl>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Documents</span>
              <span className="text-slate-500">
                {caseRecord.documentsComplete}/{caseRecord.documentsTotal}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${docPct}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">SLA: {caseRecord.slaDue} · Owner: {caseRecord.owner}</p>
          </div>

          {(caseRecord.pepHit || caseRecord.sanctionsHit) && (
            <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>Screening hits require manual review before approval. Check PEP & sanctions module.</p>
            </div>
          )}
        </div>

        {caseRecord.status !== "approved" && caseRecord.status !== "rejected" ? (
          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onApprove(caseRecord.id)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => onEscalate(caseRecord.id)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
              >
                <FileText className="h-4 w-4" />
                Escalate
              </button>
              <button
                type="button"
                onClick={() => onReject(caseRecord.id)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className={cn("border-t border-slate-100 p-4 text-center text-sm text-slate-500 dark:border-slate-800")}>
            Case is {caseRecord.status.replace("_", " ")}.
          </div>
        )}
      </aside>
    </div>
  );
}
