"use client";

import { AnimatePresence, motion } from "framer-motion";

import { DepartmentTeamsPanel } from "@/features/workspace/components/hrm/departments/department-teams-panel";
import type { HrmDepartment, HrmDepartmentTeam } from "@/types/hrm";

type Props = {
  dept: HrmDepartment | null;
  headLabel: string;
  memberLabel: (id: string | null | undefined) => string;
  onClose: () => void;
  onEditDept: () => void;
  onAddTeam: () => void;
  onEditTeam: (team: HrmDepartmentTeam) => void;
  onDeleteTeam: (teamId: string) => void;
};

export function DepartmentTeamsDrawer({
  dept,
  headLabel,
  memberLabel,
  onClose,
  onEditDept,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
}: Props) {
  return (
    <AnimatePresence>
      {dept ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px]"
            aria-label="Close department panel"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <DepartmentTeamsPanel
              dept={dept}
              headLabel={headLabel}
              memberLabel={memberLabel}
              onClose={onClose}
              onEditDept={onEditDept}
              onAddTeam={onAddTeam}
              onEditTeam={onEditTeam}
              onDeleteTeam={onDeleteTeam}
            />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
