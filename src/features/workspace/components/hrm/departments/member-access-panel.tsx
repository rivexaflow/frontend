"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";

import { FormField } from "@/features/workspace/components/enterprise/enterprise-form-modal";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import type { HrmDepartment, MemberDataScope } from "@/types/hrm";
import { updateMemberScope } from "@/lib/api/company";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZES = [10, 25, 50] as const;

const SCOPE_OPTIONS: { value: MemberDataScope; label: string; description: string; icon: React.ElementType }[] = [
  { value: "SELF", label: "Self only", description: "Own records only", icon: Users },
  { value: "TEAM", label: "Team", description: "Assigned team data", icon: UsersRound },
  { value: "DEPARTMENT", label: "Department", description: "Full department visibility", icon: Building2 },
  { value: "COMPANY", label: "Company-wide", description: "Organization-wide access", icon: Shield },
];

const SCOPE_BADGE: Record<MemberDataScope, string> = {
  SELF: "bg-slate-100 text-slate-700",
  TEAM: "bg-sky-50 text-sky-800",
  DEPARTMENT: "bg-[#191970]/10 text-[#191970]",
  COMPANY: "bg-emerald-50 text-emerald-800",
};

const SCOPE_LABEL: Record<MemberDataScope, string> = {
  SELF: "Self",
  TEAM: "Team",
  DEPARTMENT: "Department",
  COMPANY: "Company",
};

const selectClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200";

type Member = { id: string; name: string; email: string; department?: string; team?: string };

type Props = {
  companyId: string | null;
  departments: HrmDepartment[];
  members: Member[];
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MemberAccessPanel({ companyId, departments, members }: Props) {
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<MemberDataScope | "ALL">("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [scopes, setScopes] = useState<Record<string, MemberDataScope>>({});
  const [deptAssignments, setDeptAssignments] = useState<Record<string, string>>({});
  const [teamAssignments, setTeamAssignments] = useState<Record<string, string>>({});

  const [dataScope, setDataScope] = useState<MemberDataScope>("SELF");
  const [departmentId, setDepartmentId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [scopeError, setScopeError] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const scope = scopes[m.id] ?? "SELF";
      if (scopeFilter !== "ALL" && scope !== scopeFilter) return false;
      if (deptFilter !== "ALL" && m.department !== deptFilter) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.department?.toLowerCase().includes(q) ?? false) ||
        (m.team?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [members, query, scopeFilter, deptFilter, scopes]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedMembers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, safePage, pageSize]);

  const selectedMember = members.find((m) => m.id === selectedId) ?? null;

  const departmentNames = useMemo(() => {
    const fromMembers = members.map((m) => m.department).filter(Boolean) as string[];
    const fromDepts = departments.map((d) => d.name);
    return [...new Set([...fromMembers, ...fromDepts])].sort();
  }, [members, departments]);

  const teamsForDept = useMemo(() => {
    const dept = departments.find((d) => d.id === departmentId);
    return dept?.teams ?? [];
  }, [departments, departmentId]);

  useEffect(() => {
    setPage(1);
  }, [query, scopeFilter, deptFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const selectMember = (id: string) => {
    setSelectedId(id);
    setDataScope(scopes[id] ?? "SELF");
    setDepartmentId(deptAssignments[id] ?? "");
    setTeamId(teamAssignments[id] ?? "");
    setMessage(null);
    setScopeError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!companyId || !selectedId) {
      setScopeError("Please select a member from the table.");
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
      await updateMemberScope(companyId, selectedId, {
        dataScope,
        departmentId: dataScope === "DEPARTMENT" || dataScope === "TEAM" ? departmentId : null,
        teamId: dataScope === "TEAM" ? teamId : null,
      });
      setScopes((prev) => ({ ...prev, [selectedId]: dataScope }));
      if (departmentId) setDeptAssignments((prev) => ({ ...prev, [selectedId]: departmentId }));
      if (teamId) setTeamAssignments((prev) => ({ ...prev, [selectedId]: teamId }));
      setMessage("Access scope saved.");
    } catch (err) {
      setScopeError(err instanceof Error ? err.message : "Could not save access scope.");
    } finally {
      setSubmitting(false);
    }
  };

  const rangeStart = filteredMembers.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filteredMembers.length);

  return (
    <div className="grid min-h-[560px] lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="flex flex-col border-b border-slate-100 lg:border-b-0 lg:border-r dark:border-slate-800">
        <div className="space-y-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, or department…"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as MemberDataScope | "ALL")}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950"
              aria-label="Filter by access scope"
            >
              <option value="ALL">All scopes</option>
              {SCOPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 max-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#191970] dark:border-slate-700 dark:bg-slate-950"
              aria-label="Filter by department"
            >
              <option value="ALL">All departments</option>
              {departmentNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">
            {filteredMembers.length.toLocaleString()} member{filteredMembers.length === 1 ? "" : "s"} · click a row to configure access
          </p>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm dark:bg-slate-900/95">
              <tr className={crm.tableHead}>
                <th className="px-4 py-3">Member</th>
                <th className="hidden px-4 py-3 md:table-cell">Department</th>
                <th className="px-4 py-3">Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-slate-500">
                    No members match your filters.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => {
                  const active = member.id === selectedId;
                  const scope = scopes[member.id] ?? "SELF";
                  return (
                    <tr
                      key={member.id}
                      onClick={() => selectMember(member.id)}
                      className={cn(
                        "cursor-pointer transition-colors",
                        crm.tableRow,
                        active && "bg-[#191970]/[0.06]",
                        "hover:bg-[#2277ff]/[0.04]",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#191970] text-[10px] font-bold text-white">
                            {initials(member.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900 dark:text-white">{member.name}</p>
                            <p className="truncate text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
                        {member.department ?? "—"}
                        {member.team ? (
                          <span className="block text-xs text-slate-400">{member.team}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", SCOPE_BADGE[scope])}>
                          {SCOPE_LABEL[scope]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            Showing {rangeStart}–{rangeEnd} of {filteredMembers.length.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950"
              aria-label="Rows per page"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[4rem] text-center text-xs font-medium text-slate-600">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 sm:p-5 lg:border-t-0 dark:border-slate-800">
        {!selectedMember ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/30">
            <Shield className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Select a member</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Use search and filters to find someone, then click their row to set access scope.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-[#191970]/15 bg-gradient-to-br from-[#191970]/[0.06] to-transparent p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#191970] text-xs font-bold text-white">
                  {initials(selectedMember.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{selectedMember.name}</p>
                  <p className="truncate text-sm text-slate-500">{selectedMember.email}</p>
                </div>
              </div>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Access level</legend>
              <div className="grid gap-2">
                {SCOPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = dataScope === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition",
                        active
                          ? "border-[#191970] bg-[#191970]/[0.04] ring-1 ring-[#191970]/20"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700",
                      )}
                    >
                      <input
                        type="radio"
                        name="dataScope"
                        value={opt.value}
                        checked={active}
                        onChange={() => setDataScope(opt.value)}
                        className="sr-only"
                        disabled={submitting}
                      />
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", active ? "bg-[#191970] text-white" : "bg-slate-100 text-slate-600")}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                        <span className="block text-xs text-slate-500">{opt.description}</span>
                      </span>
                    </label>
                  );
                })}
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

            <button
              type="submit"
              disabled={!companyId || submitting}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#191970] text-sm font-semibold text-white transition hover:bg-[#12124a] disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save access
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
