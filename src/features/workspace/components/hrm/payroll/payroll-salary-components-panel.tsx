"use client";

import Link from "next/link";
import { Settings2, UserRound } from "lucide-react";

import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type Props = {
  className?: string;
};

export function PayrollSalaryComponentsPanel({ className }: Props) {
  return (
    <div className={cn("mb-6 flex flex-wrap gap-2", className)}>
      <Link
        href={`${workspacePaths.hrmSetup}?section=payroll`}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#191970]/30 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Settings2 className="h-4 w-4 text-[#191970]" />
        Configure heads in HR setup
      </Link>
      <Link
        href={workspacePaths.hrmEmployees}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#191970]/30 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <UserRound className="h-4 w-4 text-[#191970]" />
        Set amounts on employee profiles
      </Link>
    </div>
  );
}
