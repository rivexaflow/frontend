"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  UsersRound,
} from "lucide-react";

import {
  EnterpriseFormModal,
  FormField,
  inputClassName,
} from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import {
  createCompanyDepartment,
  createDepartmentTeam,
  deleteCompanyDepartment,
  deleteDepartmentTeam,
  fetchCompanyDepartments,
  updateCompanyDepartment,
  updateDepartmentTeam,
  updateMemberScope,
} from "@/lib/api/company";
import { DEMO_WORKSPACE_USERS } from "@/features/workspace/data/workspace-users-demo";
import { fetchHrEmployees } from "@/lib/api/hrm";
import type {
  HrmDepartment,
  HrmDepartmentTeam,
  HrmEmployeeRecord,
  MemberDataScope,
} from "@/types/hrm";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

type LeaderOption = { id: string; label: string };

function buildLeaderOptions(
  employees: HrmEmployeeRecord[],
  extraIds: Array<string | null | undefined> = [],
): LeaderOption[] {
  const map = new Map<string, string>();
  for (const emp of employees) {
    map.set(emp.id, emp.name);
  }
  for (const id of extraIds) {
    if (id && !map.has(id)) {
      map.set(id, `Assigned (${id.slice(-6)})`);
    }
  }
  return [...map.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

const SCOPE_OPTIONS: { value: MemberDataScope; label: string; description: string }[] = [
  { value: "SELF", label: "Self only", description: "Member sees only their own records." },
  { value: "TEAM", label: "Team", description: "Member sees records for their assigned team." },
  { value: "DEPARTMENT", label: "Department", description: "Member sees all records in a department." },
  { value: "COMPANY", label: "Company-wide", description: "Member sees organization-wide records." },
];

type PageTab = "organization" | "access";
type DeptModalMode = { type: "create" } | { type: "edit"; dept: HrmDepartment };
type TeamModalMode =
  | { type: "create"; deptId: string; deptName: string }
  | { type: "edit"; deptId: string; team: HrmDepartmentTeam };

const selectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

export function WorkforceManagementView() {
  const companyId = useHrCompanyId();
  const [tab, setTab] = useState<PageTab>("organization");
  const [departments, setDepartments] = useState<HrmDepartment[]>([]);
  const [employees, setEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deptModal, setDeptModal] = useState<DeptModalMode | null>(null);
  const [teamModal, setTeamModal] = useState<TeamModalMode | null>(null);
  const [deleteDeptId, setDeleteDeptId] = useState<string | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<{ deptId: string; teamId: string } | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    setEmployeesError(null);

    try {
      const deptList = await fetchCompanyDepartments(companyId);
      setDepartments(deptList);
      if (deptList.length > 0) {
        setExpandedIds(new Set([deptList[0].id]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load departments.");
    }

    try {
      const employeeList = await fetchHrEmployees(companyId);
      setEmployees(employeeList);
    } catch (err) {
      setEmployees([]);
      setEmployeesError(
        err instanceof Error ? err.message : "Could not load employees for department heads.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const filteredDepartments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.teams.some((t) => t.name.toLowerCase().includes(q)),
    );
  }, [departments, query]);

  const totalTeams = departments.reduce((sum, d) => sum + d.teams.length, 0);
  const totalMembers = departments.reduce((sum, d) => sum + (d.memberCount ?? 0), 0);

  const leaderOptions = useMemo(
    () =>
      buildLeaderOptions(
        employees,
        departments.flatMap((d) => [d.headId, ...d.teams.map((t) => t.leaderId)]),
      ),
    [departments, employees],
  );

  const memberLabel = (id: string | null | undefined) => {
    if (!id) return "Unassigned";
    return leaderOptions.find((o) => o.id === id)?.label ?? "Unknown member";
  };

  const toggleExpanded = (deptId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(deptId)) next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const upsertDepartment = (dept: HrmDepartment) => {
    setDepartments((prev) => {
      const idx = prev.findIndex((d) => d.id === dept.id);
      if (idx === -1) return [dept, ...prev];
      return prev.map((d) =>
        d.id === dept.id ? { ...dept, teams: dept.teams.length ? dept.teams : d.teams } : d,
      );
    });
    setExpandedIds((prev) => new Set([...prev, dept.id]));
  };

  const upsertTeam = (deptId: string, team: HrmDepartmentTeam) => {
    setDepartments((prev) =>
      prev.map((d) => {
        if (d.id !== deptId) return d;
        const idx = d.teams.findIndex((t) => t.id === team.id);
        const teams =
          idx === -1 ? [team, ...d.teams] : d.teams.map((t) => (t.id === team.id ? team : t));
        return { ...d, teams };
      }),
    );
    setExpandedIds((prev) => new Set([...prev, deptId]));
  };

  const removeDepartment = (deptId: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(deptId);
      return next;
    });
  };

  const removeTeam = (deptId: string, teamId: string) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId ? { ...d, teams: d.teams.filter((t) => t.id !== teamId) } : d,
      ),
    );
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Governance · User management
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Departments
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Set up your company structure — departments, teams, and what data each member can access.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Departments", value: departments.length, icon: Building2 },
              { label: "Teams", value: totalTeams, icon: UsersRound },
              { label: "Members", value: totalMembers, icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {!companyId ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            {(
              [
                { id: "organization" as const, label: "Organization structure" },
                { id: "access" as const, label: "Member access" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  tab === item.id
                    ? "bg-[#191970] text-white"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "organization" ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || !companyId}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setDeptModal({ type: "create" })}
                disabled={!companyId}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add department
              </button>
            </div>
          ) : null}
        </div>

        {tab === "organization" ? (
          <>
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search departments or teams"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {filteredDepartments.length} department{filteredDepartments.length === 1 ? "" : "s"} ·
                expand a row to manage its teams
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-20 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading departments…
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="px-4 py-20 text-center">
                <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  No departments yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Start by creating a department, then add teams inside it.
                </p>
                <button
                  type="button"
                  onClick={() => setDeptModal({ type: "create" })}
                  disabled={!companyId}
                  className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#191970] px-4 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add department
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Head / Leader</th>
                      <th className="px-4 py-3">Members</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredDepartments.map((dept) => {
                      const expanded = expandedIds.has(dept.id);
                      return (
                        <DepartmentRows
                          key={dept.id}
                          dept={dept}
                          expanded={expanded}
                          memberLabel={memberLabel}
                          onToggle={() => toggleExpanded(dept.id)}
                          onEdit={() => setDeptModal({ type: "edit", dept })}
                          onDelete={() => setDeleteDeptId(dept.id)}
                          onAddTeam={() =>
                            setTeamModal({ type: "create", deptId: dept.id, deptName: dept.name })
                          }
                          onEditTeam={(team) =>
                            setTeamModal({ type: "edit", deptId: dept.id, team })
                          }
                          onDeleteTeam={(teamId) => setDeleteTeam({ deptId: dept.id, teamId })}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <MemberAccessTab
            companyId={companyId}
            departments={departments}
            members={DEMO_WORKSPACE_USERS}
          />
        )}
      </div>

      {deptModal ? (
        <DepartmentModal
          mode={deptModal}
          companyId={companyId}
          leaderOptions={leaderOptions}
          employeesError={employeesError}
          onClose={() => setDeptModal(null)}
          onSaved={upsertDepartment}
        />
      ) : null}

      {teamModal ? (
        <TeamModal
          mode={teamModal}
          companyId={companyId}
          leaderOptions={leaderOptions}
          employeesError={employeesError}
          onClose={() => setTeamModal(null)}
          onSaved={upsertTeam}
        />
      ) : null}

      {deleteDeptId && companyId ? (
        <ConfirmDeleteModal
          title="Delete department"
          description="All teams in this department will be removed and member assignments cleared."
          onClose={() => setDeleteDeptId(null)}
          onConfirm={async () => {
            await deleteCompanyDepartment(companyId, deleteDeptId);
            removeDepartment(deleteDeptId);
            setDeleteDeptId(null);
          }}
        />
      ) : null}

      {deleteTeam && companyId ? (
        <ConfirmDeleteModal
          title="Delete team"
          description="Members on this team will have their access scope reset to Self only."
          onClose={() => setDeleteTeam(null)}
          onConfirm={async () => {
            await deleteDepartmentTeam(companyId, deleteTeam.deptId, deleteTeam.teamId);
            removeTeam(deleteTeam.deptId, deleteTeam.teamId);
            setDeleteTeam(null);
          }}
        />
      ) : null}
    </div>
  );
}

function DepartmentRows({
  dept,
  expanded,
  memberLabel,
  onToggle,
  onEdit,
  onDelete,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
}: {
  dept: HrmDepartment;
  expanded: boolean;
  memberLabel: (id: string | null | undefined) => string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTeam: () => void;
  onEditTeam: (team: HrmDepartmentTeam) => void;
  onDeleteTeam: (teamId: string) => void;
}) {
  return (
    <>
      <tr className="bg-white transition hover:bg-slate-50/60 dark:bg-slate-900 dark:hover:bg-slate-900/60">
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 text-left font-semibold text-slate-900 dark:text-white"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-slate-400 transition",
                expanded ? "rotate-0" : "-rotate-90",
              )}
            />
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
              <Building2 className="h-4 w-4" />
            </span>
            <span>
              {dept.name}
              <span className="ml-2 text-xs font-normal text-slate-400">
                {dept.teams.length} team{dept.teams.length === 1 ? "" : "s"}
              </span>
            </span>
          </button>
        </td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{memberLabel(dept.headId)}</td>
        <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-300">
          {dept.memberCount ?? "—"}
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-1">
            <ActionButton label="Add team" onClick={onAddTeam} icon={Plus} />
            <ActionButton label="Edit department" onClick={onEdit} icon={Pencil} />
            <ActionButton label="Delete department" onClick={onDelete} icon={Trash2} danger />
          </div>
        </td>
      </tr>

      {expanded
        ? dept.teams.length === 0
          ? (
            <tr className="bg-slate-50/50 dark:bg-slate-950/30">
              <td colSpan={4} className="px-4 py-4 pl-16 text-sm text-slate-500">
                No teams in this department.{" "}
                <button
                  type="button"
                  onClick={onAddTeam}
                  className="font-semibold text-[#191970] hover:underline"
                >
                  Add a team
                </button>
              </td>
            </tr>
          )
          : dept.teams.map((team) => (
            <tr
              key={team.id}
              className="bg-slate-50/50 transition hover:bg-slate-100/60 dark:bg-slate-950/30 dark:hover:bg-slate-900/50"
            >
              <td className="px-4 py-2.5 pl-16">
                <span className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <UsersRound className="h-4 w-4 text-slate-400" />
                  {team.name}
                </span>
              </td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                {memberLabel(team.leaderId)}
              </td>
              <td className="px-4 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">
                {team.memberCount ?? "—"}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex justify-end gap-1">
                  <ActionButton
                    label={`Edit ${team.name}`}
                    onClick={() => onEditTeam(team)}
                    icon={Pencil}
                  />
                  <ActionButton
                    label={`Delete ${team.name}`}
                    onClick={() => onDeleteTeam(team.id)}
                    icon={Trash2}
                    danger
                  />
                </div>
              </td>
            </tr>
          ))
        : null}
    </>
  );
}

function ActionButton({
  label,
  onClick,
  icon: Icon,
  danger,
}: {
  label: string;
  onClick: () => void;
  icon: React.ElementType;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded-lg p-2 transition",
        danger
          ? "text-rose-500 hover:bg-rose-50"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function MemberAccessTab({
  companyId,
  departments,
  members,
}: {
  companyId: string | null;
  departments: HrmDepartment[];
  members: { id: string; name: string; email: string }[];
}) {
  const [memberId, setMemberId] = useState("");
  const [dataScope, setDataScope] = useState<MemberDataScope>("SELF");
  const [departmentId, setDepartmentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [scopeError, setScopeError] = useState<string | null>(null);

  const teamsForDept = useMemo(() => {
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.teams ?? [];
  }, [departments, departmentId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyId || !memberId) {
      setScopeError("Please select a member.");
      return;
    }
    if (dataScope === "TEAM" && (!departmentId || !teamId)) {
      setScopeError("Select both a department and team for team-level access.");
      return;
    }
    if (dataScope === "DEPARTMENT" && !departmentId) {
      setScopeError("Select a department for department-level access.");
      return;
    }

    setSubmitting(true);
    setScopeError(null);
    setMessage(null);
    try {
      await updateMemberScope(companyId, memberId, {
        dataScope,
        departmentId: dataScope === "DEPARTMENT" || dataScope === "TEAM" ? departmentId : null,
        teamId: dataScope === "TEAM" ? teamId : null,
      });
      setMessage("Access scope saved.");
    } catch (err) {
      setScopeError(err instanceof Error ? err.message : "Could not save access scope.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">What is member access?</p>
          <p className="mt-1 text-sm text-slate-500">
            Choose how much data each person can see — only their own work, their team, their
            department, or the whole company.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5">
        <FormField label="Member" htmlFor="access-member">
          <select
            id="access-member"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className={selectClass}
            disabled={!companyId || submitting}
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </FormField>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            Access level
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {SCOPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-3 transition",
                  dataScope === opt.value
                    ? "border-[#191970] bg-blue-50/50 ring-1 ring-[#191970]/20 dark:bg-blue-950/20"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                )}
              >
                <input
                  type="radio"
                  name="dataScope"
                  value={opt.value}
                  checked={dataScope === opt.value}
                  onChange={() => setDataScope(opt.value)}
                  className="mt-1"
                  disabled={submitting}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    {opt.label}
                  </span>
                  <span className="block text-xs text-slate-500">{opt.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {dataScope === "DEPARTMENT" || dataScope === "TEAM" ? (
          <FormField label="Department" htmlFor="access-dept">
            <select
              id="access-dept"
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setTeamId("");
              }}
              className={selectClass}
              disabled={submitting || departments.length === 0}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}

        {dataScope === "TEAM" ? (
          <FormField label="Team" htmlFor="access-team">
            <select
              id="access-team"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className={selectClass}
              disabled={submitting || !departmentId || teamsForDept.length === 0}
            >
              <option value="">Select team</option>
              {teamsForDept.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}

        {scopeError ? <p className="text-sm font-medium text-rose-600">{scopeError}</p> : null}
        {message ? <p className="text-sm font-medium text-emerald-600">{message}</p> : null}

        <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
          <button
            type="submit"
            disabled={!companyId || submitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save access
          </button>
        </div>
      </form>
    </div>
  );
}

function LeaderSelectHint({
  leaderOptions,
  employeesError,
}: {
  leaderOptions: LeaderOption[];
  employeesError: string | null;
}) {
  if (employeesError) {
    return <p className="mt-1.5 text-xs text-amber-800">{employeesError}</p>;
  }
  if (leaderOptions.length > 0) return null;
  return (
    <p className="mt-1.5 text-xs text-slate-500">
      No HR employees found. Department heads are chosen from the{" "}
      <Link href={workspacePaths.hrmEmployees} className="font-medium text-[#191970] hover:underline">
        employee directory
      </Link>{" "}
      — add people there first.
    </p>
  );
}

function DepartmentModal({
  mode,
  companyId,
  leaderOptions,
  employeesError,
  onClose,
  onSaved,
}: {
  mode: DeptModalMode;
  companyId: string | null;
  leaderOptions: LeaderOption[];
  employeesError: string | null;
  onClose: () => void;
  onSaved: (dept: HrmDepartment) => void;
}) {
  const isEdit = mode.type === "edit";
  const [name, setName] = useState(isEdit ? mode.dept.name : "");
  const [headId, setHeadId] = useState(isEdit ? mode.dept.headId ?? "" : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode.type === "edit") {
      setName(mode.dept.name);
      setHeadId(mode.dept.headId ?? "");
    } else {
      setName("");
      setHeadId("");
    }
    setError(null);
    setSubmitting(false);
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = { name: name.trim(), headId: headId || null };
      const saved =
        mode.type === "create"
          ? await createCompanyDepartment(companyId, payload)
          : await updateCompanyDepartment(companyId, mode.dept.id, payload);
      onSaved({ ...saved, teams: mode.type === "edit" ? mode.dept.teams : saved.teams });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save department.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal
      open
      title={isEdit ? "Edit department" : "Add department"}
      description="A department groups related teams (e.g. Sales, Engineering, HR)."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Department name" htmlFor="dept-name">
          <input
            id="dept-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            className={inputClassName}
            placeholder="e.g. Sales"
            disabled={submitting}
          />
        </FormField>
        <FormField label="Department head (optional)" htmlFor="dept-head">
          <select
            id="dept-head"
            value={headId}
            onChange={(e) => setHeadId(e.target.value)}
            className={inputClassName}
            disabled={submitting}
          >
            <option value="">No head assigned</option>
            {leaderOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <LeaderSelectHint leaderOptions={leaderOptions} employeesError={employeesError} />
        </FormField>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <ModalActions onClose={onClose} submitting={submitting} submitLabel={isEdit ? "Save" : "Create"} />
      </form>
    </EnterpriseFormModal>
  );
}

function TeamModal({
  mode,
  companyId,
  leaderOptions,
  employeesError,
  onClose,
  onSaved,
}: {
  mode: TeamModalMode;
  companyId: string | null;
  leaderOptions: LeaderOption[];
  employeesError: string | null;
  onClose: () => void;
  onSaved: (deptId: string, team: HrmDepartmentTeam) => void;
}) {
  const isEdit = mode.type === "edit";
  const deptId = mode.deptId;
  const deptName = mode.type === "create" ? mode.deptName : "";
  const [name, setName] = useState(isEdit ? mode.team.name : "");
  const [leaderId, setLeaderId] = useState(isEdit ? mode.team.leaderId ?? "" : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode.type === "edit") {
      setName(mode.team.name);
      setLeaderId(mode.team.leaderId ?? "");
    } else {
      setName("");
      setLeaderId("");
    }
    setError(null);
    setSubmitting(false);
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = { name: name.trim(), leaderId: leaderId || null };
      const saved =
        mode.type === "create"
          ? await createDepartmentTeam(companyId, deptId, payload)
          : await updateDepartmentTeam(companyId, deptId, mode.team.id, payload);
      onSaved(deptId, saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save team.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal
      open
      title={isEdit ? "Edit team" : "Add team"}
      description={
        isEdit
          ? "Update the team name or assign a team leader."
          : `Add a team inside ${deptName || "this department"}.`
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Team name" htmlFor="team-name">
          <input
            id="team-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            className={inputClassName}
            placeholder="e.g. North Region"
            disabled={submitting}
          />
        </FormField>
        <FormField label="Team leader (optional)" htmlFor="team-leader">
          <select
            id="team-leader"
            value={leaderId}
            onChange={(e) => setLeaderId(e.target.value)}
            className={inputClassName}
            disabled={submitting}
          >
            <option value="">No leader assigned</option>
            {leaderOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <LeaderSelectHint leaderOptions={leaderOptions} employeesError={employeesError} />
        </FormField>
        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        <ModalActions onClose={onClose} submitting={submitting} submitLabel={isEdit ? "Save" : "Create"} />
      </form>
    </EnterpriseFormModal>
  );
}

function ModalActions({
  onClose,
  submitting,
  submitLabel,
}: {
  onClose: () => void;
  submitting: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#191970] px-5 text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-60"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </button>
    </div>
  );
}

function ConfirmDeleteModal({
  title,
  description,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setSubmitting(false);
    }
  };

  return (
    <EnterpriseFormModal open title={title} description={description} onClose={onClose}>
      {error ? <p className="mb-4 text-sm font-medium text-rose-600">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Delete
        </button>
      </div>
    </EnterpriseFormModal>
  );
}
