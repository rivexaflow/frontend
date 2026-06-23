"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Mail, Star } from "lucide-react";

import { HrmDashboardRecruitmentBoard } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-recruitment-board";
import {
  HRM_DASHBOARD_COLORS,
  type HrmCandidate,
  type HrmOpenPosition,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  position: HrmOpenPosition;
  candidates: HrmCandidate[];
  onChangeCandidates: (next: HrmCandidate[]) => void;
  onBack: () => void;
};

export function HrmDashboardPositionDetail({
  position,
  candidates,
  onChangeCandidates,
  onBack,
}: Props) {
  const roleCandidates = useMemo(
    () => candidates.filter((c) => c.positionId === position.id),
    [candidates, position.id],
  );

  const stageCounts = useMemo(
    () => ({
      applicant: roleCandidates.filter((c) => c.stageId === "applicant").length,
      interviewed: roleCandidates.filter((c) => c.stageId === "interviewed").length,
      hired: roleCandidates.filter((c) => c.stageId === "hired").length,
    }),
    [roleCandidates],
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900">
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${position.color}, ${HRM_DASHBOARD_COLORS.blue})` }}
      />

      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{position.department}</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{position.label}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{position.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Openings", value: String(position.openings), color: HRM_DASHBOARD_COLORS.blue },
              { label: "Applicants", value: String(position.value), color: HRM_DASHBOARD_COLORS.midnight },
              { label: "Avg days open", value: `${position.avgDaysOpen}d`, color: HRM_DASHBOARD_COLORS.amber },
              { label: "In pipeline", value: String(roleCandidates.length), color: HRM_DASHBOARD_COLORS.green },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-[88px] rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{stat.label}</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "Applicant", count: stageCounts.applicant, cls: "bg-blue-50 text-[#2277ff] ring-blue-200" },
            { label: "Interviewed", count: stageCounts.interviewed, cls: "bg-sky-50 text-sky-700 ring-sky-200" },
            { label: "Hired", count: stageCounts.hired, cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
          ].map((s) => (
            <span key={s.label} className={cn("rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", s.cls)}>
              {s.label} · {s.count}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Candidates in pipeline</h3>
          {roleCandidates.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
              No candidates for this role yet.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {roleCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-950/30">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {c.email}
                        </span>
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
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase",
                            c.stageId === "hired" && "bg-emerald-50 text-emerald-700",
                            c.stageId === "interviewed" && "bg-sky-50 text-sky-700",
                            c.stageId === "applicant" && "bg-blue-50 text-[#2277ff]",
                          )}
                        >
                          {c.stageId}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
            Move candidates · drag between stages
          </h3>
          <HrmDashboardRecruitmentBoard
            candidates={roleCandidates}
            onChange={(updatedRole) => {
              const others = candidates.filter((c) => c.positionId !== position.id);
              onChangeCandidates([...others, ...updatedRole]);
            }}
            focusStage={null}
            onClose={() => {}}
            embedded
          />
        </div>
      </div>
    </section>
  );
}
