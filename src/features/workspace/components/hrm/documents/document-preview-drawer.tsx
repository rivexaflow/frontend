"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

import { SubmissionBadge } from "@/features/workspace/components/hrm/documents/document-submission-badge";
import { DocumentPreviewContent } from "@/features/workspace/components/hrm/documents/document-preview-content";
import type { EmployeeDocumentSubmission, HrmDocumentTypeCard } from "@/types/hrm";
import { fetchHrDocumentPreviewUrl } from "@/lib/api/hrm";

type Props = {
  open: boolean;
  companyId: string | null;
  row: EmployeeDocumentSubmission | null;
  type: HrmDocumentTypeCard | null;
  actionLoading: boolean;
  onClose: () => void;
  onVerify: (row: EmployeeDocumentSubmission, status: "verified" | "rejected") => void;
};

function maskId(seed: string): string {
  const digits = seed.replace(/\D/g, "").padEnd(4, "0").slice(0, 4);
  return `XXXX-XXXX-${digits}12`;
}

export function DocumentPreviewDrawer({
  open,
  companyId,
  row,
  type,
  actionLoading,
  onClose,
  onVerify,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!open || !row) {
      setPreviewUrl(null);
      return;
    }
    if (!companyId || !row.submissionId) {
      setPreviewUrl(row.fileUrl ?? null);
      return;
    }
    setPreviewLoading(true);
    void fetchHrDocumentPreviewUrl(companyId, row.submissionId)
      .then(setPreviewUrl)
      .catch(() => setPreviewUrl(row.fileUrl ?? null))
      .finally(() => setPreviewLoading(false));
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [open, companyId, row?.submissionId, row?.fileUrl, row]);

  const isImage =
    row?.fileName?.match(/\.(png|jpg|jpeg|webp)$/i) || previewUrl?.includes("image");
  const maskedId = row ? maskId(row.employeeId) : "";

  return (
    <AnimatePresence>
      {open && row && type ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            aria-label="Close preview"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-slate-200/90 bg-white shadow-2xl"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.04] to-transparent px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Document preview</p>
                  <h2 className="text-lg font-bold text-slate-900">{type.title}</h2>
                  <p className="text-sm text-slate-500">
                    {row.employeeName} · {row.employeeCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3">
                <SubmissionBadge status={row.status} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2.5">
                  <span className="font-mono text-xs text-slate-600">{row.fileName ?? "No file"}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                    {isImage ? "Image" : "PDF"}
                  </span>
                </div>
                <div className="flex min-h-[320px] items-center justify-center p-4">
                  {previewLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  ) : previewUrl ? (
                    isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt={row.fileName ?? "Document preview"}
                        className="max-h-[400px] max-w-full rounded-lg object-contain"
                      />
                    ) : (
                      <iframe
                        src={previewUrl}
                        title={row.fileName ?? "Document preview"}
                        className="h-[400px] w-full rounded-lg border-0 bg-white"
                      />
                    )
                  ) : (
                    <DocumentPreviewContent type={type} row={row} maskedId={maskedId} />
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailTile label="Submitted on" value={row.submittedAt ?? "—"} />
                <DetailTile label="Department" value={row.department} />
                <DetailTile label="Location" value={row.location} />
                <DetailTile label="Verified by" value={row.verifiedBy ?? "—"} />
              </div>

              {row.status === "verified" ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  HR verified — safe for payroll and compliance use.
                </div>
              ) : row.status === "pending" && row.submissionId ? (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onVerify(row, "verified")}
                    className="h-10 flex-1 rounded-lg bg-[#191970] text-sm font-semibold text-white hover:bg-[#12124a] disabled:opacity-50"
                  >
                    Verify document
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onVerify(row, "rejected")}
                    className="h-10 flex-1 rounded-lg border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
