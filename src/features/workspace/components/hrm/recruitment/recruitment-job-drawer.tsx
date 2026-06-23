"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { HrmDashboardRecruitmentBoard } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-recruitment-board";
import {
  RecruitmentJobDetailHeader,
} from "@/features/workspace/components/hrm/recruitment/recruitment-job-card";
import type { HrmCandidate, HrmRecruitmentJob } from "@/features/workspace/data/hrm-recruitment-demo";

type Props = {
  job: HrmRecruitmentJob | null;
  candidates: HrmCandidate[];
  onCandidatesChange: (next: HrmCandidate[]) => void;
  onClose: () => void;
};

export function RecruitmentJobDrawer({ job, candidates, onCandidatesChange, onClose }: Props) {
  return (
    <AnimatePresence>
      {job ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            aria-label="Close job panel"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Role pipeline</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <RecruitmentJobDetailHeader job={job} />
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                  Candidates · {candidates.length}
                </h3>
                <HrmDashboardRecruitmentBoard
                  candidates={candidates}
                  onChange={onCandidatesChange}
                  onClose={onClose}
                  embedded
                />
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
