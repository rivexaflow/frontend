"use client";

import { ChevronRight } from "lucide-react";

import {
  PerformanceBandBadge,
  PerformanceScoreRing,
  PerformanceStageBar,
} from "@/features/workspace/components/hrm/performance/performance-primitives";
import type { PerformanceEmployee } from "@/features/workspace/data/hrm-performance-demo";
import { initials } from "@/features/workspace/data/hrm-performance-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  employees: PerformanceEmployee[];
  selectedId: string | null;
  onSelect: (employee: PerformanceEmployee) => void;
};

export function PerformanceEmployeesTable({ employees, selectedId, onSelect }: Props) {
  if (employees.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
        No employees in this team yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Band</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const selected = selectedId === emp.id;
              return (
                <tr
                  key={emp.id}
                  onClick={() => onSelect(emp)}
                  className={cn(
                    "cursor-pointer border-b border-slate-50 transition hover:bg-[#2277ff]/[0.03]",
                    selected && "bg-[#2277ff]/[0.06]",
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#191970] text-[10px] font-bold text-white">
                        {initials(emp.name)}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{emp.name}</p>
                        <p className="text-[11px] text-slate-400">{emp.teamName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{emp.designation}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PerformanceScoreRing score={emp.score} band={emp.band} size={40} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PerformanceBandBadge band={emp.band} />
                  </td>
                  <td className="px-4 py-3">
                    <PerformanceStageBar stage={emp.stage} progress={emp.stageProgress} band={emp.band} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">{emp.joinedAt}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-[#2277ff]" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
