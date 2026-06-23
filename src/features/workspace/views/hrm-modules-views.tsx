"use client";

import { Wallet } from "lucide-react";

import { HrmModuleTableView, StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import { DEMO_HRM_LOANS, type HrmLoanRecord } from "@/features/workspace/data/hrm-modules-demo";

export { HrmRecruitmentView } from "@/features/workspace/views/hrm-recruitment-view";
export { HrmGrievancesView } from "@/features/workspace/views/hrm-grievances-view";

export function HrmLoansView() {
  return (
    <HrmModuleTableView<HrmLoanRecord>
      module="People · HRM · Loans"
      title="Loans & advances"
      description="Salary advances, personal loans, approval workflow, and repayment status."
      stats={[
        { label: "Active", value: String(DEMO_HRM_LOANS.filter((l) => l.status === "repaying" || l.status === "approved").length), icon: Wallet, tone: "brand" },
      ]}
      rows={DEMO_HRM_LOANS}
      columns={[
        { key: "id", label: "ID" },
        { key: "employee", label: "Employee" },
        { key: "type", label: "Type" },
        {
          key: "amount",
          label: "Amount",
          render: (r) => `₹ ${r.amount.toLocaleString("en-IN")}`,
        },
        {
          key: "status",
          label: "Status",
          render: (r) => <StatusPill label={r.status} tone={r.status === "approved" || r.status === "repaying" ? "success" : "warning"} />,
        },
        { key: "requestedAt", label: "Requested" },
      ]}
    />
  );
}
