"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ScanLine, XCircle } from "lucide-react";

import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import { useDebouncedSearch } from "@/features/workspace/hooks/use-debounced-search";
import type { KycDocument } from "@/features/workspace/data/kyc-demo";
import { cn } from "@/lib/utils/cn";

const docStatusTone = {
  pending: "amber",
  verified: "emerald",
  failed: "rose",
  expired: "slate",
} as const;

type Props = {
  documents: KycDocument[];
  search: string;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
};

export function KycDocumentsPanel({ documents, search, onVerify, onReject }: Props) {
  const { effectiveQuery } = useDebouncedSearch(search, { minLength: 2 });
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    const q = effectiveQuery;
    return documents.filter((d) => {
      const matchesTab = tab === "all" || d.status === tab;
      const matchesSearch =
        !q ||
        d.applicant.toLowerCase().includes(q) ||
        d.caseRef.toLowerCase().includes(q) ||
        d.docType.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [documents, effectiveQuery, tab]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "OCR extraction", desc: "Structured fields from IDs & filings" },
          { label: "Liveness check", desc: "Anti-spoofing for selfie flows" },
          { label: "Tamper detection", desc: "Document forensics & expiry" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <ScanLine className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <EnterpriseSegmentTabs
        activeId={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: documents.length },
          { id: "pending", label: "Pending", count: documents.filter((d) => d.status === "pending").length },
          { id: "verified", label: "Verified" },
          { id: "failed", label: "Failed" },
        ]}
      />

      <div className="space-y-2">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">{doc.docType}</p>
                <StatusBadge label={doc.status} tone={docStatusTone[doc.status]} />
                {doc.liveness ? (
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Liveness pass</span>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {doc.applicant} · <span className="font-mono text-xs text-blue-600">{doc.caseRef}</span>
              </p>
              {doc.ocrConfidence > 0 ? (
                <p className="mt-1 text-xs text-slate-400">OCR confidence {doc.ocrConfidence}%</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {doc.status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => onVerify(doc.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(doc.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </>
              ) : (
                <span className={cn("text-xs text-slate-400")}>Uploaded {doc.uploadedAt}</span>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No documents match your filters.</p>
        ) : null}
      </div>
    </div>
  );
}
