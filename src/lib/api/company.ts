"use client";

import { DEMO_COMPANY_DEPARTMENTS } from "@/features/workspace/data/workforce-departments-demo";
import {
  assertApiSuccess,
  requireCompanyId,
  requireResourceId,
  toApiError,
  unwrapApiData,
  type ApiEnvelope,
} from "@/lib/api/api-envelope";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  normalizeDepartment,
  normalizeDepartmentsList,
  normalizeTeam,
  normalizeTeamsList,
  toCreateDepartmentBody,
  toCreateTeamBody,
  toUpdateDepartmentBody,
  toUpdateMemberScopeBody,
  toUpdateTeamBody,
} from "@/lib/api/hrm-normalize";
import type {
  CreateDepartmentPayload,
  CreateTeamPayload,
  HrmDepartment,
  HrmDepartmentTeam,
  UpdateDepartmentPayload,
  UpdateMemberScopePayload,
  UpdateTeamPayload,
} from "@/types/hrm";

const useDummy = () => process.env.NEXT_PUBLIC_HR_USE_DUMMY === "true";

let dummyDepartments: HrmDepartment[] = [...DEMO_COMPANY_DEPARTMENTS];

function cloneDummyDepartments(): HrmDepartment[] {
  return dummyDepartments.map((d) => ({ ...d, teams: d.teams.map((t) => ({ ...t })) }));
}

function findDummyDepartment(deptId: string): HrmDepartment | undefined {
  return dummyDepartments.find((d) => d.id === deptId);
}

function nextDummyId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export async function fetchCompanyDepartments(companyId: string): Promise<HrmDepartment[]> {
  const id = requireCompanyId(companyId);
  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(endpoints.company.departments(id));
    assertApiSuccess(data);
    return normalizeDepartmentsList(unwrapApiData(data));
  } catch (err) {
    if (useDummy()) return cloneDummyDepartments();
    throw toApiError(err, "Could not load departments.");
  }
}

export async function createCompanyDepartment(
  companyId: string,
  payload: CreateDepartmentPayload,
): Promise<HrmDepartment> {
  const id = requireCompanyId(companyId);
  const name = payload.name?.trim();
  if (!name) throw new Error("Department name is required.");

  if (useDummy()) {
    const created: HrmDepartment = {
      id: nextDummyId("dept"),
      name,
      headId: payload.headId ?? null,
      memberCount: 0,
      teams: [],
    };
    dummyDepartments = [created, ...dummyDepartments];
    return { ...created };
  }

  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.company.departments(id),
      toCreateDepartmentBody({ ...payload, name }),
    );
    assertApiSuccess(data);
    const department = normalizeDepartment(unwrapApiData(data));
    if (!department) throw new Error("Create department response was invalid.");
    return department;
  } catch (err) {
    throw toApiError(err, "Could not create department.");
  }
}

export async function updateCompanyDepartment(
  companyId: string,
  deptId: string,
  payload: UpdateDepartmentPayload,
): Promise<HrmDepartment> {
  const id = requireCompanyId(companyId);
  const departmentId = requireResourceId(deptId, "Department id");
  const body = toUpdateDepartmentBody(payload);
  if (Object.keys(body).length === 0) throw new Error("Nothing to update.");

  if (useDummy()) {
    const existing = findDummyDepartment(departmentId);
    if (!existing) throw new Error("Department not found.");
    const updated: HrmDepartment = {
      ...existing,
      name: typeof body.name === "string" ? body.name : existing.name,
      headId:
        body.headId !== undefined ? (body.headId as string | null) : (existing.headId ?? null),
    };
    dummyDepartments = dummyDepartments.map((d) => (d.id === departmentId ? updated : d));
    return { ...updated, teams: [...updated.teams] };
  }

  try {
    const { data } = await apiClient.put<ApiEnvelope<unknown>>(
      endpoints.company.department(id, departmentId),
      body,
    );
    assertApiSuccess(data);
    const department = normalizeDepartment(unwrapApiData(data));
    if (!department) throw new Error("Update department response was invalid.");
    return department;
  } catch (err) {
    throw toApiError(err, "Could not update department.");
  }
}

export async function deleteCompanyDepartment(companyId: string, deptId: string): Promise<void> {
  const id = requireCompanyId(companyId);
  const departmentId = requireResourceId(deptId, "Department id");

  if (useDummy()) {
    dummyDepartments = dummyDepartments.filter((d) => d.id !== departmentId);
    return;
  }

  try {
    const { data, status } = await apiClient.delete<ApiEnvelope<unknown>>(
      endpoints.company.department(id, departmentId),
    );
    if (data != null && typeof data === "object") assertApiSuccess(data);
    if (status >= 400) throw new Error("Could not delete department.");
  } catch (err) {
    throw toApiError(err, "Could not delete department.");
  }
}

