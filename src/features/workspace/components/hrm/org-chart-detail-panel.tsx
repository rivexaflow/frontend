"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Network,
  Plus,
  Star,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import {
  countReports,
  employeesByManager,
  type HrmEmployee,
} from "@/features/workspace/data/hrm-org-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  employee: HrmEmployee;
  employees: HrmEmployee[];
  departments?: any[];
  onClose: () => void;
  onUpdate: (patch: Partial<HrmEmployee>) => void;
  onAddReport?: () => void;
  onDelete?: () => void;
  onCreateDepartment?: (name: string) => Promise<any>;
  onCreateTeam?: (deptId: string, name: string) => Promise<any>;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OrgChartDetailPanel({
  employee,
  employees,
  departments = [],
  onClose,
  onUpdate,
  onAddReport,
  onDelete,
  onCreateDepartment,
  onCreateTeam,
}: Props) {
  const manager = employee.managerId
    ? employees.find((e) => e.id === employee.managerId)
    : null;
  const directReports = employeesByManager(employees, employee.id);
  const totalReports = countReports(employees, employee.id);
  const isRoot = employee.managerId === null;

  const [showNewDeptForm, setShowNewDeptForm] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  const [showNewTeamForm, setShowNewTeamForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const handleSaveDept = async () => {
    if (!newDeptName.trim() || !onCreateDepartment) return;
    setIsCreatingDept(true);
    try {
      const newDept = await onCreateDepartment(newDeptName.trim());
      if (newDept) {
        onUpdate({
          departmentId: newDept.id,
          department: newDept.name,
          teamId: null,
          assignedTeamIds: []
        });
      }
      setShowNewDeptForm(false);
      setNewDeptName("");
    } catch (err) {
      console.error("Failed to create department:", err);
    } finally {
      setIsCreatingDept(false);
    }
  };

  const handleSaveTeam = async () => {
    if (!newTeamName.trim() || !employee.departmentId || !onCreateTeam) return;
    setIsCreatingTeam(true);
    try {
      const newTeam = await onCreateTeam(employee.departmentId, newTeamName.trim());
      if (newTeam) {
        const roleType = employee.roleType || (isRoot ? "COMPANY_OWNER" : "TEAM_MEMBER");
        if (roleType === "TEAM_MANAGER") {
          const currentIds = employee.assignedTeamIds || [];
          onUpdate({
            assignedTeamIds: [...currentIds, newTeam.id]
          });
        } else {
          onUpdate({
            teamId: newTeam.id
          });
        }
      }
      setShowNewTeamForm(false);
      setNewTeamName("");
    } catch (err) {
      console.error("Failed to create team:", err);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Close panel"
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:absolute lg:rounded-2xl"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 36 }}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col",
          "border-l border-slate-200/90 bg-white shadow-2xl shadow-slate-900/20",
          "dark:border-slate-800 dark:bg-slate-950",
          "lg:absolute lg:inset-y-0 lg:right-0 lg:max-h-none lg:rounded-r-2xl",
        )}
        role="dialog"
        aria-labelledby="org-unit-panel-title"
      >
        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-[#191970] via-[#1e3a8a] to-[#312e81] px-6 pb-6 pt-5 text-white dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white/90 transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200/90">
            Organization unit
          </p>
          <h2 id="org-unit-panel-title" className="mt-1 pr-10 text-xl font-bold tracking-tight">
            {employee.unitLabel ?? employee.department}
          </h2>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10 text-lg font-bold backdrop-blur-sm">
              {employee.vacant ? <User className="h-7 w-7 text-white/70" /> : initials(employee.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold">
                {employee.vacant ? "Vacant position" : employee.name}
              </p>
              <p className="truncate text-sm text-blue-100/90">{employee.designation}</p>
              {employee.email ? (
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-blue-200/80">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {employee.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
              {employee.department}
            </span>
            {isRoot ? (
              <span className="rounded-full bg-blue-400/30 px-2.5 py-1 text-[10px] font-semibold">
                Root administrator
              </span>
            ) : null}
            {employee.vacant ? (
              <span className="rounded-full bg-amber-400/25 px-2.5 py-1 text-[10px] font-semibold text-amber-100">
                Vacant
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="grid grid-cols-4 gap-px border-b border-slate-100 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
            {[
              { label: "Direct", value: directReports.length },
              { label: "Total team", value: totalReports },
              { label: "CRM Leads", value: employee.leadCount || 0 },
              { label: "Level", value: isRoot ? "Executive" : "Unit" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white px-1.5 py-3 text-center dark:bg-slate-950"
              >
                <p className="text-base font-bold text-slate-900 dark:text-white truncate">{stat.value}</p>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 truncate">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <section className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              Unit configuration
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Unit / branch name
                </span>
                <input
                  value={employee.unitLabel ?? ""}
                  onChange={(e) => onUpdate({ unitLabel: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Head of unit
                </span>
                <input
                  value={employee.name}
                  onChange={(e) => onUpdate({ name: e.target.value, vacant: false })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Job title
                </span>
                <input
                  value={employee.designation}
                  onChange={(e) => onUpdate({ designation: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>

              {/* Org Role Type selection */}
              <label className="block">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Role Type in Org
                </span>
                <select
                  value={employee.roleType || (isRoot ? "COMPANY_OWNER" : "TEAM_MEMBER")}
                  onChange={(e) => onUpdate({ roleType: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="COMPANY_OWNER">Company Owner / Root</option>
                  <option value="DEPT_HEAD">Department Head / Manager</option>
                  <option value="TEAM_MANAGER">Team Manager (Multiple Teams)</option>
                  <option value="TEAM_LEADER">Team Leader (Single Team)</option>
                  <option value="TEAM_MEMBER">Team Member / Executive</option>
                </select>
              </label>

              {/* Department assignment */}
              <div className="block">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Assigned Department
                  </span>
                  {onCreateDepartment && (
                    <button
                      type="button"
                      onClick={() => setShowNewDeptForm(true)}
                      className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <Plus className="h-3 w-3" />
                      New
                    </button>
                  )}
                </div>

                {showNewDeptForm ? (
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="text"
                      placeholder="Department Name..."
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 text-xs outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                      disabled={isCreatingDept}
                    />
                    <button
                      type="button"
                      onClick={handleSaveDept}
                      disabled={isCreatingDept || !newDeptName.trim()}
                      className="rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewDeptForm(false);
                        setNewDeptName("");
                      }}
                      className="rounded-xl border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={employee.departmentId || ""}
                    onChange={(e) => {
                      const deptId = e.target.value || null;
                      const dept = departments.find(d => d.id === deptId);
                      onUpdate({
                        departmentId: deptId,
                        department: dept ? dept.name : "Department",
                        teamId: null, // reset team
                        assignedTeamIds: [] // reset assigned teams
                      });
                    }}
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="">No department / General</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Team assignment based on role type */}
              {employee.departmentId && departments && (() => {
                const activeDept = departments.find(d => d.id === employee.departmentId);
                const teams = activeDept?.teams || [];
                const roleType = employee.roleType || (isRoot ? "COMPANY_OWNER" : "TEAM_MEMBER");
                const isTeamManager = roleType === "TEAM_MANAGER";

                return (
                  <div className="block mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {isTeamManager ? "Assigned Teams (Multi-select)" : "Assigned Team"}
                      </span>
                      {onCreateTeam && (
                        <button
                          type="button"
                          onClick={() => setShowNewTeamForm(true)}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Plus className="h-3 w-3" />
                          New
                        </button>
                      )}
                    </div>

                    {showNewTeamForm ? (
                      <div className="mt-1.5 flex gap-2">
                        <input
                          type="text"
                          placeholder="Team Name..."
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-2.5 text-xs outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900"
                          disabled={isCreatingTeam}
                        />
                        <button
                          type="button"
                          onClick={handleSaveTeam}
                          disabled={isCreatingTeam || !newTeamName.trim()}
                          className="rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewTeamForm(false);
                            setNewTeamName("");
                          }}
                          className="rounded-xl border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : isTeamManager ? (
                      // Multiple Teams assignment
                      <div className="mt-1.5 max-h-32 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 space-y-1.5 dark:border-slate-700 dark:bg-slate-900">
                        {teams.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No teams. Click "New" to create one.</p>
                        ) : (
                          teams.map((team: any) => {
                            const selectedTeamIds = employee.assignedTeamIds || [];
                            const checked = selectedTeamIds.includes(team.id);
                            return (
                              <label key={team.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    let nextIds = [...selectedTeamIds];
                                    if (e.target.checked) {
                                      nextIds.push(team.id);
                                    } else {
                                      nextIds = nextIds.filter(id => id !== team.id);
                                    }
                                    onUpdate({ assignedTeamIds: nextIds });
                                  }}
                                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                                />
                                {team.name}
                              </label>
                            );
                          })
                        )}
                      </div>
                    ) : (
                      // Single Team assignment
                      <select
                        value={employee.teamId || ""}
                        onChange={(e) => {
                          onUpdate({ teamId: e.target.value || null });
                        }}
                        className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="">No team</option>
                        {teams.map((team: any) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })()}
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <input
                  type="checkbox"
                  checked={!!employee.vacant}
                  onChange={(e) => onUpdate({ vacant: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Mark position as vacant
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <input
                  type="checkbox"
                  checked={!!employee.starred}
                  onChange={(e) => onUpdate({ starred: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Star className="h-3.5 w-3.5 text-amber-500" />
                  Pin unit on chart
                </span>
              </label>
            </div>
          </section>

          <section className="border-b border-slate-100 p-5 dark:border-slate-800">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Network className="h-3.5 w-3.5" />
              Reporting line
            </h3>
            {!isRoot ? (
              <label className="block mt-3">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Reports to (Manager)
                </span>
                <select
                  value={employee.managerId || ""}
                  onChange={(e) => {
                    onUpdate({ managerId: e.target.value || null });
                  }}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="">No manager (Root level)</option>
                  {employees
                    .filter((e) => {
                      // Prevent cycles: exclude itself and any recursive reports
                      const visited = new Set<string>();
                      function isSubordinate(mgrId: string, targetId: string): boolean {
                        if (visited.has(mgrId)) return false;
                        visited.add(mgrId);
                        const subs = employees.filter(emp => emp.managerId === mgrId);
                        if (subs.some(sub => sub.id === targetId)) return true;
                        return subs.some(sub => isSubordinate(sub.id, targetId));
                      }
                      return e.id !== employee.id && !isSubordinate(employee.id, e.id);
                    })
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.designation})
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-[11px] font-semibold text-slate-400">Reports to</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  — (top level)
                </p>
              </div>
            )}
          </section>

          <section className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Users className="h-3.5 w-3.5" />
                Direct reports ({directReports.length})
              </h3>
              <button
                type="button"
                onClick={() => onAddReport?.()}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
            {directReports.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500 dark:border-slate-700">
                No direct reports yet. Use Add or the + on the chart card.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {directReports.map((report) => (
                  <li
                    key={report.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-[11px] font-bold text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200">
                      {initials(report.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {report.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{report.designation}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onAddReport?.()}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#191970] text-sm font-semibold text-white transition hover:bg-[#0f0f4d]"
          >
            <UserPlus className="h-4 w-4" />
            Add direct report
          </button>
          {!isRoot && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4" />
              Remove unit & team
            </button>
          ) : null}
        </div>
      </motion.aside>
    </>
  );
}
