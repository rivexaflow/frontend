import { apiClient } from "./client";
import { assertApiSuccess, unwrapApiData, toApiError } from "./api-envelope";

export interface AdminLicenseRecord {
  id: string;
  key: string;
  tier: string;
  maxUsers: number;
  maxInstances: number;
  allowedModules: string;
  status: string;
  expiresAt: string | null;
  issuedAt: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
    customDomain: string | null;
    logo: string | null;
  };
  instances?: Array<{
    id: string;
    instanceId: string;
    hostname: string | null;
    serverIp: string | null;
    nodeVersion: string | null;
    status: string;
    lastHeartbeatAt: string;
  }>;
}

export interface PaginatedAdminLicenses {
  licenses: AdminLicenseRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchAdminLicenses(params: { page?: number; limit?: number; status?: string } = {}): Promise<PaginatedAdminLicenses> {
  try {
    const { data } = await apiClient.get<any>("/api/admin/licenses", {
      params: {
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status || undefined,
      },
    });
    assertApiSuccess(data);
    return {
      licenses: data.data || [],
      pagination: data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  } catch (err) {
    throw toApiError(err, "Could not fetch platform licenses.");
  }
}

export async function createAdminLicense(payload: {
  companyId: string;
  tier?: string;
  maxUsers?: number;
  maxInstances?: number;
  allowedModules?: string[];
  expiresInDays?: number;
}): Promise<AdminLicenseRecord> {
  try {
    const { data } = await apiClient.post<any>("/api/admin/licenses", payload);
    assertApiSuccess(data);
    return unwrapApiData(data);
  } catch (err) {
    throw toApiError(err, "Could not generate new license key.");
  }
}

export async function updateAdminLicenseStatus(id: string, status: string): Promise<AdminLicenseRecord> {
  try {
    const { data } = await apiClient.patch<any>(`/api/admin/licenses/${id}/status`, { status });
    assertApiSuccess(data);
    return unwrapApiData(data);
  } catch (err) {
    throw toApiError(err, "Could not update license status.");
  }
}

export async function fetchPlatformCompanies(): Promise<Array<{ id: string; name: string }>> {
  try {
    const { data } = await apiClient.get<any>("/api/company");
    assertApiSuccess(data);
    const list = unwrapApiData(data);
    if (!Array.isArray(list)) return [];
    return list.map((c: any) => ({ id: c.id, name: c.name }));
  } catch (err) {
    return [];
  }
}

export async function fetchWhitelabelConfig(companyId?: string): Promise<any> {
  try {
    const { data } = await apiClient.get<any>("/api/whitelabel/config", {
      params: { companyId },
    });
    assertApiSuccess(data);
    return unwrapApiData(data);
  } catch (err) {
    throw toApiError(err, "Could not load whitelabel configuration.");
  }
}

export async function updateWhitelabelConfig(companyId: string, payload: any): Promise<any> {
  try {
    const { data } = await apiClient.put<any>("/api/company/whitelabel", {
      companyId,
      ...payload,
    });
    assertApiSuccess(data);
    return unwrapApiData(data);
  } catch (err) {
    throw toApiError(err, "Could not update whitelabel configuration.");
  }
}
