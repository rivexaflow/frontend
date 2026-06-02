"use client";

import { useMemo, useState } from "react";
import { Building2, User } from "lucide-react";

import { EnterpriseSegmentTabs } from "@/features/workspace/components/enterprise/enterprise-segment-tabs";
import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import {
  VERIFICATION_TYPE_LABELS,
  type KycCase,
  type VerificationType,
} from "@/features/workspace/data/kyc-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  cases: KycCase[];
  onSelectCase: (c: KycCase) => void;
};

export function KycIdentityPanel({ cases, onSelectCase }: Props) {
  const [tab, setTab] = useState<"all" | VerificationType>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return cases;
    return cases.filter((c) => c.verificationType === tab);
  }, [cases, tab]);

  const individual = cases.filter((c) => c.verificationType === "individual_kyc").length;
  const corporate = cases.filter((c) => c.verificationType === "corporate_kyb").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Individual KYC</p>
              <p className="text-xs text-slate-500">ID capture, liveness, biometric match</p>
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">{individual} active</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li>· Government ID & passport (11,000+ types)</li>
            <li>· Active / passive liveness detection</li>
            <li>· Address & utility bill verification</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Corporate KYB</p>
              <p className="text-xs text-slate-500">Entity, directors, UBOs, registry data</p>
            </div>
          </div>
          <p className="mt-4 text-2xl font-bold text-slate-900">{corporate} active</p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li>· Company filings & registry sync</li>
            <li>· Beneficial ownership (UBO) graph</li>
            <li>· Source of funds / wealth (EDD)</li>
          </ul>
        </div>
      </div>

      <EnterpriseSegmentTabs
        activeId={tab}
        onChange={(id) => setTab(id as typeof tab)}
        tabs={[
          { id: "all", label: "All types", count: cases.length },
          { id: "individual_kyc", label: "Individual", count: individual },
          { id: "corporate_kyb", label: "KYB", count: corporate },
          { id: "ubo_verification", label: "UBO" },
          { id: "enhanced_due_diligence", label: "EDD" },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectCase(c)}
            className="rounded-xl border border-slate-200/80 bg-white p-4 text-left transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-[10px] font-bold text-blue-600">{c.reference}</p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">{c.applicant}</p>
            <p className="text-xs text-slate-500">{c.company}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <StatusBadge
                label={VERIFICATION_TYPE_LABELS[c.verificationType].split(" ")[0] ?? "KYC"}
                tone="blue"
              />
              <span className="text-[11px] text-slate-400">{c.jurisdiction}</span>
            </div>
            <p className={cn("mt-2 text-xs font-medium", c.slaDue === "Overdue" ? "text-rose-600" : "text-slate-500")}>
              SLA: {c.slaDue}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