export async function fetchDepartmentTeams(
  companyId: string,
  deptId: string,
): Promise<HrmDepartmentTeam[]> {
  const id = requireCompanyId(companyId);
  const departmentId = requireResourceId(deptId, "Department id");

  if (useDummy()) {
    const dept = findDummyDepartment(departmentId);
    return dept ? dept.teams.map((t) => ({ ...t })) : [];
  }

  try {
    const { data } = await apiClient.get<ApiEnvelope<unknown>>(
      endpoints.company.departmentTeams(id, departmentId),
    );
    assertApiSuccess(data);
    return normalizeTeamsList(unwrapApiData(data));
  } catch (err) {
    if (useDummy()) {
      const dept = findDummyDepartment(departmentId);
      return dept ? dept.teams.map((t) => ({ ...t })) : [];
    }
    throw toApiError(err, "Could not load teams.");
  }
}

export async function createDepartmentTeam(
  companyId: string,
  deptId: string,
  payload: CreateTeamPayload,
): Promise<HrmDepartmentTeam> {
  const id = requireCompanyId(companyId);
  const departmentId = requireResourceId(deptId, "Department id");
  const name = payload.name?.trim();
  if (!name) throw new Error("Team name is required.");

  if (useDummy()) {
    const dept = findDummyDepartment(departmentId);
    if (!dept) throw new Error("Department not found.");
    const created: HrmDepartmentTeam = {
      id: nextDummyId("team"),
      name,
      leaderId: payload.leaderId ?? null,
      memberCount: 0,
    };
    dummyDepartments = dummyDepartments.map((d) =>
      d.id === departmentId ? { ...d, teams: [created, ...d.teams] } : d,
    );
    return { ...created };
  }

  try {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      endpoints.company.departmentTeams(id, departmentId),
      toCreateTeamBody({ ...payload, name }),
    );
    assertApiSuccess(data);
    const team = normalizeTeam(unwrapApiData(data));
    if (!team) throw new Error("Create team response was invalid.");
    return team;
  } catch (err) {
    throw toApiError(err, "Could not create team.");
  }
}

export async function updateDepartmentTeam(
  companyId: string,
  deptId: string,
  teamId: string,
  payload: UpdateTeamPayload,
): Promise<HrmDepartmentTeam> {
  const id = requireCompanyId(companyId);
  const departmentId = requireResourceId(deptId, "Department id");
  const resolvedTeamId = requireResourceId(teamId, "Team id");
  const body = toUpdateTeamBody(payload);
  if (Object.keys(body).length === 0) throw new Error("Nothing to update.");

  if (useDummy()) {
    const dept = findDummyDepartment(departmentId);
    if (!dept) throw new Error("Department not found.");
    const existing = dept.teams.find((t) => t.id === resolvedTeamId);
    if (!existing) throw new Error("Team not found.");
    const updated: HrmDepartmentTeam = {
      ...existing,
      name: typeof body.name === "string" ? body.name : existing.name,
      leaderId:
        body.leaderId !== undefined ? (body.leaderId as string | null) : (existing.leaderId ?? null),
    };
    dummyDepartments = dummyDepartments.map((d) =>
      d.id === departmentId
        ? { ...d, teams: d.teams.map((t) => (t.id === resolvedTeamId ? updated : t)) }
        : d,
    );
    return { ...updated };
  }

  try {
    const { data } = await apiClient.put<ApiEnvelope<unknown>>(
      endpoints.company.departmentTeam(id, departmentId, resolvedTeamId),
      body,
    );
    assertApiSuccess(data);
    const team = normalizeTeam(unwrapApiData(data));
    if (!team) throw new Error("Update team response was invalid.");
    return team;
  } catch (err) {
    throw toApiError(err, "Could not update team.");
  }
}

export async function deleteDepartmentTeam(
  companyId: string,
  deptId: string,
  teamId: string,
): Promise<void> {
  const id = requireCompanyId(companyId);
  const departmentId = requireResourceId(deptId, "Department id");
  const resolvedTeamId = requireResourceId(teamId, "Team id");

  if (useDummy()) {
    dummyDepartments = dummyDepartments.map((d) =>
      d.id === departmentId ? { ...d, teams: d.teams.filter((t) => t.id !== resolvedTeamId) } : d,
    );
    return;
  }

  try {
    const { data, status } = await apiClient.delete<ApiEnvelope<unknown>>(
      endpoints.company.departmentTeam(id, departmentId, resolvedTeamId),
    );
    if (data != null && typeof data === "object") assertApiSuccess(data);
    if (status >= 400) throw new Error("Could not delete team.");
  } catch (err) {
    throw toApiError(err, "Could not delete team.");
  }
}

export async function updateMemberScope(
  companyId: string,
  memberId: string,
  payload: UpdateMemberScopePayload,
): Promise<void> {
  const id = requireCompanyId(companyId);
  const resolvedMemberId = requireResourceId(memberId, "Member id");
  if (!payload.dataScope) throw new Error("Data scope is required.");

  if (useDummy()) return;

  try {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      endpoints.company.memberScope(id, resolvedMemberId),
      toUpdateMemberScopeBody(payload),
    );
    assertApiSuccess(data);
  } catch (err) {
    throw toApiError(err, "Could not update member scope.");
  }
}
