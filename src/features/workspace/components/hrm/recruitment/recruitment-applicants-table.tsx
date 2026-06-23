"use client";

import { Mail, Star, Video } from "lucide-react";

import { StatusPill } from "@/features/workspace/components/hrm/hrm-module-table";
import type { HrmCandidate } from "@/features/workspace/data/hrm-recruitment-demo";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

const STAGE_LABEL: Record<HrmCandidate["stageId"], string> = {
  applicant: "Applicant",
  interviewed: "Interviewed",
  hired: "Hired",
};

const STAGE_TONE: Record<HrmCandidate["stageId"], "default" | "success" | "warning"> = {
  applicant: "default",
  interviewed: "warning",
  hired: "success",
};

function avatarColor(name: string) {
  const colors = ["bg-[#191970]", "bg-[#2277ff]", "bg-emerald-600", "bg-amber-500", "bg-rose-500"];
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  candidates: HrmCandidate[];
  onSelect?: (candidate: HrmCandidate) => void;
  onSchedule?: (candidate: HrmCandidate) => void;
  emptyMessage?: string;
};

export function RecruitmentApplicantsTable({
  candidates,
  onSelect,
  onSchedule,
  emptyMessage = "No applicants match your filters.",
}: Props) {
  if (candidates.length === 0) {
    return <p className="py-12 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className={crm.tableHead}>
            <th className="px-4 py-3 font-bold">Candidate</th>
            <th className="px-4 py-3 font-bold">Role</th>
            <th className="px-4 py-3 font-bold">Stage</th>
            <th className="px-4 py-3 font-bold">Score</th>
            <th className="px-4 py-3 font-bold">Applied</th>
            <th className="px-4 py-3 font-bold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {candidates.map((c, i) => (
            <tr
              key={c.id}
              onClick={() => onSelect?.(c)}
              className={cn(
                crm.tableRow,
                onSelect && "cursor-pointer",
                i % 2 === 1 && "bg-slate-50/50 dark:bg-slate-950/20",
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                      avatarColor(c.name),
                    )}
                  >
                    {initials(c.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                    <p className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3 w-3" />
                      {c.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{c.role}</td>
              <td className="px-4 py-3">
                <StatusPill label={STAGE_LABEL[c.stageId]} tone={STAGE_TONE[c.stageId]} />
              </td>
              <td className="px-4 py-3">
                {c.score != null ? (
                  <span className="inline-flex items-center gap-0.5 font-semibold text-[#2277ff]">
                    <Star className="h-3.5 w-3.5 fill-[#2277ff]" />
                    {c.score}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-slate-500">{c.appliedAt}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSchedule?.(c);
                  }}
                  className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700"
                >
                  <Video className="h-3 w-3" />
                  Schedule
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
