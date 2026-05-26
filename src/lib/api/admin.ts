"use client";

import { isAxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import {
  DUMMY_AI_MODELS,
  DUMMY_COMPANIES,
  DUMMY_DASHBOARD,
  DUMMY_WORKFLOWS,
  filterDummyUsers,
} from "@/lib/data/admin-dummy";
import type {
  AdminAiModel,
  AdminCompany,
  AdminDashboardStats,
  AdminUser,
  AdminWorkflow,
  CreateAiModelPayload,
  Paginated,
  UpdateAiModelPayload,
  UserStatus,
  UsersQuery,
} from "@/types/admin";
import type { Role } from "@/types/auth";
import {
  normalizeAiModel,
  normalizeCompany,
  normalizeDashboardStats,
  normalizePaginatedUsers,
  normalizeWorkflow,
} from "@/lib/api/admin-normalize";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
  if (payload && typeof payload === "object" && "data" in (payload as ApiEnvelope<T>)) {
    const inner = (payload as ApiEnvelope<T>).data;
    if (inner !== undefined && inner !== null) return inner as T;
  }
  return payload as T;
};

const assertSuccess = (body: ApiEnvelope<unknown>) => {
  if (body?.success === false) {
    throw new Error(body.message ?? body.error ?? "Request failed.");
  }
};

const apiError = (err: unknown, fallback: string): Error => {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiEnvelope<unknown> | undefined;
    const msg = body?.message ?? body?.error ?? fallback;
    if (err.response?.status === 403) {
      return new Error("Super admin access required for this action.");
    }
    return new Error(msg);
  }
  return new Error(fallback);
};

/** When API is down, use demo data so the platform UI remains usable. */
const useDummy = () =>
  process.env.NEXT_PUBLIC_ADMIN_USE_DUMMY === "true" ||
  process.env.NODE_ENV === "development";

export async function fetchAdminDashboard(): Promise<AdminDashboardStats> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<AdminDashboardStats>>(
      endpoints.admin.dashboard,
    );
    assertSuccess(data);
    const normalized = normalizeDashboardStats(unwrap(data));
    if (normalized) return normalized;
    if (useDummy()) return DUMMY_DASHBOARD;
    throw new Error("Dashboard response was missing expected statistics.");
  } catch (err) {
    if (useDummy()) return DUMMY_DASHBOARD;
    throw apiError(err, "Could not load platform statistics.");
  }
}

export async function fetchAdminUsers(query: UsersQuery): Promise<Paginated<AdminUser>> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<Paginated<AdminUser>>>(
      endpoints.admin.users,
      {
        params: {
          search: query.search || undefined,
          status: query.status || undefined,
          role: query.role || undefined,
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 10,
        },
      },
    );
    assertSuccess(data);
    const normalized = normalizePaginatedUsers(unwrap(data));
    if (normalized) return normalized;
    if (useDummy()) return filterDummyUsers(query);
    throw new Error("Users response was in an unexpected format.");
  } catch (err) {
    if (useDummy()) return filterDummyUsers(query);
    throw apiError(err, "Could not load users.");
  }
}

export async function patchUserStatus(id: string, status: UserStatus): Promise<void> {
  try {
    await apiClient.patch(endpoints.admin.userStatus(id), { status });
  } catch (err) {
    if (useDummy()) return;
    throw apiError(err, "Could not update user status.");
  }
}

export async function patchUserRole(id: string, role: Role): Promise<void> {
  try {
    await apiClient.patch(endpoints.admin.userRole(id), { role });
  } catch (err) {
    if (useDummy()) return;
    throw apiError(err, "Could not update user role.");
  }
}

export async function fetchAdminCompanies(): Promise<AdminCompany[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<AdminCompany[] | Paginated<AdminCompany>>>(
      endpoints.admin.companies,
    );
    assertSuccess(data);
    const raw = unwrap(data);
    const list = Array.isArray(raw) ? raw : (raw as Paginated<AdminCompany>).items;
    const companies = (list ?? []).map(normalizeCompany).filter((c): c is AdminCompany => c !== null);
    if (companies.length > 0) return companies;
    if (useDummy()) return DUMMY_COMPANIES;
    throw new Error("Companies response was in an unexpected format.");
  } catch (err) {
    if (useDummy()) return DUMMY_COMPANIES;
    throw apiError(err, "Could not load companies.");
  }
}

export async function fetchAdminWorkflows(): Promise<AdminWorkflow[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<AdminWorkflow[] | Paginated<AdminWorkflow>>>(
      endpoints.admin.workflows,
    );
    assertSuccess(data);
    const raw = unwrap(data);
    const list = Array.isArray(raw) ? raw : (raw as Paginated<AdminWorkflow>).items;
    const workflows = (list ?? []).map(normalizeWorkflow).filter((w): w is AdminWorkflow => w !== null);
    if (workflows.length > 0) return workflows;
    if (useDummy()) return DUMMY_WORKFLOWS;
    throw new Error("Workflows response was in an unexpected format.");
  } catch (err) {
    if (useDummy()) return DUMMY_WORKFLOWS;
    throw apiError(err, "Could not load workflows.");
  }
}

export async function fetchAdminAiModels(): Promise<AdminAiModel[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<AdminAiModel[]>>(
      endpoints.admin.aiModels,
    );
    assertSuccess(data);
    const raw = unwrap(data);
    const list = Array.isArray(raw) ? raw : [];
    const models = list.map(normalizeAiModel).filter((m): m is AdminAiModel => m !== null);
    if (models.length > 0) return models;
    if (useDummy()) return [...DUMMY_AI_MODELS];
    throw new Error("AI models response was in an unexpected format.");
  } catch (err) {
    if (useDummy()) return [...DUMMY_AI_MODELS];
    throw apiError(err, "Could not load AI models.");
  }
}

export async function createAdminAiModel(payload: CreateAiModelPayload): Promise<AdminAiModel> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<AdminAiModel>>(
      endpoints.admin.aiModels,
      payload,
    );
    return unwrap(data);
  } catch (err) {
    if (useDummy()) {
      return {
        id: `m_${Date.now()}`,
        name: payload.name,
        provider: payload.provider,
        modelId: payload.modelId,
        apiKeyMasked: "••••••••",
        enabled: payload.enabled ?? true,
        usageCount: 0,
        updatedAt: new Date().toISOString(),
      };
    }
    throw apiError(err, "Could not add AI model.");
  }
}

export async function updateAdminAiModel(
  id: string,
  payload: UpdateAiModelPayload,
): Promise<AdminAiModel> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<AdminAiModel>>(
      endpoints.admin.aiModel(id),
      payload,
    );
    return unwrap(data);
  } catch (err) {
    if (useDummy()) {
      const existing = DUMMY_AI_MODELS.find((m) => m.id === id);
      if (!existing) throw new Error("Model not found.");
      return { ...existing, ...payload, apiKeyMasked: existing.apiKeyMasked, updatedAt: new Date().toISOString() };
    }
    throw apiError(err, "Could not update AI model.");
  }
}

export async function toggleAdminAiModel(id: string, enabled: boolean): Promise<void> {
  try {
    await apiClient.patch(endpoints.admin.aiModelToggle(id), { enabled });
  } catch (err) {
    if (useDummy()) return;
    throw apiError(err, "Could not toggle AI model.");
  }
}

export async function deleteAdminAiModel(id: string): Promise<void> {
  try {
    await apiClient.delete(endpoints.admin.aiModel(id));
  } catch (err) {
    if (useDummy()) return;
    throw apiError(err, "Could not remove AI model.");
  }
}
