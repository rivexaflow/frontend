import type { HrmDocumentCategory } from "@/types/hrm";

export function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    contract: "Employment contract",
    offer_letter: "Offer letter",
    id_proof: "ID proof",
    certificate: "Certificate",
    policy_ack: "Policy acknowledgment",
    other: "Other",
  };
  return map[category] ?? category;
}

export const CATEGORY_PALETTE: Record<
  string,
  { surface: string; border: string; accent: string; icon: string }
> = {
  id_proof: {
    surface: "from-[#eef2ff] via-white to-[#f5f7ff]",
    border: "border-[#c7d2fe]/70 hover:border-[#2277ff]/45",
    accent: "text-[#191970]",
    icon: "from-[#191970] to-[#2277ff]",
  },
  contract: {
    surface: "from-[#ecfdf5] via-white to-[#f4fdf8]",
    border: "border-[#a7f3d0]/70 hover:border-emerald-400/45",
    accent: "text-emerald-900",
    icon: "from-emerald-600 to-teal-500",
  },
  offer_letter: {
    surface: "from-[#f0f9ff] via-white to-[#f8fcff]",
    border: "border-[#bae6fd]/70 hover:border-[#0056ff]/45",
    accent: "text-[#0056ff]",
    icon: "from-[#2277ff] to-[#0056ff]",
  },
  certificate: {
    surface: "from-[#fffbeb] via-white to-[#fffdf5]",
    border: "border-[#fde68a]/70 hover:border-amber-400/45",
    accent: "text-amber-950",
    icon: "from-amber-500 to-orange-500",
  },
  policy_ack: {
    surface: "from-slate-50 via-white to-slate-50",
    border: "border-slate-200/80 hover:border-slate-400/45",
    accent: "text-slate-800",
    icon: "from-slate-600 to-slate-800",
  },
  other: {
    surface: "from-[#f8fafc] via-white to-[#f1f5f9]",
    border: "border-slate-200/80 hover:border-slate-300",
    accent: "text-slate-700",
    icon: "from-slate-500 to-slate-700",
  },
};

export function paletteForCategory(category: string) {
  return CATEGORY_PALETTE[category] ?? CATEGORY_PALETTE.other;
}

export type DocumentTypeStats = {
  total: number;
  submitted: number;
  verified: number;
  pending: number;
  missing: number;
};

export function computeDocumentTypeStats(
  submissions: { submitted: boolean; status: string }[],
): DocumentTypeStats {
  const total = submissions.length;
  const submitted = submissions.filter((s) => s.submitted).length;
  const verified = submissions.filter((s) => s.status === "verified").length;
  const pending = submissions.filter((s) => s.status === "pending").length;
  const missing = submissions.filter((s) => !s.submitted || s.status === "not_submitted").length;
  return { total, submitted, verified, pending, missing };
}

export function computeOrgCompliancePct(stats: DocumentTypeStats[]) {
  const total = stats.reduce((s, t) => s + t.total, 0);
  const verified = stats.reduce((s, t) => s + t.verified, 0);
  return total > 0 ? Math.round((verified / total) * 100) : 0;
}

/** Employees who still need to upload or re-upload a document. */
export function isReminderEligible(submission: {
  submitted: boolean;
  status: string;
}) {
  return (
    !submission.submitted ||
    submission.status === "not_submitted" ||
    submission.status === "rejected" ||
    submission.status === "expired"
  );
}

export function buildDefaultRemindMessage(documentTitle: string) {
  return `Hi {{name}},\n\nThis is a reminder to upload your "${documentTitle}" in the employee documents portal. This document is required for HR compliance and payroll processing.\n\nPlease sign in and submit the file at your earliest convenience. If you have already uploaded it, you can ignore this message.\n\nThank you,\nHR Team`;
}

export function personalizeRemindMessage(template: string, employeeName: string) {
  const firstName = employeeName.trim().split(/\s+/)[0] ?? employeeName;
  return template.replace(/\{\{name\}\}/g, firstName);
}
