"use client";

import type { ElementType } from "react";
import {
  ClipboardList,
  FileSearch,
  History,
  Radar,
  ScanLine,
  UserCheck,
} from "lucide-react";

import { KYC_MODULES, type KycModuleId } from "@/features/workspace/data/kyc-demo";
import { cn } from "@/lib/utils/cn";

const icons: Record<KycModuleId, ElementType> = {
  cases: ClipboardList,
  identity: UserCheck,
  screening: Radar,
  documents: ScanLine,
  monitoring: FileSearch,
  audit: History,
};

type Props = {
  active: KycModuleId;
  onChange: (id: KycModuleId) => void;
  counts?: Partial<Record<KycModuleId, number>>;
};

export function KycModuleNav({ active, onChange, counts }: Props) {
  return (
    <nav
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      aria-label="KYC modules"
    >
      {KYC_MODULES.map((mod) => {
        const Icon = icons[mod.id];
        const isActive = active === mod.id;
        const count = counts?.[mod.id];
        return (
          <button
            key={mod.id}
            type="button"
            onClick={() => onChange(mod.id)}
            className={cn(
              "flex flex-col items-start rounded-xl border p-3.5 text-left transition",
              isActive
                ? "border-blue-200 bg-blue-50/80 shadow-sm ring-1 ring-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:ring-blue-900/50"
                : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              {count !== undefined && count > 0 ? (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                  {count}
                </span>
              ) : null}
            </div>
            <span className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{mod.label}</span>
            <span className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">{mod.description}</span>
          </button>
        );
      })}
    </nav>
  );
}
